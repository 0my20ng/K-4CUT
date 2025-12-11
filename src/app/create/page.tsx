/**
 * @file create/page.tsx
 * @description AI 네 컷 사진 생성을 위한 메인 페이지 컴포넌트입니다.
 * 3단계 프로세스(사진 업로드 -> 포즈 선택 -> 결과 생성)를 관리합니다.
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api'; // API 클라이언트
import { useAuth } from '@/context/AuthContext'; // 인증 컨텍스트
import { useRouter } from 'next/navigation';
import { Upload, X, Camera, RefreshCw, Download, Check } from 'lucide-react'; // 아이콘 라이브러리
import { cn } from '@/lib/utils'; // 클래스 이름 결합 유틸리티
import Image from 'next/image';
import CameraModal from '@/components/ui/CameraModal';

// 포즈 데이터 인터페이스 정의
interface Pose {
    id: string;
    prompt_text: string;
    category?: string;
    description?: string;
}

/**
 * CreatePage 컴포넌트
 */
export default function CreatePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    // 현재 진행 단계 관리 (1: 업로드, 2: 포즈 선택, 3: 결과 확인)
    const [step, setStep] = useState(1);

    // --- Step 1: 업로드 관련 상태 ---
    const [files, setFiles] = useState<(File | null)[]>([null, null]); // 업로드된 파일 객체 배열
    const [previews, setPreviews] = useState<(string | null)[]>([null, null]); // 이미지 미리보기 URL 배열
    const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]; // 파일 입력 엘리먼트 참조

    // Camera
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [activeCameraIndex, setActiveCameraIndex] = useState<number | null>(null);

    const openCamera = (index: number) => {
        setActiveCameraIndex(index);
        setIsCameraOpen(true);
    };

    const handleCameraCapture = (imageSrc: string) => {
        if (activeCameraIndex === null) return;

        // Convert base64 to File
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

                const newFiles = [...files];
                newFiles[activeCameraIndex] = file;
                setFiles(newFiles);

                const newPreviews = [...previews];
                newPreviews[activeCameraIndex] = imageSrc;
                setPreviews(newPreviews);
            });
    };

    // Step 2: Poses
    const [poses, setPoses] = useState<Pose[]>([]);
    const [selectedPoseIds, setSelectedPoseIds] = useState<string[]>([]);
    const [loadingPoses, setLoadingPoses] = useState(false);

    // --- Step 3: 생성 결과 관련 상태 ---
    const [isGenerating, setIsGenerating] = useState(false); // 생성 진행 중 여부
    const [resultImage, setResultImage] = useState<string | null>(null); // 생성된 이미지 결과 (Base64 등)
    const [error, setError] = useState(''); // 에러 메시지

    // Model Selection
    const [model, setModel] = useState<'default' | 'pro'>('default');

    // Auth Protection
    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    // 포즈 목록 불러오기 (Step 2 진입 시)
    useEffect(() => {
        const fetchPoses = async () => {
            setLoadingPoses(true);
            try {
                const res = await api.get('/api/v1/prompts/poses?page_size=100');
                setPoses(res.data.items || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingPoses(false);
            }
        };
        if (step === 2) fetchPoses();
    }, [step]);

    // --- 핸들러 함수들 ---

    /**
     * 파일 변경 핸들러
     * 사용자가 이미지를 선택하면 상태를 업데이트하고 미리보기를 생성합니다.
     */
    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newFiles = [...files];
            newFiles[index] = file;
            setFiles(newFiles);

            const newPreviews = [...previews];
            newPreviews[index] = URL.createObjectURL(file);
            setPreviews(newPreviews);
        }
    };

    /**
     * 파일 제거 핸들러
     */
    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles[index] = null;
        setFiles(newFiles);

        const newPreviews = [...previews];
        if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!); // 메모리 누수 방지
        newPreviews[index] = null;
        setPreviews(newPreviews);

        if (fileInputRefs[index].current) fileInputRefs[index].current!.value = '';
    };

    /**
     * 포즈 선택 토글 핸들러
     * 최대 4개까지 선택 가능하도록 제어합니다.
     */
    const togglePose = (id: string) => {
        if (selectedPoseIds.includes(id)) {
            setSelectedPoseIds(prev => prev.filter(p => p !== id));
        } else {
            if (selectedPoseIds.length < 4) {
                setSelectedPoseIds(prev => [...prev, id]);
            }
        }
    };

    /**
     * 이미지 생성 요청 핸들러
     * 파일과 선택된 포즈 정보를 서버로 전송하여 AI 이미지를 생성합니다.
     */
    const generateImage = async () => {
        if (!files[0] || !files[1]) return;
        setIsGenerating(true);
        setResultImage(null);
        setError('');

        const formData = new FormData();
        formData.append('portrait1', files[0]);
        formData.append('portrait2', files[1]);
        formData.append('model', model);

        // 포즈 ID가 4개 선택되었을 경우에만 전송, 아니면 백엔드에서 랜덤 처리하도록 함 (혹은 요구사항에 따라 달라질 수 있음)
        if (selectedPoseIds.length === 4) {
            formData.append('pose_prompt_ids', JSON.stringify(selectedPoseIds));
        }

        try {
            // 생성 API 호출
            // 타임아웃을 2분으로 설정하여 AI 생성 시간 확보
            const res = await api.post('/api/v1/gemini/generate/frame', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            });

            if (res.data.image_base64) {
                // 결과 이미지 설정 및 단계 이동
                setResultImage(`data:${res.data.mime_type};base64,${res.data.image_base64}`);
                setStep(3);
            }
        } catch (err: unknown) {
            console.error(err);
            // 에러 처리
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorResponse = (err as any).response;
            setError(errorResponse?.data?.detail?.[0]?.msg || '이미지 생성에 실패했습니다. 다시 시도해주세요.');
            setIsGenerating(false);
        } finally {
            setIsGenerating(false);
        }
    };

    // 로딩 중이거나 미인증 시 렌더링 안 함 (useEffect에서 리다이렉트 처리됨)
    if (authLoading) return null;

    return (
        <div className="container-custom min-h-[calc(100vh-8rem)] py-12 animate-in fade-in duration-500">

            {/* Progress Indicator */}
            <div className="flex justify-center items-center mb-12 md:mb-16 space-x-2 md:space-x-12">
                <div className={cn("text-[10px] md:text-sm tracking-widest uppercase transition-colors", step >= 1 ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-secondary/40")}>01 Upload</div>
                <div className="w-4 md:w-8 h-px bg-border block" />
                <div className={cn("text-[10px] md:text-sm tracking-widest uppercase transition-colors", step >= 2 ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-secondary/40")}>02 Select</div>
                <div className="w-4 md:w-8 h-px bg-border block" />
                <div className={cn("text-[10px] md:text-sm tracking-widest uppercase transition-colors", step === 3 ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-secondary/40")}>03 Result</div>
            </div>

            {/* --- Step 1: 사진 업로드 화면 --- */}
            {step === 1 && (
                <div className="space-y-12 text-center animate-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black uppercase tracking-tight">Upload Photos</h2>
                        <p className="text-secondary font-light">두 장의 사진을 업로드하세요.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {[0, 1].map((idx) => (
                            <div key={idx} className="aspect-[3/4] relative border border-dashed border-secondary/30 hover:border-primary transition-colors flex flex-col items-center justify-center bg-secondary/5 group rounded-none">
                                {previews[idx] ? (
                                    <>
                                        <Image src={previews[idx]!} alt={`Preview ${idx}`} fill unoptimized className="object-cover" />
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-2 right-2 p-2 bg-black text-white hover:opacity-80 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                        <span className="text-xs font-bold tracking-widest uppercase mb-2">Select Photo {idx + 1}</span>
                                        <div className="flex flex-row gap-2 md:gap-4">
                                            <button
                                                onClick={() => fileInputRefs[idx].current?.click()}
                                                className="flex flex-col items-center gap-2 p-3 md:p-4 border border-secondary/20 hover:border-primary hover:bg-secondary/5 transition-all w-20 md:w-24 aspect-square justify-center"
                                            >
                                                <Upload size={20} strokeWidth={1.5} className="md:w-6 md:h-6" />
                                                <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase">UPLOAD</span>
                                            </button>
                                            <button
                                                onClick={() => openCamera(idx)}
                                                className="flex flex-col items-center gap-2 p-3 md:p-4 border border-secondary/20 hover:border-primary hover:bg-secondary/5 transition-all w-20 md:w-24 aspect-square justify-center"
                                            >
                                                <Camera size={20} strokeWidth={1.5} className="md:w-6 md:h-6" />
                                                <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase">CAMERA</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRefs[idx]}
                                    onChange={(e) => handleFileChange(idx, e)}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="max-w-2xl mx-auto mt-12 grid grid-cols-2 gap-6">
                        <button
                            onClick={() => setModel('default')}
                            className={cn(
                                "flex flex-col items-center p-6 border transition-all duration-300 rounded-none",
                                model === 'default'
                                    ? "border-primary bg-primary text-background"
                                    : "border-border hover:border-primary text-secondary hover:text-primary"
                            )}
                        >
                            <span className="text-xl font-bold tracking-wider mb-2">DEFAULT</span>
                            <span className="text-xs opacity-70">빠른 생성 속도</span>
                        </button>
                        <button
                            onClick={() => setModel('pro')}
                            className={cn(
                                "flex flex-col items-center p-6 border transition-all duration-300 rounded-none",
                                model === 'pro'
                                    ? "border-primary bg-primary text-background"
                                    : "border-border hover:border-primary text-secondary hover:text-primary"
                            )}
                        >
                            <span className="text-xl font-bold tracking-wider mb-2">PRO</span>
                            <span className="text-xs opacity-70">높은 퀄리티</span>
                        </button>
                    </div>

                    <div className="pt-12">
                        <button
                            onClick={() => setStep(2)}
                            disabled={!files[0] || !files[1]}
                            className="btn-primary w-full max-w-xs h-14 text-sm"
                        >
                            다음 단계
                        </button>
                    </div>
                </div>
            )}

            {/* --- Step 2: 포즈 선택 화면 --- */}
            {step === 2 && (
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black uppercase tracking-tight">Select Poses</h2>
                        <p className="text-secondary font-light">
                            4개의 포즈를 선택하거나, 건너뛰어 AI가 랜덤하게 선택하게 하세요.
                            <br />
                            <span className={cn("text-xs font-bold mt-2 block", selectedPoseIds.length === 4 ? "text-primary" : "text-secondary")}>
                                {selectedPoseIds.length} / 4 SELECTED
                            </span>
                        </p>
                    </div>

                    {loadingPoses ? (
                        <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-secondary" /></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {poses.map(pose => (
                                <div
                                    key={pose.id}
                                    onClick={() => togglePose(pose.id)}
                                    className={cn(
                                        "p-6 border cursor-pointer transition-all relative rounded-none flex flex-col justify-between min-h-[140px]",
                                        selectedPoseIds.includes(pose.id) ? "border-primary bg-primary text-white" : "border-border hover:border-primary text-primary"
                                    )}
                                >
                                    <div>
                                        <h3 className="font-bold text-xs uppercase mb-2 tracking-widest">{pose.category || 'Pose'}</h3>
                                        <p className={cn("text-xs line-clamp-3 leading-relaxed", selectedPoseIds.includes(pose.id) ? "text-white/80" : "text-secondary")}>
                                            {pose.description || pose.prompt_text}
                                        </p>
                                    </div>
                                    {selectedPoseIds.includes(pose.id) && (
                                        <div className="absolute top-3 right-3">
                                            <Check size={14} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center border border-red-200 bg-red-50 p-4">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-center gap-6 pt-8">
                        <button
                            onClick={() => setStep(1)}
                            className="btn-secondary w-32"
                            disabled={isGenerating}
                        >
                            BACK
                        </button>
                        <button
                            onClick={generateImage}
                            disabled={isGenerating || (selectedPoseIds.length > 0 && selectedPoseIds.length < 4)}
                            className="btn-primary w-64 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    GENERATING...
                                </>
                            ) : (
                                selectedPoseIds.length === 0 ? "SURPRISE ME (RANDOM)" : "GENERATE 4-CUT"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* --- Step 3: 결과 화면 --- */}
            {step === 3 && resultImage && (
                <div className="space-y-12 text-center animate-in zoom-in duration-500">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black uppercase tracking-tight">Your K4CUT</h2>
                        <p className="text-secondary">생성 완료!</p>
                    </div>

                    <div className="max-w-md mx-auto bg-white p-4 shadow-xl border border-border">
                        <Image src={resultImage} alt="Generated Result" width={1000} height={1500} unoptimized className="w-full h-auto block" />
                    </div>

                    <div className="flex justify-center gap-6 pt-8">
                        <a
                            href={resultImage}
                            download={`k4cut-${Date.now()}.jpg`}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Download size={18} />
                            DOWNLOAD
                        </a>
                        <button
                            onClick={() => {
                                setStep(1);
                                setFiles([null, null]);
                                setPreviews([null, null]);
                                setResultImage(null);
                                setSelectedPoseIds([]);
                            }}
                            className="btn-secondary"
                        >
                            CREATE NEW
                        </button>
                    </div>

                    <div className="pt-8 border-t border-border mt-12 w-full max-w-md mx-auto">
                        <button
                            onClick={() => router.push('/gallery')}
                            className="text-sm font-bold tracking-widest hover:text-secondary uppercase"
                        >
                            Go to Gallery
                        </button>
                    </div>
                </div>
            )}

            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={handleCameraCapture}
            />
        </div>
    );
}
