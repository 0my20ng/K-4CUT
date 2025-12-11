/**
 * @file login/page.tsx
 * @description 사용자 로그인을 위한 페이지 컴포넌트입니다.
 * 이메일과 비밀번호를 입력받아 인증을 수행하고, 성공 시 홈으로 리다이렉트합니다.
 */

"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // 인증 상태 사용을 위한 훅
import api from '@/lib/api'; // 백엔드 통신을 위한 API 클라이언트
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * LoginPage 컴포넌트
 */
export default function LoginPage() {
    // 상태 관리: 이메일, 비밀번호, 에러 메시지, 로딩 상태
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // AuthContext에서 로그인 함수 가져오기
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    /**
     * 로그인 폼 제출 핸들러
     * @param e - 폼 이벤트 객체
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 로그인 API 호출
            const response = await api.post('/api/v1/auth/login', {
                email,
                password,
            });
            // 로그인 성공 시 컨텍스트의 로그인 함수 호출 (토큰 저장 및 상태 업데이트)
            login(response.data);
        } catch (err: unknown) {
            // 에러 처리: API 응답에서 에러 메시지를 추출하여 표시
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            console.error(error);
            setError(error.response?.data?.detail || '로그인에 실패했습니다. 정보를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* 헤더 섹션 */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter">LOGIN</h1>
                    <p className="text-secondary text-sm">Welcome back to K4CUT</p>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 에러 메시지 표시 영역 */}
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 border border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* 이메일 입력 필드 */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Email</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {/* 비밀번호 입력 필드 */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 로그인 버튼: 로딩 중일 때 비활성화 */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary h-12 text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {/* 회원가입 링크 */}
                    <p className="text-center text-sm text-secondary">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
