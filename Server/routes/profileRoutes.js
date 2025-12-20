// Backend/routes/profileRoutes.js
const express = require('express')
const router = express.Router()
const { authMiddleware, requireAuth } = require('../middlewares/authMiddleware')
const upload = require('../middlewares/uploadMiddleware')
const profileCtrl = require('../controllers/profileController')

// get my profile (requires auth)
router.get('/profile', authMiddleware, profileCtrl.getProfile)

// get profile by id (public)
router.get('/profile/:id', profileCtrl.getProfile)

// update my profile (auth required). Accepts form-data 'avatar' or JSON imageLink
router.put('/profile', requireAuth, upload.uploadSingle('avatar'), profileCtrl.updateProfile)

module.exports = router
