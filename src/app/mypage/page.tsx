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
        <div className="min-h-[calc(100vh-4rem)] bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">MY PAGE</h1>
                    <p className="mt-2 text-secondary">계정 정보를 관리하세요.</p>
                </div>

                <div className="bg-card rounded-2xl border border-secondary/20 p-8 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold mb-1">이메일</h2>
                        <p className="font-mono text-secondary">{user.email}</p>
                    </div>

                    <div className="pt-6 border-t border-secondary/10">
                        <h2 className="text-lg font-bold text-red-500 mb-2">위험 구역</h2>
                        <p className="text-sm text-secondary mb-4">
                            계정을 삭제하면 모든 사진과 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                        </p>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-bold"
                        >
                            <Trash2 className="w-4 h-4" />
                            회원 탈퇴
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
                            className="px-4 py-2 text-sm font-bold text-secondary hover:text-foreground transition-colors"
                            disabled={isDeleting}
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "탈퇴 처리 중..." : "확인 (탈퇴)"}
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-foreground">
                        정말 탈퇴하시겠습니까?
                    </p>
                    <p className="text-secondary text-sm">
                        생성한 모든 네컷 사진과 데이터가 <span className="text-red-500 font-bold">영구적으로 삭제</span>되며 복구할 수 없습니다.
                    </p>
                    {error && (
                        <p className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-lg">
                            {error}
                        </p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
