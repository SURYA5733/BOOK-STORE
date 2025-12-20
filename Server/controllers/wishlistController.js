// controllers/wishlistController.js
const WishlistItem = require('../models/WishlistItem');

async function getWishlist(req, res) {
  try {
    const items = await WishlistItem.find().sort({ createdAt:-1 });
    res.json(items);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Server Error' });
  }
}

async function getWishlistByUser(req, res) {
  try {
    const userId = req.params.userId;
    const items = await WishlistItem.find({ userId }).sort({ createdAt:-1 });
    res.json(items);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Failed to fetch tasks' });
  }
}

async function addToWishlist(req, res) {
  try {
    const { itemId, title, itemImage, userId, userName } = req.body;
    const existing = await WishlistItem.findOne({ itemId, userId });
    if (existing) return res.status(400).json({ msg: 'Item already in wishlist' });
    const newItem = new WishlistItem({ itemId, title, itemImage, userId, userName });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Server Error' });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const { itemId, userId } = req.body;
    await WishlistItem.findOneAndDelete({ itemId, userId });
    res.json({ msg: 'Item removed from wishlist' });
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Server Error' });
  }
}

module.exports = { getWishlist, getWishlistByUser, addToWishlist, removeFromWishlist };
