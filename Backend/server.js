const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/home', homeRoutes);

// Fallback route to redirect to login if unauthorized
app.use((req, res, next) => {
  const token = req.cookies?.token;

  // Skip redirection for auth-related routes
  if (req.path.startsWith('/auth')) {
    return next();
  }

  if (!token) {
    return res.redirect('/auth/login');
  }
  next();
});


// Start Server
app.listen(4000, () => console.log('Server running on http://localhost:4000'));
