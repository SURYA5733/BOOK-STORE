// Backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

// user
router.post('/signup', authCtrl.userSignup);
router.post('/login', authCtrl.userLogin);

// seller
router.post('/ssignup', authCtrl.sellerSignup);
router.post('/slogin', authCtrl.sellerLogin);

// admin
router.post('/asignup', authCtrl.adminSignup);
router.post('/alogin', authCtrl.adminLogin);

module.exports = router;
