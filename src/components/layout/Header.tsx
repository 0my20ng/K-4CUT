/**
 * @file Header.tsx
 * @description 애플리케이션의 상단 헤더 컴포넌트입니다.
 * 로고, 네비게이션 링크, 로그인/로그아웃 버튼 등을 포함합니다.
 */

"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // 인증 상태
import { usePathname } from 'next/navigation'; // 현재 경로 확인

/**
 * Header 컴포넌트
 */
export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // 로그인 및 회원가입 페이지에서는 네비게이션을 일부 숨길 수 있음 (현재 로직상 전체 숨김 처리 여부는 아래 조건문에서 결정)
    // 여기서는 isAuthPage가 true일 때 네비게이션을 아예 렌더링하지 않도록 되어 있음.
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <header className="border-b border-secondary/20 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="container-custom h-16 flex items-center justify-between">
                {/* 로고 링크 */}
                <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
                    K4CUT .
                </Link>

                {/* 인증 페이지가 아닐 경우에만 네비게이션 표시 */}
                {!isAuthPage && (
                    <nav className="flex items-center gap-6 md:gap-8">
                        {/* 갤러리 링크 */}
                        <Link href="/gallery" className="text-sm font-bold tracking-wide hover:text-secondary transition-colors">
                            GALLERY
                        </Link>
                        {/* 포토부스(생성) 링크 */}
                        <Link href="/create" className="text-sm font-bold tracking-wide hover:text-secondary transition-colors">
                            PHOTO BOOTH
                        </Link>

                        <div className="h-4 w-px bg-secondary/20" />

                        {/* 사용자 로그인 상태에 따른 메뉴 분기 */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                {/* 사용자 이메일 표시 (모바일 제외) */}
                                <span className="text-xs font-mono text-secondary hidden md:block">
                                    {user.email}
                                </span>
                                {/* 마이페이지 링크 */}
                                <Link href="/mypage" className="text-sm font-bold tracking-wide hover:text-secondary transition-colors">
                                    MY PAGE
                                </Link>
                                {/* 로그아웃 버튼 */}
                                <button
                                    onClick={logout}
                                    className="text-sm font-bold tracking-wide hover:text-secondary transition-colors"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                {/* 로그인 링크 */}
                                <Link href="/login" className="text-sm font-bold tracking-wide hover:text-secondary transition-colors">
                                    LOGIN
                                </Link>
                                {/* 회원가입 버튼 */}
                                <Link href="/signup" className="btn-primary text-sm">
                                    SIGN UP
                                </Link>
                            </div>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
