const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', reviewController.getProductReviews);
router.get('/me', protect, reviewController.getMyReviews);
router.post('/', protect, reviewController.createReview);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
