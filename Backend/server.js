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
const imageRouter = require('./routes/api/image');
const metricRouter = require('./routes/api/metrics')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
const corsOptions = {
  origin: (origin, callback) => {
    const allowedPattern = /\.onrender\.com$/; // Match any subdomain of onrender.com
    if (!origin || // Allow direct access without an origin (e.g., browser requests)
        origin === 'http://localhost:3000' || // Allow local development
        allowedPattern.test(origin)) { // Allow matching onrender domains
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  },
  credentials: true, // Allow cookies or other credentials
};

app.use(cors(corsOptions));

// Enable preflight requests (e.g., for OPTIONS method)
app.options('*', cors(corsOptions));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/home', homeRoutes);
app.use('/admin/session', sessionRoute);
app.use('/api/dashboard', dashboardApiRoute);
app.use("/api/redis", redisRouter);  // Mount the redisRouter at /api/redis
app.use('/api/image', imageRouter);
app.use('/api/metrics', metricRouter);

app.use("/uploads", express.static("uploads"));


// Fallback route to redirect to login if unauthorized
app.use((req, res, next) => {
  const token = req.cookies?.token;

  // Skip redirection for API and auth routes
  if (req.path.startsWith('/auth') || req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }

  if (!token) {
    return res.redirect('/auth/login');
  }
  next();
});

app.use((err, req, res, next) => {
  console.error('Error occurred:', err); // Log the error
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
  next();
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

app.get("/health", async (req,res) => {
  return res.status(200).json({Status: "Backend is alive and Kicking"});
})

// Start Server
app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));
