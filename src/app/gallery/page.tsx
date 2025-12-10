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
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await api.get('/api/v1/images/');
                setImages(response.data);
            } catch (error) {
                console.error('Failed to load gallery', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchImages();
        }
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-baseline justify-between border-b border-foreground/10 pb-4">
                <h1 className="text-4xl font-black tracking-tighter">MY GALLERY</h1>
                <span className="text-secondary font-mono">{images.length} MEMORIES</span>
            </div>

            {images.length === 0 ? (
                <div className="text-center py-20 bg-secondary/5 border border-dashed border-secondary/20">
                    <p className="text-secondary mb-4">No images found yet.</p>
                    <button
                        onClick={() => router.push('/create')}
                        className="text-primary font-bold hover:underline"
                    >
                        Create your first K4CUT
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map(img => (
                        <div key={img.id} className="group relative aspect-[3/4] bg-secondary/5 cursor-pointer overflow-hidden border border-transparent hover:border-foreground/10 transition-all">
                            <Image
                                src={img.url}
                                alt="Gallery Item"
                                fill
                                unoptimized
                                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-white text-xs font-mono">{new Date(img.created_at).toLocaleDateString()}</p>
                                <a
                                    href={img.url}
                                    download={`k4cut-${img.id}.jpg`}
                                    target="_blank"
                                    className="text-white text-xs font-bold mt-1 block hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    DOWNLOAD
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
