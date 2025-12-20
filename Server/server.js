// Backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db/config');

const profileRoutes = require('./routes/profileRoutes'); 
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes'); 
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes'); 
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

const clientOrigins = (process.env.CLIENT_ORIGINS || '').split(',').filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: clientOrigins.length ? clientOrigins : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (authRoutes) app.use('/', authRoutes);
if (orderRoutes) app.use('/', orderRoutes);
if (wishlistRoutes) app.use('/', wishlistRoutes);
if (adminRoutes) app.use('/', adminRoutes);
if (profileRoutes) app.use('/', profileRoutes);

app.use('/', itemRoutes);

// health
app.get('/ping', (req, res) => res.json({ pong: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
