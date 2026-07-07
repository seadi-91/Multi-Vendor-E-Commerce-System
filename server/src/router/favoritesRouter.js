const express = require('express');
const { protect, customerOnly } = require('../middleware/auth');
const { getFavorites, addFavorite, removeFavorite } = require('../controller/favoritesController');

const router = express.Router();

router.get('/', protect, customerOnly, getFavorites);
router.post('/add', protect, customerOnly, addFavorite);
router.delete('/:productId', protect, customerOnly, removeFavorite);

module.exports = router;
