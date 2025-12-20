// Backend/controllers/authController.js
const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwtUtil');
require('dotenv').config();

const User = require('../models/User');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

// helper: check body & required fields
function ensureBody(req, res, fields = []) {
  if (!req.body) {
    console.error('authController: req.body is undefined. Headers:', req.headers);
    return res.status(400).json({ message: 'Request body is missing. Make sure Content-Type: application/json and body is sent.' });
  }
  for (const f of fields) {
    if (!Object.prototype.hasOwnProperty.call(req.body, f) || req.body[f] === undefined || req.body[f] === null) {
      return res.status(400).json({ message: `Missing required field: ${f}` });
    }
  }
  return null;
}

// Generic signup helper
async function signupModel(Model, req, res, role) {
  try {
    const err = ensureBody(req, res, ['name','email','password']);
    if (err) return; // response already sent

    const { name, email, password } = req.body;
    const exists = await Model.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Already have an account' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await Model.create({ name, email, password: hashed });
    const token = signToken({ id: created._id.toString(), role, email: created.email, name: created.name });
    return res.status(201).json({ message: 'Account Created', token, user: { id: created._id.toString(), name: created.name, email: created.email, role } });
  } catch (err) {
    console.error('signupModel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Generic login helper
async function loginModel(Model, req, res, role) {
  try {
    const err = ensureBody(req, res, ['email','password']);
    if (err) return; // response already sent

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password cannot be empty' });
    }

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: 'no user' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'login fail' });

    const token = signToken({ id: user._id.toString(), role, email: user.email, name: user.name });
    return res.json({ Status: 'Success', token, user: { id: user._id.toString(), name: user.name, email: user.email, role } });
  } catch (err) {
    console.error('loginModel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  userSignup: (req, res) => signupModel(User, req, res, 'user'),
  userLogin: (req, res) => loginModel(User, req, res, 'user'),
  sellerSignup: (req, res) => signupModel(Seller, req, res, 'seller'),
  sellerLogin: (req, res) => loginModel(Seller, req, res, 'seller'),
  adminSignup: (req, res) => signupModel(Admin, req, res, 'admin'),
  adminLogin: (req, res) => loginModel(Admin, req, res, 'admin')
};
