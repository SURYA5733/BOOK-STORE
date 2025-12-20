// Backend/controllers/orderController.js
const Order = require('../models/Order');

async function createOrder(req, res) {
  try {
    // If authenticated, prefer server-side user; otherwise fallback if client provided userId
    const user = req.user;
    const payload = req.body || {};
    const items = Array.isArray(payload.items) ? payload.items : (payload.items ? [payload.items] : []);

    const order = new Order({
      flatno: payload.flatno || '',
      city: payload.city || '',
      state: payload.state || '',
      pincode: payload.pincode || '',
      totalamount: Number(payload.totalamount) || 0,
      seller: payload.seller || '',
      sellerId: payload.sellerId || null,
      BookingDate: payload.BookingDate || new Date().toLocaleDateString('en-IN'),
      description: payload.description || '',
      Delivery: payload.Delivery || (() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toLocaleDateString('en-IN') })(),
      userId: user ? user.id : (payload.userId || null),
      userName: user ? (user.name || payload.userName || '') : (payload.userName || ''),
      items
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error(err); res.status(400).json({ error:'Failed to create order', detail: err.message });
  }
}

async function getOrdersByUser(req, res) {
  try {
    const userId = req.params.userId;
    const tasks = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Failed to fetch tasks' });
  }
}

async function getOrdersBySeller(req, res) {
  try {
    const sellerId = req.params.userId;
    const tasks = await Order.find({ sellerId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Failed to fetch tasks' });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Server Error' });
  }
}

async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Internal server error' });
  }
}

module.exports = { createOrder, getOrdersByUser, getOrdersBySeller, getAllOrders, deleteOrder };
