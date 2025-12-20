// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishCtrl = require('../controllers/wishlistController');

router.get('/wishlist', wishCtrl.getWishlist);
router.get('/wishlist/:userId', wishCtrl.getWishlistByUser);
router.post('/wishlist/add', wishCtrl.addToWishlist);
router.post('/wishlist/remove', wishCtrl.removeFromWishlist);

module.exports = router;
