import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, Download, Mail, MapPin, Package, Printer, Truck, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../api';

const Receipt = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState('');

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
            } catch (err) {
                console.error('Failed to load receipt order', err);
                setError('This receipt could not be loaded right now.');
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
        ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : order?.date || 'N/A';
    const paymentDate = order?.updatedAt
        ? new Date(order.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : orderDate;
    const sellerName = order?.vendor || order?.restaurant || 'FarmConnect';
    const customerName = order?.fullName || order?.customer?.name || 'Customer';
    const customerEmail = order?.email || '—';
    const customerPhone = order?.phone || '—';
    const shippingAddress = [order?.address, order?.city].filter(Boolean).join(', ') || 'Delivery address will be available after checkout';
    const billingAddress = shippingAddress;
    const notes = order?.specialInstructions || order?.additionalInfo || '';

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 36;
        const tableRows = items.map((item) => [
            item.name || item.productName || 'Product',
            item.quantity || 1,
            `${formatPrice(item.price || 0)} ETB`,
            `${formatPrice((item.price || 0) * (item.quantity || 1))} ETB`
        ]);

        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, pageWidth, 92, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('Receipt', margin, 42);
        doc.setFontSize(11);
        doc.text('FarmConnect • Digital purchase receipt', margin, 64);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text(`Receipt #: ${orderNumber}`, margin, 118);
        doc.text(`Order ID: ${order?.id || id}`, margin, 138);
        doc.text(`Issued: ${new Date().toLocaleDateString('en-US')}`, pageWidth - margin - 120, 118);
        doc.text(`Payment Date: ${paymentDate}`, pageWidth - margin - 120, 138);

        doc.setFontSize(11);
        doc.text('Customer', margin, 172);
        doc.setFontSize(10);
        doc.text(customerName, margin, 190);
        doc.text(customerEmail, margin, 206);
        doc.text(customerPhone, margin, 222);

        doc.text('Seller', pageWidth / 2, 172);
        doc.text(sellerName, pageWidth / 2, 190);
        doc.text('FarmConnect', pageWidth / 2, 206);

        autoTable(doc, {
            startY: 250,
            head: [['Item', 'Qty', 'Unit Price', 'Subtotal']],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [16, 185, 129], textColor: 255 },
            margin: { left: margin, right: margin }
        });

        const finalY = (doc.lastAutoTable?.finalY || 300) + 20;
        doc.text(`Shipping: ${formatPrice(order?.deliveryFee || 0)} ETB`, margin, finalY);
        doc.text(`Tax: ${formatPrice(order?.tax || 0)} ETB`, margin, finalY + 18);
        doc.text(`Total: ${formatPrice(order?.total || 0)} ETB`, margin, finalY + 36);
        doc.text('Thank you for shopping with FarmConnect.', margin, finalY + 64);

        doc.save(`${orderNumber || 'receipt'}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
                <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                    <h2 className="text-xl font-semibold">Preparing your receipt</h2>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">Please wait while we assemble the latest order details.</p>
                </div>
            </div>
        );
    }

    if (!order || error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
                <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl">
                    <h2 className="text-xl font-semibold">Receipt unavailable</h2>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">{error || 'We could not load this order receipt right now.'}</p>
                    <button onClick={() => navigate('/customer/orders')} className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] px-3 py-3 text-[var(--foreground)] sm:px-4 lg:px-6">
            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-shell { box-shadow: none !important; border: none !important; }
        }
      `}</style>

            <div className="no-print mx-auto mb-3 flex w-full max-w-[860px] items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 px-3 py-2 shadow-sm sm:px-4">
                <button onClick={() => navigate('/customer/orders')} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-2 text-[11px] font-semibold transition hover:bg-[var(--muted)] sm:text-sm">
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Back to Orders
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:text-sm">
                        <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Print Receipt
                    </button>
                    <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-[11px] font-semibold transition hover:bg-[var(--muted)] sm:text-sm">
                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        PDF
                    </button>
                </div>
            </div>

            <div className="print-shell mx-auto w-full max-w-[860px] rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg sm:p-6 lg:p-7">
                <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-emerald-600">FarmConnect</p>
                            <h1 className="text-xl font-semibold">Receipt</h1>
                            <p className="mt-1 max-w-xl text-xs text-[var(--muted-foreground)]">A concise summary of your purchase, delivery details, and payment status.</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <div className="flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Order confirmed
                        </div>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.25em]">Receipt Number</p>
                        <p className="text-sm font-semibold">{orderNumber}</p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/70 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <User className="h-3.5 w-3.5 text-emerald-600" />
                            Customer information
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Customer</span>
                                <span className="font-medium">{customerName}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Email</span>
                                <span className="font-medium">{customerEmail}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Phone</span>
                                <span className="font-medium">{customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/70 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                            Receipt details
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Order date</span>
                                <span className="font-medium">{orderDate}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Payment date</span>
                                <span className="font-medium">{paymentDate}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Payment method</span>
                                <span className="font-medium capitalize">{order.paymentMethod || 'cash'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[var(--muted-foreground)]">Order status</span>
                                <span className="font-medium capitalize">{order.status || 'processing'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/70 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Package className="h-3.5 w-3.5 text-emerald-600" />
                            Seller information
                        </div>
                        <div className="mt-3 space-y-1 text-sm">
                            <p className="font-medium">{sellerName}</p>
                            <p className="text-[var(--muted-foreground)]">FarmConnect marketplace</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/70 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            Shipping & billing address
                        </div>
                        <div className="mt-3 space-y-1 text-sm">
                            <p className="font-medium">{shippingAddress}</p>
                            <p className="text-[var(--muted-foreground)]">Billing address matches the shipping address on file.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">
                    <div className="grid grid-cols-[1.7fr_0.45fr_0.7fr_0.7fr] bg-[var(--secondary)] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Unit</span>
                        <span>Subtotal</span>
                    </div>
                    {items.map((item, index) => (
                        <div key={`${order.id}-${index}`} className="grid grid-cols-[1.7fr_0.45fr_0.7fr_0.7fr] border-t border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-xs">
                            <div>
                                <p className="font-medium">{item.name || item.productName || 'Product'}</p>
                                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{item.description || 'Fresh produce item'}</p>
                            </div>
                            <div>{item.quantity || 1}</div>
                            <div>{formatPrice(item.price || 0)} ETB</div>
                            <div className="font-medium">{formatPrice((item.price || 0) * (item.quantity || 1))} ETB</div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.8fr]">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/70 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Mail className="h-3.5 w-3.5 text-emerald-600" />
                            Notes & support
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{notes || 'No additional notes were provided for this order.'}</p>
                        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Need help? Contact support at support@farmconnect.com or call +251-900-000-000.</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/70 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                            Order summary
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between"><span className="text-[var(--muted-foreground)]">Subtotal</span><span>{formatPrice(order.subtotal || order.total || 0)} ETB</span></div>
                            <div className="flex items-center justify-between"><span className="text-[var(--muted-foreground)]">Shipping</span><span>{formatPrice(order.deliveryFee || 0)} ETB</span></div>
                            <div className="flex items-center justify-between"><span className="text-[var(--muted-foreground)]">Tax</span><span>{formatPrice(order.tax || 0)} ETB</span></div>
                            <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-2 text-sm font-semibold"><span>Grand total</span><span>{formatPrice(order.total || 0)} ETB</span></div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-center text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <p className="font-semibold">Thank you for choosing FarmConnect.</p>
                    <p className="mt-1">We appreciate your business and look forward to serving you again.</p>
                </div>
            </div>
        </div>
    );
};

export default Receipt;
