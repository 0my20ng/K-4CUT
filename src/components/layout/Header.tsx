"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <header className="border-b border-border bg-background sticky top-0 z-50">
            <div className="container-custom h-20 flex items-center justify-between">
                <Link href="/" className="text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity">
                    K4CUT
                </Link>

                {!isAuthPage && (
                    <nav className="flex items-center gap-4">
                        <Link href="/gallery" className="btn-secondary text-sm px-4 py-2 border-primary hover:bg-primary hover:text-white transition-colors">
                            GALLERY
                        </Link>
                        <Link href="/create" className="btn-primary text-sm px-4 py-2">
                            GENERATE
                        </Link>

                        <div className="h-4 w-px bg-border mx-2" />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-primary font-bold hidden md:block">
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
                )}
            </div>
        </header>
    );
}
