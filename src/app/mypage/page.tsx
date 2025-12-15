/**
 * @file mypage/page.tsx
 * @description 마이페이지 컴포넌트입니다.
 * 사용자의 계정 정보를 표시하고 회원 탈퇴 기능을 제공합니다.
 */

"use client";

import { useAuth } from '@/context/AuthContext'; // 인증 상태 훅
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api'; // 백엔드 API
import Modal from '@/components/ui/Modal'; // 공통 모달 컴포넌트
import { Trash2, Lock } from 'lucide-react'; // 아이콘

/**
 * MyPage 컴포넌트
 */
export default function MyPage() {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    // 회원 탈퇴 모달 상태 관리
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 비밀번호 변경 모달 상태 관리
    const [isPwChangeModalOpen, setIsPwChangeModalOpen] = useState(false);
    const [pwChangeForm, setPwChangeForm] = useState({ current_password: '', new_password: '' });
    const [isPwChanging, setIsPwChanging] = useState(false);
    const [pwChangeError, setPwChangeError] = useState<string | null>(null);

    // 미인증 사용자 로그인 페이지로 리다이렉트
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // 로딩 상태 UI
    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    /**
     * 회원 탈퇴 처리 함수
     */
    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            // 회원 탈퇴 API 호출
            await api.delete('/api/v1/users/me');

            // 모달 닫기 및 로그아웃 처리
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

    /**
     * 비밀번호 변경 처리 함수
     */
    const handleChangePassword = async () => {
        if (!pwChangeForm.current_password || !pwChangeForm.new_password) {
            setPwChangeError("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
            return;
        }

        if (pwChangeForm.new_password.length < 8) {
            setPwChangeError("새 비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        setIsPwChanging(true);
        setPwChangeError(null);

        try {
            await api.post('/api/v1/auth/change-password', {
                current_password: pwChangeForm.current_password,
                new_password: pwChangeForm.new_password
            });

            alert("비밀번호가 성공적으로 변경되었습니다.");
            setIsPwChangeModalOpen(false);
            setPwChangeForm({ current_password: '', new_password: '' });
        } catch (err: any) {
            console.error(err);
            setPwChangeError(err.response?.data?.message || "비밀번호 변경에 실패했습니다.");
        } finally {
            setIsPwChanging(false);
        }
    };


    return (
        <div className="container-custom py-12 px-4 min-h-[calc(100vh-8rem)]">
            <div className="max-w-xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tight uppercase">My Profile</h1>
                    <p className="text-secondary font-light">계정 정보를 관리하세요.</p>
                </div>

                <div className="border border-border p-8 space-y-8 bg-white/50 text-center md:text-left">
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

                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Security</h2>
                        <button
                            onClick={() => setIsPwChangeModalOpen(true)}
                            className="w-full py-4 border border-border hover:bg-secondary/5 transition-colors text-left px-4 flex items-center justify-between group"
                        >
                            <span className="font-mono text-lg group-hover:underline">CHANGE PASSWORD</span>
                            <Lock className="w-4 h-4 text-secondary" />
                        </button>
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

            {/* 회원 탈퇴 확인 모달 */}
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


            {/* 비밀번호 변경 모달 */}
            <Modal
                isOpen={isPwChangeModalOpen}
                onClose={() => setIsPwChangeModalOpen(false)}
                title="비밀번호 변경"
                footer={
                    <>
                        <button
                            onClick={() => setIsPwChangeModalOpen(false)}
                            className="px-6 py-2 text-sm font-bold text-secondary hover:text-foreground transition-colors uppercase tracking-widest"
                            disabled={isPwChanging}
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleChangePassword}
                            className="px-6 py-2 text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                            disabled={isPwChanging}
                        >
                            {isPwChanging ? "CHANGING..." : "CONFIRM CHANGE"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-secondary">Current Password</label>
                        <input
                            type="password"
                            value={pwChangeForm.current_password}
                            onChange={(e) => setPwChangeForm({ ...pwChangeForm, current_password: e.target.value })}
                            className="w-full p-3 bg-secondary/5 border border-border focus:outline-none focus:border-black font-mono text-sm transition-colors"
                            placeholder="현재 비밀번호"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-secondary">New Password</label>
                        <input
                            type="password"
                            value={pwChangeForm.new_password}
                            onChange={(e) => setPwChangeForm({ ...pwChangeForm, new_password: e.target.value })}
                            className="w-full p-3 bg-secondary/5 border border-border focus:outline-none focus:border-black font-mono text-sm transition-colors"
                            placeholder="새 비밀번호 (8자 이상)"
                        />
                    </div>
                    {pwChangeError && (
                        <p className="text-red-500 text-sm font-bold bg-red-50 p-3 border border-red-100">
                            {pwChangeError}
                        </p>
                    )}
                </div>
            </Modal>
        </div >
    );
}
