/**
 * @file api.ts
 * @description Axios를 사용한 API 클라이언트 설정 파일입니다.
 * 기본 URL, 요청/응답 인터셉터, 토큰 관리(자동 갱신) 로직을 포함합니다.
 */

import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.k4cut.com/', // 환경변수 또는 기본 URL 사용
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 요청 인터셉터
 * 모든 요청에 저장된 Access Token을 Authorization 헤더에 추가합니다.
 */
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 응답 인터셉터
 * 401 Unauthorized 에러 발생 시 Refresh Token을 사용하여 Access Token 갱신을 시도합니다.
 */
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 401 에러이고 아직 재시도하지 않은 요청인 경우 토큰 갱신 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // 토큰 갱신 API 호출
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.k4cut.com/'}/api/v1/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token, refresh_token } = response.data;

                // 새 토큰 저장
                localStorage.setItem('accessToken', access_token);
                localStorage.setItem('refreshToken', refresh_token);

                // 원래 요청 헤더 업데이트 및 재요청
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // 토큰 갱신 실패 시 로그아웃 처리 및 로그인 페이지로 이동
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
