/**
 * @file signup/page.tsx
 * @description 사용자 회원가입을 위한 페이지 컴포넌트입니다.
 * 이메일, 비밀번호, 사용자명을 입력받아 새로운 계정을 생성합니다.
 */

"use client";

import { useState } from 'react';
import api from '@/lib/api'; // 백엔드 통신 API
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * SignupPage 컴포넌트
 */
export default function SignupPage() {
    // 상태 관리
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // 선택 사항이지만 권장됨
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    /**
     * 회원가입 폼 제출 핸들러
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 회원가입 API 호출
            // API 기대값: email, password, username, full_name(생략 시 username 사용 등)
            await api.post('/api/v1/auth/register', {
                email,
                password,
                username: username || email.split('@')[0], // username이 없으면 이메일 앞부분 사용
            });

            // 회원가입 성공 후 로그인 페이지로 이동
            // 쿼리 파라미터 registered=true를 전달하여 로그인 페이지에서 가입 성공 메시지를 보여줄 수도 있음
            router.push('/login?registered=true');
        } catch (err: unknown) {
            // 에러 처리
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            console.error(error);
            // 에러 메시지가 배열로 올 경우 첫 번째 메시지 사용, 아니면 일반 문자열 사용
            const detail = error.response?.data?.detail;
            const errorMsg = Array.isArray(detail) ? detail[0].msg : (detail || '회원가입에 실패했습니다.');
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* 헤더 섹션 */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter">CREATE ACCOUNT</h1>
                    <p className="text-secondary text-sm">Join K4CUT and make your memories</p>
                </div>

                {/* 회원가입 폼 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 에러 표시 */}
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 border border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* 이메일 입력 */}
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
                        {/* 사용자명 입력 (선택) */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Username (Optional)</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        {/* 비밀번호 입력 */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-[10px] text-secondary mt-1">Must be at least 8 characters</p>
                        </div>
                    </div>

                    {/* 가입 버튼 */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary h-12 text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    {/* 로그인 페이지 링크 */}
                    <p className="text-center text-sm text-secondary">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-bold hover:underline">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
