const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Book = require('../models/Book');


function fileUrl(req, filepath) {
  if (!filepath) return '';
  if (filepath.startsWith('http://') || filepath.startsWith('https://')) return filepath;
  const p = filepath.startsWith('/') ? filepath : `/${filepath}`;
  return `${req.protocol}://${req.get('host')}${p}`;
}

async function createItem(req, res) {
  try {
    const {
      title,
      author,
      genre,
      description = '',
      price,
      stockQty,
      coverImageLink,
      userName
    } = req.body;

    if (!title || !author || !genre) {
      return res.status(400).json({ error: 'title, author and genre are required' });
    }

    const payload = {
      title,
      author,
      genre,
      description,
      userName: userName || ''
    };

    if (price !== undefined && price !== '') {
      const p = Number(price);
      if (Number.isNaN(p)) return res.status(400).json({ error: 'price must be a number' });
      payload.price = p;
    }
    if (stockQty !== undefined && stockQty !== '') {
      const s = Number(stockQty);
      if (Number.isNaN(s) || s < 0) return res.status(400).json({ error: 'stockQty must be a non-negative integer' });
      payload.stockQty = Math.floor(s);
    }

    // files: uploadMiddleware stores in req.files (fields)
    if (req.files) {
      if (req.files['coverImageFile'] && req.files['coverImageFile'][0]) {
        payload.coverImageFile = `/uploads/${path.basename(req.files['coverImageFile'][0].path)}`;
      }
      if (req.files['pdfFile'] && req.files['pdfFile'][0]) {
        payload.pdfFile = `/uploads/${path.basename(req.files['pdfFile'][0].path)}`;
      }
    }

    if (coverImageLink && coverImageLink.trim() !== '') payload.coverImageLink = coverImageLink.trim();

    if (req.user && req.user.role === 'seller') {
      payload.owner = req.user.id;
    } else if (req.body.owner && mongoose.Types.ObjectId.isValid(req.body.owner)) {
      payload.owner = req.body.owner;
    }

    const book = new Book(payload);
    await book.save();

    const out = book.toObject();
    out.coverImageFile = fileUrl(req, out.coverImageFile);
    out.pdfFile = fileUrl(req, out.pdfFile);

    res.status(201).json(out);
  } catch (err) {
    console.error('createItem error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'ValidationError', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to create item', detail: err.message });
  }
}

async function updateItem(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid book id' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // authorization: sellers can only edit their own books; admins can edit all
    if (req.user && req.user.role === 'seller') {
      if (!book.owner || book.owner.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: you can only edit your own books' });
      }
    } else if (!req.user) {
      // if not authenticated, block update
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      title,
      author,
      genre,
      description,
      price,
      stockQty,
      coverImageLink
    } = req.body;

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (genre !== undefined) book.genre = genre;
    if (description !== undefined) book.description = description;
    if (price !== undefined && price !== '') {
      const p = Number(price);
      if (Number.isNaN(p)) return res.status(400).json({ error: 'price must be a number' });
      book.price = p;
    }
    if (stockQty !== undefined && stockQty !== '') {
      const s = Number(stockQty);
      if (Number.isNaN(s) || s < 0) return res.status(400).json({ error: 'stockQty must be non-negative' });
      book.stockQty = Math.floor(s);
    }
    if (coverImageLink !== undefined) book.coverImageLink = coverImageLink;

    if (req.files) {
      if (req.files['coverImageFile'] && req.files['coverImageFile'][0]) {
        book.coverImageFile = `/uploads/${path.basename(req.files['coverImageFile'][0].path)}`;
      }
      if (req.files['pdfFile'] && req.files['pdfFile'][0]) {
        book.pdfFile = `/uploads/${path.basename(req.files['pdfFile'][0].path)}`;
      }
    }

    await book.save();

    const out = book.toObject();
    out.coverImageFile = fileUrl(req, out.coverImageFile);
    out.pdfFile = fileUrl(req, out.pdfFile);

    res.json(out);
  } catch (err) {
    console.error('updateItem error:', err);
    res.status(500).json({ error: 'Failed to update item', detail: err.message });
  }
}

async function getItem(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Not found' });
    const out = book.toObject();
    out.coverImageFile = fileUrl(req, out.coverImageFile);
    out.pdfFile = fileUrl(req, out.pdfFile);
    res.json(out);
  } catch (err) {
    console.error('getItem error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function viewPdf(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    const book = await Book.findById(id);
    if (!book || !book.pdfFile) return res.status(404).json({ error: 'PDF not found' });

    const filePath = path.join(__dirname, '..', book.pdfFile);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error('viewPdf error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function downloadPdf(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    const book = await Book.findById(id);
    if (!book || !book.pdfFile) return res.status(404).json({ error: 'PDF not found' });

    const filePath = path.join(__dirname, '..', book.pdfFile);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

    res.download(filePath);
  } catch (err) {
    console.error('downloadPdf error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function getAllItems(req, res) {
  try {
    const items = await Book.find().sort({ createdAt: -1 });
    // convert file paths to URLs
    const out = items.map(b => {
      const o = b.toObject();
      o.coverImageFile = fileUrl(req, o.coverImageFile);
      o.pdfFile = fileUrl(req, o.pdfFile);
      return o;
    });
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function getItemsBySeller(req, res) {
  try {
    const sellerId = req.params.userId;
    const items = await Book.find({ owner: sellerId }).sort({ createdAt: -1 });
    const out = items.map(b => {
      const o = b.toObject();
      o.coverImageFile = fileUrl(req, o.coverImageFile);
      o.pdfFile = fileUrl(req, o.pdfFile);
      return o;
    });
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


 // get Item by  Genre
 async function getItemsByGenre(req, res) {
   try {
     const genre = req.params.genre;  
      const items = await Book.find({ genre: genre }).sort({ createdAt: -1 });  
      const out = items.map(b => {  
        const o = b.toObject();
        o.coverImageFile = fileUrl(req, o.coverImageFile);
        o.pdfFile = fileUrl(req, o.pdfFile);
        return o;
      });  
      res.json(out);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
   }
}


// reviews
async function addReview(req, res) {
  try {
    const { id } = req.params;
    const { userId, userName, rating, comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    if (!rating) return res.status(400).json({ error: 'rating required' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    book.reviews.push({ userId: userId || null, userName: userName || 'User', rating: Number(rating), comment: comment || '' });
    const avg = book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length;
    book.rating = Math.round(avg * 10) / 10;
    await book.save();

    const out = book.toObject();
    out.coverImageFile = fileUrl(req, out.coverImageFile);
    out.pdfFile = fileUrl(req, out.pdfFile);

    res.json({ success: true, book: out });
  } catch (err) {
    console.error('addReview err', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createItem,
  updateItem,
  getItem,
  getAllItems,
  getItemsBySeller,
  deleteItem,
  viewPdf,
  downloadPdf,
  addReview,
  getItemsByGenre
};
