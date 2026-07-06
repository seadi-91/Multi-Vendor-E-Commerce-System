import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2, Package, CreditCard, Truck, User, Mail, MapPin, CalendarDays } from 'lucide-react';
import api from '../../api';

const Receipt = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);

    useEffect(() => {
        const loadOrder = async () => {
            if (order) return;

            try {
                const savedOrders = localStorage.getItem('orders');
                if (savedOrders) {
                    const parsed = JSON.parse(savedOrders);
                    const match = parsed.find((item) => String(item.id) === String(id) || String(item.orderNumber) === String(id));
                    if (match) {
                        setOrder(match);
                        setLoading(false);
                        return;
                    }
                }

                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Failed to load receipt order', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id, order]);

    const formatPrice = (value) => Number(value || 0).toFixed(2);

    const items = useMemo(() => {
        if (!order?.items) return [];
        return Array.isArray(order.items)
            ? order.items
            : typeof order.items === 'string'
                ? JSON.parse(order.items)
                : [];
    }, [order]);

    const orderNumber = order?.orderCode || order?.orderNumber || `ORD-${String(order?.id || id).padStart(5, '0')}`;
    const orderDate = order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : order?.date || 'N/A';

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                    <h2 className="text-xl font-semibold">Preparing your receipt</h2>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">Please wait while we assemble the order details.</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl">
                    <h2 className="text-xl font-semibold">Receipt unavailable</h2>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">We could not load this order receipt right now.</p>
                    <button
                        onClick={() => navigate('/customer/orders')}
                        className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-10">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 px-4 py-3 shadow-sm no-print sm:px-6">
                <button
                    onClick={() => navigate('/customer/orders')}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--muted)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Orders
                </button>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    <Printer className="h-4 w-4" />
                    Print Receipt
                </button>
            </div>

            <div className="mx-auto mt-6 max-w-5xl rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl sm:p-8 lg:p-10">
                <div className="flex flex-col gap-6 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-600">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">FarmConnect</p>
                                <h1 className="text-2xl font-black">Receipt</h1>
                            </div>
                        </div>
                        <p className="mt-3 max-w-xl text-sm text-[var(--muted-foreground)]">
                            Thank you for shopping with us. This receipt confirms your order and summarizes the purchase details.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <div className="flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            Order confirmed
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em]">Order ID</p>
                        <p className="text-lg font-black">{orderNumber}</p>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/70 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <User className="h-4 w-4 text-emerald-600" />
                            Customer information
                        </div>
                        <div className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Name</span>
                                <span className="font-medium">{order.fullName || 'Customer'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Email</span>
                                <span className="font-medium">{order.email || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Phone</span>
                                <span className="font-medium">{order.phone || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/70 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <CalendarDays className="h-4 w-4 text-emerald-600" />
                            Order details
                        </div>
                        <div className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Order date</span>
                                <span className="font-medium">{orderDate}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Payment method</span>
                                <span className="font-medium capitalize">{order.paymentMethod || 'cash'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Payment status</span>
                                <span className="font-medium">{order.paymentStatus || 'Unpaid'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Order status</span>
                                <span className="font-medium capitalize">{order.status || 'Processing'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
                    <div className="grid grid-cols-[2.2fr_0.8fr_0.8fr_0.8fr] bg-[var(--secondary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                        <span>Item</span>
                        <span>Quantity</span>
                        <span>Unit price</span>
                        <span>Total</span>
                    </div>
                    {items.map((item, index) => (
                        <div key={`${order.id}-${index}`} className="grid grid-cols-[2.2fr_0.8fr_0.8fr_0.8fr] border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 text-sm">
                            <div>
                                <p className="font-semibold">{item.name || item.productName || 'Item'}</p>
                                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{item.description || ''}</p>
                            </div>
                            <div className="font-medium">{item.quantity || 1}</div>
                            <div className="font-medium">{formatPrice(item.price || 0)} ETB</div>
                            <div className="font-semibold">{formatPrice((item.price || 0) * (item.quantity || 1))} ETB</div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/70 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Truck className="h-4 w-4 text-emerald-600" />
                            Delivery details
                        </div>
                        <div className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                                <div>
                                    <p className="font-medium">{order.address || 'Delivery address'}</p>
                                    <p className="text-[var(--muted-foreground)]">{order.city || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Mail className="mt-0.5 h-4 w-4 text-emerald-600" />
                                <div>
                                    <p className="font-medium">{order.email || '—'}</p>
                                    <p className="text-[var(--muted-foreground)]">Order updates will be sent here.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/70 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                            Payment summary
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal || order.total || 0)} ETB</span>
                            </div>
                            <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                                <span>Delivery fee</span>
                                <span>{formatPrice(order.deliveryFee || 0)} ETB</span>
                            </div>
                            <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                                <span>Tax</span>
                                <span>{formatPrice(order.tax || 0)} ETB</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-base font-black text-[var(--foreground)]">
                                <span>Total</span>
                                <span>{formatPrice(order.total || 0)} ETB</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <p className="font-semibold">Thank you for choosing FarmConnect.</p>
                    <p className="mt-1">We appreciate your trust and look forward to serving you again soon.</p>
                </div>
            </div>
        </div>
    );
};

export default Receipt;
