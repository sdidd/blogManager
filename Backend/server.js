const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const sessionRoute = require('./routes/session');
const dashboardApiRoute = require('./routes/api/dashboard');
const redisRouter = require('./routes/api/redis');
const imageRouter = require('./routes/api/image')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
const corsOptions = {
  origin: (origin, callback) => {
    const allowedPattern = /^https:\/\/frontend-[a-z0-9]+\.onrender\.com$/;
    if (origin === 'http://localhost:3000' || // Allow local development
      origin && allowedPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.options('*', cors());

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/home', homeRoutes);
app.use('/admin/session', sessionRoute);
app.use('/api/dashboard', dashboardApiRoute);
app.use("/api/redis", redisRouter);  // Mount the redisRouter at /api/redis
app.use('/api/image', imageRouter);

app.use("/uploads", express.static("uploads"));


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

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
  next();
});

app.get("/health", async (req,res) => {
  return res.status(200).json({Status: "Backend is alive and kicking!!"});
})

// Start Server
app.listen(process.env.PORT, () => console.log('Server running on http://localhost:4000'));
