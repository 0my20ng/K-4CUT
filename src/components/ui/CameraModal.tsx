"use client";

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, RefreshCw } from 'lucide-react';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageSrc: string) => void;
}

const videoConstraints = {
    width: 720,
    height: 960,
    facingMode: "user"
};

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
    const webcamRef = useRef<any>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    const confirm = () => {
        if (imgSrc) {
            onCapture(imgSrc);
            onClose();
            setImgSrc(null); // Reset for next time
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white p-1 rounded-sm shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10">
                    <h3 className="text-lg font-black uppercase tracking-wider">Camera</h3>
                    <button onClick={onClose} className="text-secondary hover:text-black transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Camera Area */}
                <div className="relative aspect-[3/4] bg-black group overflow-hidden">
                    {imgSrc ? (
                        <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                            mirrored={true}
                        />
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white border-t border-gray-100 flex justify-center gap-4">
                    {imgSrc ? (
                        <>
                            <button
                                onClick={retake}
                                className="flex-1 py-3 border border-secondary text-secondary font-bold uppercase tracking-widest hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                RETAKE
                            </button>
                            <button
                                onClick={confirm}
                                className="flex-1 py-3 bg-black text-white font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                USE THIS
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={capture}
                            className="w-full py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-3 text-lg"
                        >
                            <Camera size={24} />
                            SHOOT
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
