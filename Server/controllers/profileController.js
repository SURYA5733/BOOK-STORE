// Backend/controllers/profileController.js
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');

function modelForRole(role) {
  if (role === 'user') return User;
  if (role === 'seller') return Seller;
  if (role === 'admin') return Admin;
  return null;
}

function imageUrl(req, stored) {
  if (!stored) return '';
  if (stored.startsWith('http://') || stored.startsWith('https://')) return stored;
  return `${req.protocol}://${req.get('host')}${stored}`;
}

async function getProfile(req, res) {
  try {
    const { id } = req.params;
    if (id) {
      const user = await User.findById(id) || await Seller.findById(id) || await Admin.findById(id);
      if (!user) return res.status(404).json({ error: 'Not found' });
      return res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone || '', image: imageUrl(req, user.image) });
    } else {
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
      const M = modelForRole(req.user.role);
      if (!M) return res.status(400).json({ error: 'Invalid role' });
      const me = await M.findById(req.user.id);
      if (!me) return res.status(404).json({ error: 'Profile not found' });
      return res.json({ id: me._id, name: me.name, email: me.email, phone: me.phone || '', image: imageUrl(req, me.image) });
    }
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function updateProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const M = modelForRole(req.user.role);
    if (!M) return res.status(400).json({ error: 'Invalid role' });

    const me = await M.findById(req.user.id);
    if (!me) return res.status(404).json({ error: 'Profile not found' });

    const { name, phone, email, imageLink } = req.body;

    if (name !== undefined) me.name = name;
    if (phone !== undefined) me.phone = phone;
    if (email !== undefined) me.email = email;

    // DEBUG: log req.file to check multer behavior
    console.log('profileController.updateProfile: req.file =', req.file);

    if (req.file) {
      const filePath = `/uploads/${path.basename(req.file.path)}`;
      if (me.image && me.image.startsWith('/uploads/')) {
        const prev = path.join(__dirname, '..', me.image);
        try { if (fs.existsSync(prev)) fs.unlinkSync(prev); } catch(e) { /* ignore */ }
      }
      me.image = filePath;
    } else if (imageLink !== undefined) {
      me.image = imageLink;
    }

    await me.save();

    res.json({
      id: me._id,
      name: me.name,
      email: me.email,
      phone: me.phone || '',
      image: me.image ? `${req.protocol}://${req.get('host')}${me.image}` : ''
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

module.exports = { getProfile, updateProfile };
