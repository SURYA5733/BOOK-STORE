// Backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const { requireAuth } = require('../middlewares/authMiddleware');

// create order — prefer server-side user if authenticated
router.post('/userorder', requireAuth, orderCtrl.createOrder);

router.get('/getorders/:userId', orderCtrl.getOrdersByUser);
router.get('/getsellerorders/:userId', orderCtrl.getOrdersBySeller);
router.get('/orders', orderCtrl.getAllOrders);
router.delete('/userorderdelete/:id', orderCtrl.deleteOrder);

module.exports = router;
