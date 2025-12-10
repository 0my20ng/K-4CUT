"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    type?: 'default' | 'danger';
}

export default function Modal({ isOpen, onClose, title, children, footer, type = 'default' }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="w-full max-w-md bg-background border border-secondary/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between p-4 border-b border-secondary/10">
                    <div className="flex items-center gap-2">
                        {type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-secondary/10 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>

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
