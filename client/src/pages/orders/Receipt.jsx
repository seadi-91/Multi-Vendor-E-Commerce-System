import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, Download, Mail, MapPin, Package, Printer, Truck, User } from 'lucide-react';
import Footer from '../../components/Footer';
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
        <div className="min-h-screen bg-[var(--background)] px-3 py-4 sm:py-6 text-[var(--foreground)]">
            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-shell { box-shadow: none !important; border: none !important; }
        }
      `}</style>

            <div className="no-print mx-auto mb-4 flex w-full max-w-[800px] items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)]/90 px-3 py-2 shadow-sm">
                <button onClick={() => navigate('/customer/orders')} className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1.5 text-[10px] sm:text-xs font-medium transition hover:bg-[var(--muted)]">
                    <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Back to Orders
                </button>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700">
                        <Printer className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Print
                    </button>
                    <button onClick={handleDownloadPdf} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1.5 text-[10px] sm:text-xs font-medium transition hover:bg-[var(--muted)]">
                        <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        PDF
                    </button>
                </div>
            </div>

            <div className="print-shell mx-auto w-full max-w-[800px] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 sm:pb-4 mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-600">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-600">FarmConnect</p>
                            <h1 className="text-base sm:text-xl font-semibold">Receipt</h1>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[var(--muted-foreground)]">Receipt Number</p>
                        <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">{orderNumber}</p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-[10px] sm:text-xs">
                    <div>
                        <p className="text-[var(--muted-foreground)] mb-0.5">Customer</p>
                        <p className="font-medium text-[var(--foreground)]">{customerName}</p>
                    </div>
                    <div>
                        <p className="text-[var(--muted-foreground)] mb-0.5">Email</p>
                        <p className="font-medium text-[var(--foreground)]">{customerEmail}</p>
                    </div>
                    <div>
                        <p className="text-[var(--muted-foreground)] mb-0.5">Phone</p>
                        <p className="font-medium text-[var(--foreground)]">{customerPhone}</p>
                    </div>
                    <div>
                        <p className="text-[var(--muted-foreground)] mb-0.5">Order Date</p>
                        <p className="font-medium text-[var(--foreground)]">{orderDate}</p>
                    </div>
                    <div>
                        <p className="text-[var(--muted-foreground)] mb-0.5">Payment Method</p>
                        <p className="font-medium capitalize text-[var(--foreground)]">{order.paymentMethod || 'cash'}</p>
                    </div>
                    <div>
                        <p className="text-[var(--muted-foreground)] mb-0.5">Order Status</p>
                        <p className="font-medium capitalize text-[var(--foreground)]">{order.status || 'processing'}</p>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-4 pb-4 border-b border-[var(--border)]">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-1">Shipping Address</p>
                    <p className="text-[10px] sm:text-xs text-[var(--foreground)]">{shippingAddress}</p>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                    <div className="grid grid-cols-[2fr_0.5fr_0.8fr_0.8fr] bg-[var(--secondary)] px-3 py-1.5 text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Unit</span>
                        <span>Subtotal</span>
                    </div>
                    {items.map((item, index) => (
                        <div key={`${order.id}-${index}`} className="grid grid-cols-[2fr_0.5fr_0.8fr_0.8fr] border-t border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[10px] sm:text-xs">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">{item.name || item.productName || 'Product'}</p>
                            </div>
                            <div className="text-[var(--foreground)]">{item.quantity || 1}</div>
                            <div className="text-[var(--foreground)]">{formatPrice(item.price || 0)} ETB</div>
                            <div className="font-medium text-[var(--foreground)]">{formatPrice((item.price || 0) * (item.quantity || 1))} ETB</div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="mb-4 pb-4 border-b border-[var(--border)]">
                    <div className="space-y-1.5 text-[10px] sm:text-xs">
                        <div className="flex justify-between text-[var(--muted-foreground)]">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal || order.total || 0)} ETB</span>
                        </div>
                        <div className="flex justify-between text-[var(--muted-foreground)]">
                            <span>Shipping</span>
                            <span>{formatPrice(order.deliveryFee || 0)} ETB</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                            <span>Total</span>
                            <span className="text-emerald-600 dark:text-emerald-500">{formatPrice(order.total || 0)} ETB</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {notes && (
                    <div className="mb-4 pb-4 border-b border-[var(--border)]">
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-1">Notes</p>
                        <p className="text-[10px] sm:text-xs text-[var(--foreground)]">{notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center">
                    <p className="text-[10px] sm:text-xs font-medium text-[var(--foreground)]">Thank you for choosing FarmConnect.</p>
                    <p className="text-[9px] sm:text-[10px] text-[var(--muted-foreground)] mt-1">We appreciate your business and look forward to serving you again.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
  };

export default Receipt;
