// Backend/routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const itemCtrl = require('../controllers/itemController');
const upload = require('../middlewares/uploadMiddleware');
const { authMiddleware, roleCheckAny } = require('../middlewares/authMiddleware');

// create - seller or admin
router.post(
  '/items',
  authMiddleware,
  roleCheckAny(['seller','admin']),
  upload.uploadFields([{ name: 'coverImageFile', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]),
  itemCtrl.createItem
);

// update - seller (owner) or admin
router.put(
  '/items/:id',
  authMiddleware,
  upload.uploadFields([{ name: 'coverImageFile', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]),
  itemCtrl.updateItem
);

router.get('/item', itemCtrl.getAllItems);
router.get('/item/:id', itemCtrl.getItem);

// view/download pdf
router.get('/item/:id/pdf/view', itemCtrl.viewPdf);
router.get('/item/:id/pdf/download', itemCtrl.downloadPdf);

// seller items (owner)
router.get('/getitem/:userId', itemCtrl.getItemsBySeller);
router.delete('/itemdelete/:id', authMiddleware, itemCtrl.deleteItem);

// reviews
router.post('/item/:id/review', authMiddleware, itemCtrl.addReview);

// get items by genre only login required
router.get('/items/genre/:genre', itemCtrl.getItemsByGenre)


module.exports = router;
