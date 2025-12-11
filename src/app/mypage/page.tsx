"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { Trash2 } from 'lucide-react';

export default function MyPage() {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await api.delete('/api/v1/users/me');
            setIsDeleteModalOpen(false);
            logout();
            alert("회원 탈퇴가 완료되었습니다.");
            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "회원 탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <div className="container-custom py-12 px-4 min-h-[calc(100vh-8rem)]">
            <div className="max-w-xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tight uppercase">My Profile</h1>
                    <p className="text-secondary font-light">계정 정보를 관리하세요.</p>
                </div>

                <div className="border border-border p-8 space-y-8 bg-white/50">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Username</h2>
                        <div className="p-4 bg-secondary/5 border border-border text-lg font-mono">
                            {user.username || '설정되지 않음'}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Email</h2>
                        <div className="p-4 bg-secondary/5 border border-border text-lg font-mono">
                            {user.email}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border">
                        <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">Danger Zone</h2>
                        <p className="text-sm text-secondary mb-6 leading-relaxed">
                            계정을 삭제하면 모든 사진과 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                        </p>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            DELETE ACCOUNT
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="회원 탈퇴 확인"
                type="danger"
                footer={
                    <>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-6 py-2 text-sm font-bold text-secondary hover:text-foreground transition-colors uppercase tracking-widest"
                            disabled={isDeleting}
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "DELETING..." : "CONFIRM DELETE"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-4">
                    <p className="text-foreground">
                        정말 탈퇴하시겠습니까?
                    </p>
                    <p className="text-secondary text-sm">
                        생성한 모든 네컷 사진과 데이터가 <span className="text-red-600 font-bold">영구적으로 삭제</span>되며 복구할 수 없습니다.
                    </p>
                    {error && (
                        <p className="text-red-500 text-sm font-bold bg-red-50 p-3 border border-red-100">
                            {error}
                        </p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
