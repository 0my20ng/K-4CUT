"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ImageMetadata } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GalleryPage() {
    const [images, setImages] = useState<ImageMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchImages = async () => {
        try {
            // Filter by folder 'generated' if possible, otherwise we filter client-side or assume specific folder usage
            // The user requested to only show generated photos.
            // Let's try to fetch all and filter in client if the API behavior is not strictly separate folders yet,
            // or pass parameter if supported. The openapi says 'folder' param is supported.
            // However, to be safe and precise, we can check if 'generated' folder is what is used for output.
            // Based on openapi: "Generated images: `generated/YYYYMMDD/uuid.ext`"
            const response = await api.get('/api/v1/images/', {
                params: { folder: 'generated' }
            });
            // If the API returns a flat list even with folder param (sometimes APIs do fuzzy match), we can double check:
            // But let's trust the API first.
            setImages(response.data);
        } catch (error) {
            console.error('Failed to load gallery', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchImages();
        }
    }, [user]);

    const handleDelete = async (e: React.MouseEvent, imageId: string) => {
        e.stopPropagation();
        if (!confirm('정말 이 사진을 삭제하시겠습니까?')) return;

        try {
            await api.delete(`/api/v1/images/${imageId}`);
            setImages(prev => prev.filter(img => img.id !== imageId));
            if (selectedImage?.id === imageId) setSelectedImage(null);
        } catch (error) {
            console.error('Failed to delete image', error);
            alert('사진 삭제에 실패했습니다.');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('모든 사진을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        try {
            await api.delete('/api/v1/images/all');
            setImages([]);
        } catch (error) {
            console.error('Failed to delete all images', error);
            alert('전체 삭제에 실패했습니다.');
        }
    };

    const handleDownload = async (e: React.MouseEvent, img: ImageMetadata) => {
        e.stopPropagation();
        try {
            const response = await fetch(img.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `k4cut-${img.id}.${img.format?.toLowerCase() || 'jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed', error);
            // Fallback for cross-origin or if fetch fails
            window.open(img.url, '_blank');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
        );
    }

    return (
        <div className="container-custom space-y-12 animate-in fade-in duration-500 relative py-12">
            <div className="flex flex-col md:flex-row items-center md:items-baseline justify-between border-b border-foreground pb-6 gap-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Gallery</h1>
                    <span className="text-secondary font-mono text-sm tracking-widest">{images.length} MEMORIES</span>
                </div>
                {images.length > 0 && (
                    <button
                        onClick={handleDeleteAll}
                        className="text-red-500 hover:text-white hover:bg-red-500 text-xs font-bold px-4 py-2 border border-red-500 transition-colors uppercase tracking-widest"
                    >
                        Delete All
                    </button>
                )}
            </div>

            {images.length === 0 ? (
                <div className="text-center py-40 border border-dashed border-border text-secondary/50">
                    <p className="mb-8 text-lg font-light tracking-wide">NO MEMORIES YET</p>
                    <button
                        onClick={() => router.push('/create')}
                        className="btn-primary"
                    >
                        CREATE YOUR FIRST K4CUT
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {images.map(img => (
                        <div
                            key={img.id}
                            onClick={() => setSelectedImage(img)}
                            className="group relative cursor-pointer overflow-hidden border border-border hover:border-primary transition-all shadow-sm hover:shadow-none"
                        >
                            <div className="aspect-[3/4] relative">
                                <Image
                                    src={img.url}
                                    alt="Gallery Item"
                                    fill
                                    unoptimized
                                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 ease-in-out"
                                />
                            </div>

                            {/* Overlay Actions */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-center">
                                <span className="text-white/70 text-xs font-mono">
                                    {new Date(img.created_at).toLocaleDateString()}
                                </span>
                                <div className="flex gap-4">
                                    <button
                                        onClick={(e) => handleDownload(e, img)}
                                        className="text-white hover:text-primary transition-colors"
                                        title="Download"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, img.id)}
                                        className="text-white hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full View Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 p-4 animate-in fade-in duration-200 backdrop-blur-md"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <div className="relative w-full h-full flex items-center justify-center p-8">
                            <img
                                src={selectedImage.url}
                                alt="Full View"
                                className="max-w-full max-h-[80vh] object-contain shadow-2xl border border-border"
                            />
                        </div>

                        <div className="flex gap-6 mt-8">
                            <button
                                onClick={(e) => handleDownload(e, selectedImage)}
                                className="btn-primary flex items-center gap-2 px-8"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                DOWNLOAD
                            </button>
                            <button
                                onClick={(e) => handleDelete(e, selectedImage.id)}
                                className="px-8 py-3 bg-transparent border border-red-500 text-red-500 font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                DELETE
                            </button>
                        </div>

                        <button
                            className="absolute top-8 right-8 text-black hover:opacity-50 transition-opacity p-2"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
