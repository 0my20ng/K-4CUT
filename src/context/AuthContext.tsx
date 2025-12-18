/**
 * @file AuthContext.tsx
 * @description 사용자 인증 상태를 전역으로 관리하는 Context Provider입니다.
 * 로그인, 로그아웃, 사용자 정보 로드 기능을 제공합니다.
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { User, AuthResponse } from '@/types';
import { useRouter } from 'next/navigation';

// Context 값 타입 정의
interface AuthContextType {
    user: User | null;          // 현재 로그인한 사용자 정보
    loading: boolean;           // 초기 로딩 상태
    login: (data: AuthResponse) => void; // 로그인 처리 함수
    logout: () => void;         // 로그아웃 처리 함수
    refreshUser: () => Promise<void>; // 사용자 정보 새로고침 함수
    isAuthenticated: boolean;   // 인증 여부
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider 컴포넌트
 * 애플리케이션 최상위를 감싸어 인증 상태를 공유합니다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /**
     * 사용자 정보 가져오기 (토큰 사용)
     */
    const refreshUser = async () => {
        try {
            const response = await api.get('/api/v1/auth/me');
            // API에서 크레딧 정보를 주지 않으므로 임시로 Mocking (예: 5크레딧)
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            // 사용자 정보 로드 실패 시 로그아웃 처리 (토큰 만료 등)
            logout();
        } finally {
            setLoading(false);
        }
    };

    // 초기 로드 시 로컬 스토리지 확인하여 토큰이 있으면 사용자 정보 로드
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            refreshUser();
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * 로그인 성공 처리
     * 토큰을 저장하고 사용자 정보를 불러옵니다.
     */
    const login = (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        refreshUser();
        router.push('/'); // Redirect to home after login
    };

    /**
     * 로그아웃 처리
     * 토큰 및 사용자 정보 삭제, 로그인 페이지로 이동
     */
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth 훅
 * 컴포넌트에서 쉽게 AuthContext를 사용할 수 있게 해줍니다.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
