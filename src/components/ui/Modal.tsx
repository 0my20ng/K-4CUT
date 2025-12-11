/**
 * @file Modal.tsx
 * @description 재사용 가능한 모달 다이얼로그 컴포넌트입니다.
 * React Portal을 사용하여 body 태그 직하위에 렌더링됩니다.
 */

"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react'; // 아이콘

interface ModalProps {
    isOpen: boolean;            // 모달 열림 여부
    onClose: () => void;        // 닫기 핸들러
    title: string;              // 모달 제목
    children: React.ReactNode;  // 모달 내용
    footer?: React.ReactNode;   // 모달 하단(버튼 등)
    type?: 'default' | 'danger'; // 모달 타입 (스타일링 용도)
}

/**
 * Modal 컴포넌트
 */
export default function Modal({ isOpen, onClose, title, children, footer, type = 'default' }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // ESC 키로 모달 닫기 및 스크롤 잠금 처리
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset'; // 스크롤 복원
        };
    }, [isOpen, onClose]);

    // 닫혀있으면 렌더링하지 않음
    if (!isOpen) return null;

    // React Portal: document.body에 렌더링
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* 모달 컨테이너 */}
            <div
                ref={modalRef}
                className="w-full max-w-md bg-background border border-secondary/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-secondary/10">
                    <div className="flex items-center gap-2">
                        {type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    </div>
                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-secondary/10 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="p-6">
                    {children}
                </div>

                {/* 푸터 */}
                {footer && (
                    <div className="p-4 bg-secondary/5 border-t border-secondary/10 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
