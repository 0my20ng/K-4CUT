"use client";

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Optional but good to have
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // API expects: email, password, username, full_name
            await api.post('/api/v1/auth/register', {
                email,
                password,
                username: username || email.split('@')[0],
            });

            // Auto login or redirect to login? 
            // User said "Login functionality should work with pre-registered email/password"
            // Let's redirect to login for simplicity and clarity.
            router.push('/login?registered=true');
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            console.error(error);
            // Handle array of errors or string
            const detail = error.response?.data?.detail;
            const errorMsg = Array.isArray(detail) ? detail[0].msg : (detail || 'Registration failed.');
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter">CREATE ACCOUNT</h1>
                    <p className="text-secondary text-sm">Join K4CUT and make your memories</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 border border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary h-12 text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

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
