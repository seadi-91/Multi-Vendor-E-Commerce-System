const express = require('express');
const { initializeChapa, verifyChapa, chapaCallback } = require('../controller/paymentController');

const router = express.Router();

// Initiate a Chapa payment transaction
router.post('/chapa/initiate', initializeChapa);

// Verify a Chapa payment transaction
router.get('/chapa/verify', verifyChapa);

// Chapa webhook callback (called by Chapa after payment)
router.post('/chapa/callback', chapaCallback);

module.exports = router;
