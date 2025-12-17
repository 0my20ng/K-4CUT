/**
 * @file Header.tsx
 * @description 애플리케이션의 상단 헤더 컴포넌트입니다.
 * 로고, 네비게이션 링크, 로그인/로그아웃 버튼 등을 포함합니다.
 */

"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, CreditCard, Zap } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

/**
 * Header 컴포넌트
 */
export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // 로그인 및 회원가입 페이지에서는 네비게이션을 일부 숨길 수 있음 (현재 로직상 전체 숨김 처리 여부는 아래 조건문에서 결정)
    // 여기서는 isAuthPage가 true일 때 네비게이션을 아예 렌더링하지 않도록 되어 있음.
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="border-b border-border bg-background sticky top-0 z-50">
            <div className="container-custom h-20 flex items-center justify-between">
                <Link href="/" className="text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity z-50 relative">
                    K4CUT
                </Link>

                {/* 인증 페이지가 아닐 경우에만 네비게이션 표시 */}
                {!isAuthPage && (
                    <>
                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-4">
                            <Link href="/gallery" className="btn-secondary text-sm px-4 py-2 border-primary hover:bg-primary hover:text-white transition-colors">
                                GALLERY
                            </Link>
                            <Link href="/create" className="btn-primary text-sm px-4 py-2">
                                GENERATE
                            </Link>

                            <div className="h-4 w-px bg-border mx-2" />

                            {user ? (
                                <div className="flex items-center gap-4">
                                    {/* Credit Display */}
                                    <CreditDisplay user={user} />

                                    <span className="text-xs font-mono text-primary font-bold">
                                        {(user.username || user.email)}
                                    </span>
                                    <Link href="/mypage" className="btn-secondary text-sm px-4 py-2 border-primary hover:bg-primary hover:text-white transition-colors">
                                        MY PAGE
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="btn-secondary text-sm px-4 py-2 border-primary hover:bg-primary hover:text-white transition-colors"
                                    >
                                        LOGOUT
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="btn-secondary text-sm px-4 py-2 border-primary hover:bg-primary hover:text-white transition-colors">
                                        LOGIN
                                    </Link>
                                    <Link href="/signup" className="btn-primary text-sm px-4 py-2">
                                        SIGN UP
                                    </Link>
                                </div>
                            )}
                        </nav>

                        {/* Mobile Credit Display (Next to Hamburger) */}
                        {user && (
                            <div className="md:hidden mr-1">
                                <CreditDisplay user={user} align="right" />
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button onClick={toggleMenu} className="md:hidden z-50 p-2 text-primary">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>

                        {/* Mobile Nav Overlay */}
                        {isMenuOpen && (
                            <div className="fixed inset-0 bg-background z-40 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-right duration-300">
                                <Link href="/gallery" className="text-2xl font-bold uppercase tracking-widest hover:text-secondary transition-colors">
                                    GALLERY
                                </Link>
                                <Link href="/create" className="text-2xl font-bold uppercase tracking-widest hover:text-secondary transition-colors text-primary">
                                    GENERATE
                                </Link>

                                <div className="w-12 h-px bg-border my-4" />

                                {user ? (
                                    <>
                                        <span className="text-sm font-mono text-secondary mb-4">
                                            {(user.username || user.email)}
                                        </span>

                                        <Link href="/mypage" className="text-xl font-bold uppercase tracking-widest hover:text-secondary transition-colors">
                                            MY PAGE
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="text-xl font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
                                        >
                                            LOGOUT
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="text-xl font-bold uppercase tracking-widest hover:text-secondary transition-colors">
                                            LOGIN
                                        </Link>
                                        <Link href="/signup" className="text-xl font-bold uppercase tracking-widest hover:text-secondary transition-colors">
                                            SIGN UP
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </header>
    );
}

function CreditDisplay({ user, align = 'left' }: { user: any, align?: 'left' | 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleToggle = () => {
        if (!isOpen) {
            setLoading(true);
            api.get('/api/v1/payments/subscriptions')
                .then(res => {
                    if (res.data.subscriptions && res.data.subscriptions.length > 0) {
                        setSubscription(res.data.subscriptions[0]);
                    } else {
                        setSubscription(null);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="flex items-center gap-2 bg-secondary/10 hover:bg-secondary/20 transition-colors px-3 py-1.5 rounded-full"
            >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-black font-mono tracking-tighter">{user.credits || 0}</span>
                <span className="text-[10px] font-bold text-secondary uppercase">CRD</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={cn(
                        "absolute top-full mt-2 w-64 bg-background border border-border p-4 shadow-xl z-50 animate-in fade-in zoom-in duration-200",
                        align === 'right' ? "right-0" : "left-0"
                    )}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <span className="text-xs font-bold uppercase text-secondary">My Wallet</span>
                                <span className="text-xl font-black">{user.credits || 0}</span>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase text-secondary block">Subscription</span>
                                {loading ? (
                                    <div className="text-xs text-secondary animate-pulse">Loading...</div>
                                ) : subscription ? (
                                    <div className="bg-secondary/5 p-2 border border-border">
                                        <p className="font-bold text-sm text-primary">{subscription.product_name}</p>
                                        <p className="text-[10px] text-secondary uppercase">{subscription.status}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-secondary/60">구독 중인 상품이 없습니다.</p>
                                )}
                            </div>

                            <Link
                                href="/payment"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                            >
                                <Zap size={12} />
                                Recharge Credits
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
