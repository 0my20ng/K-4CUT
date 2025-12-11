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

    // --- Step 2: 포즈 선택 관련 상태 ---
    const [poses, setPoses] = useState<Pose[]>([]); // 불러온 포즈 목록
    const [selectedPoseIds, setSelectedPoseIds] = useState<string[]>([]); // 선택된 포즈 ID 목록
    const [loadingPoses, setLoadingPoses] = useState(false); // 포즈 로딩 상태

    // --- Step 3: 생성 결과 관련 상태 ---
    const [isGenerating, setIsGenerating] = useState(false); // 생성 진행 중 여부
    const [resultImage, setResultImage] = useState<string | null>(null); // 생성된 이미지 결과 (Base64 등)
    const [error, setError] = useState(''); // 에러 메시지

    // 인증 보호: 비로그인 사용자 리다이렉트
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
        <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] py-8 px-4 animate-in fade-in duration-500">

            {/* 단계 표시기 (Progress Indicator) */}
            <div className="flex justify-between items-center mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-secondary/20 -z-10" />
                <div className={cn("bg-background px-4 font-mono text-sm", step >= 1 ? "text-primary font-bold" : "text-secondary")}>01 UPLOAD</div>
                <div className={cn("bg-background px-4 font-mono text-sm", step >= 2 ? "text-primary font-bold" : "text-secondary")}>02 POSE</div>
                <div className={cn("bg-background px-4 font-mono text-sm", step === 3 ? "text-primary font-bold" : "text-secondary")}>03 RESULT</div>
            </div>

            {/* --- Step 1: 사진 업로드 화면 --- */}
            {step === 1 && (
                <div className="space-y-8 text-center animate-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black">UPLOAD PORTRAITS</h2>
                        <p className="text-secondary">Select two photos to star in your 4-Cut</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {[0, 1].map((idx) => (
                            <div key={idx} className="aspect-[3/4] relative border-2 border-dashed border-secondary/30 rounded-sm hover:border-primary transition-colors flex flex-col items-center justify-center bg-secondary/5 group">
                                {previews[idx] ? (
                                    <>
                                        <Image src={previews[idx]!} alt={`Preview ${idx}`} fill unoptimized className="object-cover rounded-sm" />
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => fileInputRefs[idx].current?.click()}
                                        className="w-full h-full flex flex-col items-center justify-center gap-4 text-secondary group-hover:text-primary transition-colors"
                                    >
                                        <Camera size={48} strokeWidth={1} />
                                        <span className="text-sm font-bold tracking-widest uppercase">Select Photo {idx + 1}</span>
                                    </button>
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

                    <div className="pt-8">
                        <button
                            onClick={() => setStep(2)}
                            disabled={!files[0] || !files[1]}
                            className="btn-primary w-64 h-12 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Step
                        </button>
                    </div>
                </div>
            )}

            {/* --- Step 2: 포즈 선택 화면 --- */}
            {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black">SELECT POSES</h2>
                        <p className="text-secondary">
                            Select exactly 4 poses or skip to let AI decide randomly.
                            <br />
                            <span className={cn("text-xs font-bold", selectedPoseIds.length === 4 ? "text-primary" : "text-secondary")}>
                                {selectedPoseIds.length} / 4 Selected
                            </span>
                        </p>
                    </div>

                    {loadingPoses ? (
                        <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-secondary" /></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {poses.map(pose => (
                                <div
                                    key={pose.id}
                                    onClick={() => togglePose(pose.id)}
                                    className={cn(
                                        "p-4 border border-secondary/20 rounded-sm cursor-pointer transition-all hover:bg-secondary/5 relative",
                                        selectedPoseIds.includes(pose.id) ? "border-primary bg-primary/5" : ""
                                    )}
                                >
                                    <h3 className="font-bold text-xs uppercase mb-1">{pose.category || 'Pose'}</h3>
                                    <p className="text-xs text-secondary line-clamp-3">{pose.description || pose.prompt_text}</p>
                                    {selectedPoseIds.includes(pose.id) && (
                                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center">
                                            <Check size={10} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 dark:bg-red-900/20">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-center gap-4 pt-4">
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
                            className="btn-primary w-64 flex items-center justify-center gap-2"
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
                <div className="space-y-8 text-center animate-in zoom-in duration-500">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black">YOUR K4CUT</h2>
                        <p className="text-secondary">Capture complete!</p>
                    </div>

                    <div className="max-w-md mx-auto bg-white p-4 shadow-2xl skew-y-1 transform transition-transform hover:skew-y-0 duration-500">
                        <Image src={resultImage} alt="Generated Result" width={1000} height={1500} unoptimized className="w-full h-auto block" />
                    </div>

                    <div className="flex justify-center gap-4 pt-8">
                        <a
                            href={resultImage}
                            download={`k4cut-${Date.now()}.jpg`}
                            className="btn-primary flex items-center gap-2 px-8 py-3"
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

                    <div className="pt-4">
                        <button
                            onClick={() => router.push('/gallery')}
                            className="text-sm text-secondary hover:text-primary underline"
                        >
                            Go to Gallery
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
