// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
// optionally protect routes with authMiddleware & roleCheck
// const { authMiddleware, roleCheck } = require('../middlewares/authMiddleware');

router.get('/users', adminCtrl.listUsers);
router.delete('/userdelete/:id', adminCtrl.deleteUser);

router.get('/sellers', adminCtrl.listSellers);
router.delete('/sellerdelete/:id', adminCtrl.deleteSeller);

router.get('/orders', adminCtrl.listOrders);
router.delete('/userorderdelete/:id', adminCtrl.deleteOrder);

router.get('/items', adminCtrl.listItems);
router.delete('/itemdelete/:id', adminCtrl.deleteItem);

module.exports = router;
