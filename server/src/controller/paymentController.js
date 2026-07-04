const axios = require('axios');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_CALLBACK_URL = process.env.CHAPA_CALLBACK_URL || 'http://localhost:5000/api/payments/chapa/callback';
const CHAPA_RETURN_URL = process.env.CHAPA_RETURN_URL || 'http://localhost:5173/customer/checkout/success';

/**
 * Generate a unique transaction reference
 */
const genTxRef = () =>
  `chapa_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

/**
 * POST /api/payments/chapa/initiate
 * Initialise a Chapa payment transaction and return the checkout_url
 */
const initializeChapa = async (req, res) => {
  try {
    const { amount, email, first_name, last_name } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ error: 'amount and email are required' });
    }

    // Ensure amount is a valid 2-decimal string (Chapa requires it)
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const tx_ref = genTxRef();

    const payload = {
      amount: parsedAmount.toFixed(2),           // e.g. "150.00"
      currency: 'ETB',
      email: email.trim(),
      first_name: (first_name || 'Customer').trim() || 'Customer',
      last_name: (last_name || 'User').trim() || 'User',  // must NOT be empty
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
 * Verify a Chapa transaction status
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
 * Webhook called by Chapa after payment (optional – logs and responds 200)
 */
const chapaCallback = async (req, res) => {
  try {
    console.log('Chapa callback received:', req.body);
    // TODO: update order payment status in DB using req.body.tx_ref
    return res.status(200).json({ message: 'Callback received' });
  } catch (err) {
    console.error('Chapa callback error:', err.message);
    return res.status(500).json({ error: 'Callback handling failed' });
  }
};

module.exports = { initializeChapa, verifyChapa, chapaCallback };
