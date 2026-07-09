const axios = require('axios');
const prisma = require('../db/prismaClient');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_CALLBACK_URL = process.env.CHAPA_CALLBACK_URL || 'http://localhost:5000/api/payments/chapa/callback';
const CHAPA_RETURN_URL = process.env.CHAPA_RETURN_URL || 'http://localhost:5173/payment-success';

/**
 * Generate a transaction reference. If orderId is provided, use it for deterministic refs.
 */
const genTxRef = (orderId) => (orderId ? `ORDER-${orderId}-${Date.now()}` : `chapa_${Date.now()}_${Math.floor(Math.random() * 100000)}`);

/**
 * POST /api/payments/chapa/initiate
 * Initialise a Chapa payment transaction and return the checkout_url
 */
const initializeChapa = async (req, res) => {
    try {
        const { amount, email, first_name, last_name, orderId } = req.body;

        if (!amount || !email) {
            return res.status(400).json({ error: 'amount and email are required' });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'amount must be a positive number' });
        }

        const tx_ref = genTxRef(orderId);

        const payload = {
            amount: parsedAmount.toFixed(2),
            currency: 'ETB',
            email: email.trim(),
            first_name: (first_name || 'Customer').trim() || 'Customer',
            last_name: (last_name || 'User').trim() || 'User',
            tx_ref,
            callback_url: CHAPA_CALLBACK_URL,
            return_url: `${CHAPA_RETURN_URL}?tx_ref=${tx_ref}`,
            title: 'FarmConnect Order Payment',
            description: 'Payment for your FarmConnect order',
        };

        console.log('Sending to Chapa:', JSON.stringify(payload, null, 2));

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

        const checkout_url = response.data?.data?.checkout_url;
        if (!checkout_url) {
            throw new Error('No checkout_url returned from Chapa');
        }

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
                console.error('Failed to persist payment record:', dbErr.message || dbErr);
            }
        }

        return res.json({ checkout_url, tx_ref });
    } catch (err) {
        const chapaError = err.response?.data;
        console.error('Chapa init error status:', err.response?.status);
        console.error('Chapa init error body:', JSON.stringify(chapaError, null, 2));
        console.error('Chapa init raw error:', err.message);
        return res.status(500).json({
            error: 'Failed to initialise Chapa payment',
            chapaError,
            message: err.message,
        });
    }
};

/**
 * GET /api/payments/chapa/verify?tx_ref=...
 * Verify a Chapa transaction status and update payment/order accordingly
 */
const verifyChapa = async (req, res) => {
    try {
        const { tx_ref } = req.query;

        if (!tx_ref) {
            return res.status(400).json({ error: 'tx_ref query parameter is required' });
        }

        const response = await axios.get(
            `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                },
            }
        );

        try {
            const chapaData = response.data?.data || response.data;
            const status = chapaData?.status;

            const payment = await prisma.payment.findUnique({ where: { tx_ref } });
            if (payment) {
                const newStatus = status === 'success' ? 'paid' : (status === 'failed' ? 'failed' : 'pending');
                await prisma.payment.update({ where: { tx_ref }, data: { status: newStatus } });

                const orderIdNum = Number(payment.orderId) || null;
                if (orderIdNum) {
                    if (newStatus === 'paid') {
                        await prisma.order.update({ where: { id: orderIdNum }, data: { paymentStatus: 'paid', status: 'confirmed' } });
                    } else if (newStatus === 'failed') {
                        await prisma.order.update({ where: { id: orderIdNum }, data: { paymentStatus: 'failed' } });
                    }
                }
            }
        } catch (dbErr) {
            console.error('Failed to update payment/order after verify:', dbErr.message || dbErr);
        }

        return res.json(response.data);
    } catch (err) {
        console.error('Chapa verify error:', err.response?.data || err.message);
        return res.status(500).json({
            error: 'Failed to verify Chapa payment',
            details: err.response?.data || err.message,
        });
    }
};

/**
 * POST /api/payments/chapa/callback
 * Webhook called by Chapa after payment
 */
const chapaCallback = async (req, res) => {
    try {
        console.log('Chapa callback received:', req.body);
        const tx_ref = req.body?.tx_ref || req.body?.data?.tx_ref || req.body?.transaction?.tx_ref;
        const status = req.body?.status || req.body?.data?.status || req.body?.transaction?.status;

        if (tx_ref) {
            try {
                const payment = await prisma.payment.findUnique({ where: { tx_ref } });
                if (payment) {
                    const newStatus = status === 'success' ? 'paid' : (status === 'failed' ? 'failed' : 'pending');
                    await prisma.payment.update({ where: { tx_ref }, data: { status: newStatus } });

                    const orderIdNum = Number(payment.orderId) || null;
                    if (orderIdNum) {
                        if (newStatus === 'paid') {
                            await prisma.order.update({ where: { id: orderIdNum }, data: { paymentStatus: 'paid', status: 'confirmed' } });
                        } else if (newStatus === 'failed') {
                            await prisma.order.update({ where: { id: orderIdNum }, data: { paymentStatus: 'failed' } });
                        }
                    }
                }
            } catch (dbErr) {
                console.error('Failed to update payment/order from callback:', dbErr.message || dbErr);
            }
        }

        return res.status(200).json({ message: 'Callback received' });
    } catch (err) {
        console.error('Chapa callback error:', err.message);
        return res.status(500).json({ error: 'Callback handling failed' });
    }
};

module.exports = { initializeChapa, verifyChapa, chapaCallback };
