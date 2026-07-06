const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders || ((req, res) => res.json([])));
router.get('/:id', orderController.getOrderById || ((req, res) => res.status(404).json({ message: 'Not found' })));

module.exports = router;
