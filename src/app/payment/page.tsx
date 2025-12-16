/**
 * @file payment/page.tsx
 * @description 결제 및 상품 표시 페이지입니다.
 * 결제 가능한 상품 목록을 보여주고 Polar 결제를 연동합니다.
 */

"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function PaymentContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 상태 관리
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null); // 결제 진행 중인 상품 ID
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // URL 쿼리 파라미터 확인 (결제 성공/실패 메시지)
    useEffect(() => {
        const status = searchParams.get('status');
        if (status === 'success') {
            setMessage({ type: 'success', text: '결제가 성공적으로 완료되었습니다! 크레딧이 충전되었습니다.' });
        } else if (status === 'failure') {
            setMessage({ type: 'error', text: '결제 처리에 실패했습니다. 다시 시도해주세요.' });
        }
    }, [searchParams]);

    // 상품 목록 불러오기
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/api/v1/payments/products');
                if (res.data.products) {
                    setProducts(res.data.products);
                }
            } catch (err) {
                console.error('Failed to fetch products', err);
                setMessage({ type: 'error', text: '상품 목록을 불러올 수 없습니다.' });
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (!user) {
                router.push('/login?redirect=/payment');
                return;
            }
            fetchProducts();
        }
    }, [user, authLoading, router]);

    // 결제 프로세스 시작 (Checkout URL 생성)
    const handlePurchase = async (productId: string) => {
        setProcessingId(productId);
        setMessage(null);

        try {
            // 현재 페이지 URL을 성공/실패 리다이렉트 URL로 설정 (예시)
            const baseUrl = window.location.origin;
            const successUrl = `${baseUrl}/payment?status=success`;

            const res = await api.post('/api/v1/payments/checkout', {
                product_id: productId,
                success_url: successUrl
            });

            if (res.data.checkout_url) {
                // Polar 결제 페이지로 이동
                window.location.href = res.data.checkout_url;
            } else {
                setMessage({ type: 'error', text: '결제 링크를 생성하지 못했습니다.' });
                setProcessingId(null);
            }
        } catch (err) {
            console.error('Checkout error', err);
            setMessage({ type: 'error', text: '결제 요청 중 오류가 발생했습니다.' });
            setProcessingId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="container-custom py-20 min-h-[calc(100vh-8rem)]">

            <div className="text-center space-y-6 mb-16 animate-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Pricing Plans</h1>
                <p className="text-secondary max-w-2xl mx-auto">
                    K4CUT의 프리미엄 기능을 이용하거나 크레딧을 충전하여 더 많은 추억을 남겨보세요.
                </p>
            </div>

            {/* 메시지 알림 */}
            {message && (
                <div className={cn(
                    "max-w-md mx-auto mb-12 p-4 flex items-center gap-3 rounded-none border animate-in fade-in slide-in-from-top-2",
                    message.type === 'success'
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                )}>
                    {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            {/* 상품 그리드 */}
            {products.length === 0 ? (
                <div className="text-center py-20 text-secondary">
                    <p>현재 판매 중인 상품이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex flex-col border border-border bg-background p-8 hover:border-primary transition-colors duration-300 relative group animate-in zoom-in duration-500"
                        >
                            {product.is_recurring && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] uppercase font-bold px-3 py-1 tracking-widest">
                                    Subscription
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold uppercase tracking-tight mb-2">{product.name}</h3>
                                <p className="text-sm text-secondary line-clamp-2 min-h-[40px]">{product.description}</p>
                            </div>

                            <div className="flex-1 flex flex-col justify-end">
                                <div className="mb-8">
                                    {product.prices && product.prices.length > 0 ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black">
                                                {(product.prices[0].amount / 100).toLocaleString()}
                                            </span>
                                            <span className="text-sm text-secondary uppercase font-bold">
                                                {product.prices[0].currency}
                                            </span>
                                            {product.is_recurring && (
                                                <span className="text-sm text-secondary/60 ml-1">/ {product.prices[0].interval}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold text-secondary">가격 문의</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handlePurchase(product.id)}
                                    disabled={!!processingId}
                                    className={cn(
                                        "w-full py-4 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                                        processingId === product.id
                                            ? "bg-secondary text-white cursor-wait"
                                            : "bg-primary text-white hover:opacity-90 hover:translate-y-[-2px] hover:shadow-lg"
                                    )}
                                >
                                    {processingId === product.id ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            PROCESSING...
                                        </>
                                    ) : (
                                        "PURCHASE NOW"
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-20 text-center">
                <Link href="/" className="text-sm text-secondary hover:text-primary underline">
                    메인으로 돌아가기
                </Link>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
            <PaymentContent />
        </Suspense>
    );
}
