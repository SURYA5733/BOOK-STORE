const User = require('../models/User');
const Seller = require('../models/Seller');
const Order = require('../models/Order');
const Book = require('../models/Book');

async function listUsers(req,res){
  try { const users = await User.find().sort({ createdAt:-1 }); res.json(users); }
  catch(err){ console.error(err); res.status(500).json({ error:'Server Error' }); }
}
async function deleteUser(req,res){
  try{ await User.findByIdAndDelete(req.params.id); res.sendStatus(200); }
  catch(err){ console.error(err); res.status(500).json({ error:'Internal server error' }); }
}

async function listSellers(req,res){
  try{ const sellers = await Seller.find().sort({ createdAt:-1 }); res.json(sellers); }
  catch(err){ console.error(err); res.status(500).json({ error:'Server Error' }); }
}
async function deleteSeller(req,res){
  try{ await Seller.findByIdAndDelete(req.params.id); res.sendStatus(200); }
  catch(err){ console.error(err); res.status(500).json({ error:'Internal server error' }); }
}

async function listOrders(req,res){
  try{ const orders = await Order.find().sort({ createdAt:-1 }); res.json(orders); }
  catch(err){ console.error(err); res.status(500).json({ error:'Server Error' }); }
}

async function deleteOrder(req,res){
  try{ await Order.findByIdAndDelete(req.params.id); res.sendStatus(200); }
  catch(err){ console.error(err); res.status(500).json({ error:'Internal server error' }); }
}

async function listItems(req,res){
  try{ const items = await Book.find().sort({ createdAt:-1 }); res.json(items); }
  catch(err){ console.error(err); res.status(500).json({ error:'Server Error' }); }
}
async function deleteItem(req,res){
  try{ await Book.findByIdAndDelete(req.params.id); res.sendStatus(200); }
  catch(err){ console.error(err); res.status(500).json({ error:'Internal server error' }); }
}

module.exports = { listUsers, deleteUser, listSellers, deleteSeller, listOrders, deleteOrder, listItems, deleteItem };
