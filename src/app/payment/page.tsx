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
import { Product, Order, RefundRequest } from '@/types';
import { Check, Loader2, AlertCircle, RefreshCw, ShoppingBag, CreditCard, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface RefundModalProps {
    orderId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

function RefundModal({ orderId, isOpen, onClose, onSuccess }: RefundModalProps) {
    const [reason, setReason] = useState('customer_request');
    const [reasonDetail, setReasonDetail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/api/v1/payments/refunds/request', {
                order_id: orderId,
                reason,
                reason_detail: reasonDetail
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Refund request failed', err);
            setError(err.response?.data?.detail || '환불 요청에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background border border-border w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold uppercase mb-4">Request Refund</h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Reason</label>
                        <select
                            className="w-full p-2 border border-border bg-background"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option value="customer_request">단순 변심 (Customer Request)</option>
                            <option value="duplicate">중복 결제 (Duplicate)</option>
                            <option value="service_not_provided">서비스 미제공 (Service Not Provided)</option>
                            <option value="dissatisfied">서비스 불만족 (Dissatisfied)</option>
                            <option value="other">기타 (Other)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Details</label>
                        <textarea
                            className="w-full p-2 border border-border bg-background min-h-[100px]"
                            placeholder="상세 사유를 입력해주세요."
                            value={reasonDetail}
                            onChange={(e) => setReasonDetail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-secondary hover:text-primary"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-white text-sm font-bold uppercase disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PaymentContent() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 상태 관리
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [refunds, setRefunds] = useState<RefundRequest[]>([]);

    // Tab State: 'products' | 'orders' | 'refunds'
    const [activeTab, setActiveTab] = useState('products');

    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Refund Modal State
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // URL 쿼리 파라미터 확인
    useEffect(() => {
        if (status === 'success') {
            setMessage({ type: 'success', text: '결제가 성공적으로 완료되었습니다! 크레딧이 충전되었습니다.' });
            refreshUser();
        } else if (status === 'failure') {
            setMessage({ type: 'error', text: '결제 처리에 실패했습니다. 다시 시도해주세요.' });
        }
    }, [searchParams, refreshUser]);

    // 데이터 불러오기
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/api/v1/payments/products');
                if (res.data.products) {
                    setProducts(res.data.products);
                }
            } catch (err) {
                console.error('Failed to fetch products', err);
            }
        };

        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/v1/payments/orders');
                if (res.data.orders) {
                    setOrders(res.data.orders);
                }
            } catch (err) {
                console.error('Failed to fetch orders', err);
            }
        };

        const fetchRefunds = async () => {
            try {
                const res = await api.get('/api/v1/payments/refunds/requests');
                if (res.data.refund_requests) {
                    setRefunds(res.data.refund_requests);
                }
            } catch (err) {
                console.error('Failed to fetch refunds', err);
            }
        };

        const init = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchOrders(), fetchRefunds()]);
            setLoading(false);
        };

        if (!authLoading) {
            if (!user) {
                router.push('/login?redirect=/payment');
                return;
            }
            init();
        }
    }, [user, authLoading, router]);

    const handlePurchase = async (productId: string) => {
        setProcessingId(productId);
        setMessage(null);

        try {
            const baseUrl = window.location.origin;
            const successUrl = `${baseUrl}/payment?status=success`;

            const res = await api.post('/api/v1/payments/checkout', {
                product_id: productId,
                success_url: successUrl
            });

            if (res.data.checkout_url) {
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

    const handleRefundRequest = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsRefundModalOpen(true);
    };

    const handleRefundSuccess = () => {
        setMessage({ type: 'success', text: '환불 요청이 접수되었습니다.' });
        // Refresh refunds list
        const fetchRefunds = async () => {
            try {
                const res = await api.get('/api/v1/payments/refunds/requests');
                if (res.data.refund_requests) {
                    setRefunds(res.data.refund_requests);
                }
            } catch (err) {
                console.error('Failed to refresh refunds', err);
            }
        };
        fetchRefunds();
        setActiveTab('refunds');
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
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Store & Billing</h1>
                <p className="text-secondary max-w-2xl mx-auto">
                    K4CUT의 프리미엄 기능을 이용하거나 지난 결제 내역을 확인하세요.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-12 border-b border-border">
                <button
                    onClick={() => setActiveTab('products')}
                    className={cn(
                        "px-8 py-4 font-bold uppercase tracking-widest text-sm border-b-2 transition-all",
                        activeTab === 'products' ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
                    )}
                >
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                        "px-8 py-4 font-bold uppercase tracking-widest text-sm border-b-2 transition-all",
                        activeTab === 'orders' ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
                    )}
                >
                    Order History
                </button>
                <button
                    onClick={() => setActiveTab('refunds')}
                    className={cn(
                        "px-8 py-4 font-bold uppercase tracking-widest text-sm border-b-2 transition-all",
                        activeTab === 'refunds' ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
                    )}
                >
                    Refund Requests
                </button>
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

            {/* CONTENT AREA */}
            <div className="animate-in fade-in duration-500">

                {/* 1. Products Tab */}
                {activeTab === 'products' && (
                    products.length === 0 ? (
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
                    )
                )}

                {/* 2. Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-20 text-secondary border border-dashed border-border">
                                <ShoppingBag className="mx-auto mb-4 opacity-50" size={48} />
                                <p>주문 내역이 없습니다.</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 hover:bg-white transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-mono text-secondary">{order.id}</span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 font-bold uppercase">{order.status}</span>
                                        </div>
                                        <div className="font-bold text-lg mb-1">
                                            {order.amount ? (order.amount / 100).toLocaleString() : 0} {order.currency?.toUpperCase()}
                                        </div>
                                        <div className="text-sm text-secondary">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                                        </div>
                                    </div>

                                    {order.status !== 'refunded' && (
                                        <button
                                            onClick={() => handleRefundRequest(order.id)}
                                            className="px-4 py-2 text-xs font-bold uppercase border border-border hover:bg-black hover:text-white transition-colors"
                                        >
                                            Request Refund
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 3. Refund Requests Tab */}
                {activeTab === 'refunds' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {refunds.length === 0 ? (
                            <div className="text-center py-20 text-secondary border border-dashed border-border">
                                <RotateCcw className="mx-auto mb-4 opacity-50" size={48} />
                                <p>환불 요청 내역이 없습니다.</p>
                            </div>
                        ) : (
                            refunds.map((refund) => (
                                <div key={refund.id} className="border border-border p-6 flex flex-col gap-4 bg-white/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 font-bold uppercase",
                                                    refund.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                                                        refund.status === 'approved' ? "bg-green-100 text-green-800" :
                                                            refund.status === 'rejected' ? "bg-red-100 text-red-800" :
                                                                "bg-gray-100 text-gray-800"
                                                )}>
                                                    {refund.status}
                                                </span>
                                                <span className="text-xs text-secondary">{new Date(refund.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-bold">{refund.product_name || 'Unknown Product'}</h4>
                                            <p className="text-sm text-secondary mt-1">
                                                Reason: {refund.reason}
                                                {refund.reason_detail && <span className="text-xs text-gray-400 block mt-1">"{refund.reason_detail}"</span>}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">
                                                {refund.amount ? (refund.amount / 100).toLocaleString() : 0} {refund.currency.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    {refund.admin_note && (
                                        <div className="text-sm bg-gray-50 p-3 text-secondary border-t border-border mt-2">
                                            <span className="font-bold text-xs uppercase block mb-1">Admin Note:</span>
                                            {refund.admin_note}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>

            {/* Refund Modal */}
            {selectedOrderId && (
                <RefundModal
                    orderId={selectedOrderId}
                    isOpen={isRefundModalOpen}
                    onClose={() => setIsRefundModalOpen(false)}
                    onSuccess={handleRefundSuccess}
                />
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
