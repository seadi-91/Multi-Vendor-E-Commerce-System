const axios = require('axios');
const prisma = require('../db/prismaClient');

const CHAPA_SECRET_KEY = (process.env.CHAPA_SECRET_KEY || '').trim();
const CHAPA_CALLBACK_URL = (process.env.CHAPA_CALLBACK_URL || 'http://localhost:5000/api/payments/chapa/callback').trim();
const CHAPA_RETURN_URL = (process.env.CHAPA_RETURN_URL || 'http://localhost:5173/payment-success').trim();

console.log('[PAYMENT] ========================================');
console.log('[PAYMENT] CHAPA_SECRET_KEY:', CHAPA_SECRET_KEY ? 'CONFIGURED' : 'NOT CONFIGURED');
console.log('[PAYMENT] CHAPA_CALLBACK_URL:', CHAPA_CALLBACK_URL);
console.log('[PAYMENT] CHAPA_RETURN_URL:', CHAPA_RETURN_URL);
console.log('[PAYMENT] Using real Chapa API v1');
console.log('[PAYMENT] ========================================');

/**
 * Generate a transaction reference. If orderId is provided, use it for deterministic refs.
 */
const genTxRef = (orderId) => (orderId ? `ORDER-${orderId}-${Date.now()}` : `chapa_${Date.now()}_${Math.floor(Math.random() * 100000)}`);

/**
 * Helper to process successful payment: updates order/payment records, deducts stock, sends notifications.
 */
async function handleSuccessfulPayment(orderId, tx_ref) {
    console.log(`[PAYMENT CONFIRMATION] Processing successful payment for orderId: ${orderId}, tx_ref: ${tx_ref}`);
    return await prisma.$transaction(async (tx) => {
        // Fetch order with items and their products
        const order = await tx.order.findUnique({
            where: { id: Number(orderId) },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            throw new Error(`Order not found with ID: ${orderId}`);
        }

        // If order's payment status is already paid, we are done
        if (order.paymentStatus === 'paid') {
            console.log(`[PAYMENT CONFIRMATION] Order ${orderId} is already paid.`);
            return order;
        }

        const stockUpdates = [];

        // Deduct stock for each item
        for (const orderItem of order.orderItems) {
            const product = orderItem.product;
            if (!product) continue;

            const previousStock = product.stock;
            const newStock = product.stock - orderItem.quantity;

            if (newStock < 0) {
                throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} units available, but ${orderItem.quantity} requested.`);
            }

            // Update product stock
            await tx.product.update({
                where: { id: orderItem.productId },
                data: { stock: newStock }
            });

            // Update stock status if it goes out of stock
            if (newStock <= 0) {
                await tx.product.update({
                    where: { id: orderItem.productId },
                    data: { status: 'out_of_stock' }
                });
            }

            stockUpdates.push({
                productId: orderItem.productId,
                productName: product.name,
                changeType: 'REDUCTION',
                quantity: orderItem.quantity,
                previousStock,
                newStock,
                farmerId: product.farmerId
            });
        }

        // Update payment record if exists
        if (tx_ref) {
            try {
                const payment = await tx.payment.findUnique({ where: { tx_ref } });
                if (payment) {
                    await tx.payment.update({
                        where: { tx_ref },
                        data: { status: 'paid' }
                    });
                } else {
                    // Create payment record if it wasn't created yet
                    await tx.payment.create({
                        data: {
                            orderId: String(orderId),
                            tx_ref,
                            amount: order.total,
                            status: 'paid'
                        }
                    });
                }
            } catch (payErr) {
                console.error('[PAYMENT CONFIRMATION] Failed to update payment record:', payErr.message);
            }
        }

        // Update order status to paid and confirmed
        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: 'paid',
                status: 'confirmed'
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Log inventory change for each product
        for (const update of stockUpdates) {
            const adminUser = await tx.user.findFirst({
                where: { role: 'ADMIN' },
                select: { id: true },
                orderBy: { id: 'asc' }
            });
            const auditUserId = adminUser ? adminUser.id : (order.customerId || 1);

            await tx.notification.create({
                data: {
                    type: 'INVENTORY_CHANGE',
                    title: `Inventory REDUCTION`,
                    message: `Product ID ${update.productId}: Stock changed from ${update.previousStock} to ${update.newStock} (-${update.quantity} units). Reason: Payment confirmed (${updatedOrder.orderCode})`,
                    productId: update.productId,
                    read: true,
                    userId: auditUserId
                }
            });
        }

        // Send notification to farmers
        const uniqueFarmerIds = new Set();
        stockUpdates.forEach(update => {
            if (update.farmerId) {
                uniqueFarmerIds.add(update.farmerId);
            }
        });

        for (const farmerId of uniqueFarmerIds) {
            const farmerProducts = stockUpdates
                .filter(u => u.farmerId === farmerId)
                .map(u => `${u.productName} (${u.quantity}x)`)
                .join(', ');

            await tx.notification.create({
                data: {
                    type: 'NEW_ORDER',
                    title: 'New Paid Order Received!',
                    message: `You have a new paid order: ${farmerProducts}. Order Code: ${updatedOrder.orderCode}`,
                    userId: farmerId,
                    read: false
                }
            });
        }

        // Send notification to admins
        const adminUsers = await tx.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        for (const admin of adminUsers) {
            await tx.notification.create({
                data: {
                    type: 'NEW_ORDER',
                    title: 'New Paid Order',
                    message: `New paid order ${updatedOrder.orderCode}: ${stockUpdates.length} item(s), Total: ETB ${updatedOrder.total.toFixed(2)}`,
                    userId: admin.id,
                    read: false
                }
            });
        }

        // Send notification to customer
        if (order.customerId) {
            await tx.notification.create({
                data: {
                    type: 'ORDER_STATUS',
                    title: 'Order Status Updated',
                    message: `Your order ${updatedOrder.orderCode} is now confirmed (Paid).`,
                    userId: order.customerId,
                    read: false
                }
            });
        }

        console.log(`[PAYMENT CONFIRMATION] Successfully processed payment and inventory for order ${orderId}`);
        return updatedOrder;
    });
}

/**
 * Helper to find order by orderCode or parsed order ID from tx_ref.
 */
async function findOrderFromTxRef(tx_ref) {
    if (!tx_ref) return null;

    // First try by orderCode
    let order = await prisma.order.findFirst({
        where: { orderCode: tx_ref },
        include: {
            orderItems: true
        }
    });

    // If not found, check if it starts with ORDER-
    if (!order && tx_ref.startsWith('ORDER-')) {
        const parts = tx_ref.split('-');
        const orderId = parseInt(parts[1], 10);
        if (!isNaN(orderId)) {
            order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: true
                }
            });
        }
    }

    return order;
}

/**
 * POST /api/payments/chapa/initiate
 * Initialise a Chapa payment transaction and return the checkout_url
 * Uses official Chapa API v1 endpoint
 */
const initializeChapa = async (req, res) => {
    try {
        console.log('[PAYMENT] Received payment initialization request:', req.body);
        const { amount, email, customer_email, first_name, last_name, orderId } = req.body;

        let order = null;
        if (orderId) {
            order = await prisma.order.findUnique({
                where: { id: Number(orderId) },
                include: { customer: true }
            });
        }

        const orderEmail = order?.email || order?.customer?.email;
        const chapaEmail = (customer_email || email || orderEmail || '').trim();
        let parsedAmount = parseFloat(amount);

        if ((isNaN(parsedAmount) || parsedAmount <= 0) && order?.total !== undefined) {
            parsedAmount = parseFloat(order.total) || 0;
        }

        console.log('[PAYMENT] Parsed values - amount:', amount, 'resolved_amount:', parsedAmount, 'customer_email:', chapaEmail, 'first_name:', first_name, 'last_name:', last_name, 'orderId:', orderId);

        if (!parsedAmount || !chapaEmail) {
            console.log('[PAYMENT] Validation failed: amount or customer_email missing');
            return res.status(400).json({ error: 'amount and customer_email are required' });
        }

        if (!CHAPA_SECRET_KEY || CHAPA_SECRET_KEY === 'your_chapa_secret_key_here' || CHAPA_SECRET_KEY === 'MOCK_MODE_ENABLED') {
            return res.status(500).json({
                error: 'Chapa API key not configured',
                suggestion: 'Please add a valid CHAPA_SECRET_KEY to your .env file from https://dashboard.chapa.co'
            });
        }

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'amount must be a positive number' });
        }

        const tx_ref = req.body.tx_ref?.trim() || genTxRef(orderId);
        console.log('[PAYMENT] Generated tx_ref:', tx_ref);

        const return_url = CHAPA_RETURN_URL.includes('?')
            ? `${CHAPA_RETURN_URL}&tx_ref=${encodeURIComponent(tx_ref)}`
            : `${CHAPA_RETURN_URL}?tx_ref=${encodeURIComponent(tx_ref)}`;

        // Prepare payload for Chapa API v1
        const payload = {
            amount: parsedAmount.toFixed(2),
            currency: 'ETB',
            customer_email: chapaEmail,
            first_name: (first_name || 'Customer').trim() || 'Customer',
            last_name: (last_name || 'User').trim() || 'User',
            tx_ref,
            callback_url: CHAPA_CALLBACK_URL,
            return_url,
            title: 'FarmConnect Order Payment',
            description: 'Payment for your FarmConnect order',
        };

        console.log('[PAYMENT] Sending payment payload to Chapa API v1:', JSON.stringify(payload, null, 2));

        // Call Chapa API v1 initialize endpoint
        const response = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[PAYMENT] Chapa API v1 response:', JSON.stringify(response.data, null, 2));

        const checkout_url = response.data?.data?.checkout_url;
        if (!checkout_url) {
            throw new Error('No checkout_url returned from Chapa API');
        }

        console.log('[PAYMENT] Chapa API v1 response received, checkout_url:', checkout_url);

        // Persist Payment record if orderId provided
        if (orderId) {
            try {
                await prisma.payment.create({
                    data: {
                        orderId: String(orderId),
                        tx_ref,
                        amount: parsedAmount,
                        status: 'pending'
                    }
                });

                await prisma.order.update({
                    where: { id: Number(orderId) },
                    data: { paymentStatus: 'pending', paymentMethod: 'chapa' }
                });
            } catch (dbErr) {
                console.error('[PAYMENT] Failed to persist payment record:', dbErr.message);
            }
        }

        return res.json({
            checkout_url,
            tx_ref,
            message: 'Chapa payment initialized successfully'
        });
    } catch (err) {
        const chapaError = err.response?.data;
        const chapaStatus = err.response?.status;
        console.error('[PAYMENT ERROR] Chapa init error:', JSON.stringify(chapaError, null, 2) || err.message);
        console.error('[PAYMENT ERROR] Status code:', chapaStatus);
        console.error('[PAYMENT ERROR] Full error:', err.message);

        // Provide helpful error messages based on status code
        let userMessage = 'Failed to initialize payment. Please try again.';
        let suggestion = '';

        if (chapaStatus === 401) {
            userMessage = 'Invalid API Key or the business can\'t accept payments at the moment.';
            suggestion = 'Please verify your API key and ensure the account is active and able to process payments.';
            console.error('[PAYMENT ERROR] ⚠️ CHAPA API KEY IS INVALID! Get a valid key from https://dashboard.chapa.co');
        } else if (chapaStatus === 400) {
            userMessage = 'Invalid payment request.';
            const messageDetails = chapaError?.message || chapaError;
            suggestion = typeof messageDetails === 'string'
                ? messageDetails
                : JSON.stringify(messageDetails, null, 2);
            if (!suggestion) {
                suggestion = 'Please check your payment details and try again.';
            }
        } else if (chapaStatus === 403) {
            userMessage = 'Payment access forbidden.';
            suggestion = 'Your Chapa account may not be activated. Please verify your business account.';
        } else if (chapaStatus === 500) {
            userMessage = 'Chapa service is temporarily unavailable.';
            suggestion = 'Please try again in a few moments.';
        }

        const responseMessage = `${userMessage}${suggestion ? ' ' + suggestion : ''}`.trim();

        return res.status(chapaStatus || 500).json({
            error: String(userMessage),
            suggestion: String(suggestion),
            message: String(responseMessage),
            chapaError,
            statusCode: chapaStatus
        });
    }
};

/**
 * GET /api/payments/chapa/verify?tx_ref=...
 * Verify a Chapa transaction status and update payment/order accordingly
 * Uses official Chapa API v1 endpoint
 */
const verifyChapa = async (req, res) => {
    try {
        const { tx_ref } = req.query;

        if (!tx_ref) {
            return res.status(400).json({ error: 'tx_ref query parameter is required' });
        }

        if (!CHAPA_SECRET_KEY || CHAPA_SECRET_KEY === 'your_chapa_secret_key_here' || CHAPA_SECRET_KEY === 'MOCK_MODE_ENABLED') {
            return res.status(500).json({
                error: 'Chapa API key not configured',
                suggestion: 'Please add a valid CHAPA_SECRET_KEY to your .env file from https://dashboard.chapa.co'
            });
        }

        console.log('[PAYMENT VERIFY] Verifying transaction:', tx_ref);

        const order = await findOrderFromTxRef(tx_ref);

        // Call Chapa API v1 verify endpoint
        const response = await axios.get(
            `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                },
            }
        );

        const chapaData = response.data?.data || response.data;
        console.log('[PAYMENT VERIFY] Chapa API v1 verification response:', chapaData);

        const chapaStatus = chapaData?.status;

        let updatedOrder = order;
        if (chapaStatus === 'success' && order) {
            updatedOrder = await handleSuccessfulPayment(order.id, tx_ref);
        }

        return res.json({
            message: 'Payment verification successful',
            status: 'success',
            data: chapaData,
            order: updatedOrder
        });
    } catch (err) {
        console.error('[PAYMENT VERIFY ERROR]:', err.response?.data || err.message);

        return res.status(err.response?.status || 500).json({
            error: 'Failed to verify Chapa payment',
            details: err.response?.data || err.message
        });
    }
};

/**
 * POST /api/payments/chapa/callback
 * Webhook called by Chapa after payment
 * Uses official Chapa API v1 verification for confirmation
 */
const chapaCallback = async (req, res) => {
    try {
        console.log('Chapa callback received:', req.body);
        const tx_ref = req.body?.tx_ref || req.body?.data?.tx_ref || req.body?.transaction?.tx_ref;
        const status = req.body?.status || req.body?.data?.status || req.body?.transaction?.status;

        if (tx_ref) {
            const order = await findOrderFromTxRef(tx_ref);

            // Verify with Chapa API v1 to confirm payment status
            if (order && status === 'success') {
                try {
                    const response = await axios.get(
                        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
                        {
                            headers: {
                                Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                            },
                        }
                    );

                    const chapaData = response.data?.data || response.data;
                    const chapaStatus = chapaData?.status;

                    // Only process if Chapa API confirms success
                    if (chapaStatus === 'success') {
                        await handleSuccessfulPayment(order.id, tx_ref);
                    }
                } catch (verifyError) {
                    console.error('Failed to verify payment in callback:', verifyError.message);
                }
            } else if (order && status === 'failed') {
                try {
                    await prisma.payment.update({ where: { tx_ref }, data: { status: 'failed' } });
                    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'failed' } });
                } catch (dbErr) {
                    console.error('Failed to update failed payment/order from callback:', dbErr.message);
                }
            }
        }

        return res.status(200).json({ message: 'Callback received' });
    } catch (err) {
        console.error('Chapa callback error:', err.message);
        return res.status(500).json({ error: 'Callback handling failed' });
    }
};

module.exports = { initializeChapa, verifyChapa, chapaCallback };
