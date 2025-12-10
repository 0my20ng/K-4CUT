"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <header className="border-b border-secondary/20 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="container-custom h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
                    K4CUT .
                </Link>

                {!isAuthPage && (
                    <nav className="flex items-center gap-6 md:gap-8">
                        <Link href="/gallery" className="text-sm font-bold tracking-wide hover:text-secondary transition-colors">
                            GALLERY
                        </Link>
                        <Link href="/create" className="text-sm font-bold tracking-wide hover:text-secondary transition-colors">
                            PHOTO BOOTH
                        </Link>

                        <div className="h-4 w-px bg-secondary/20" />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-secondary hidden md:block">
                                    {user.email}
                                </span>
                                <button
                                    onClick={logout}
                                    className="text-sm font-bold tracking-wide hover:text-secondary transition-colors"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-bold tracking-wide hover:text-secondary transition-colors">
                                    LOGIN
                                </Link>
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
