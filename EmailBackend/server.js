const express = require("express");const helmet = require("helmet");
const compression = require("compression");
const { errorHandler, AppError } = require("./src/utils/errorHandling");
const cors = require("cors");
require("dotenv").config();

const emailRoutes = require("./src/routes/email.routes");
const logger = require("./src/utils/logger");
const connectDB = require("./src/config/db.config");

const app = express();
const PORT = process.env.PORT || 3000;

//Initializations
connectDB();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(errorHandler);
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
app.use("/api/email", emailRoutes);

// Sample route
app.get("/test", (req, res, next) => {
  try {
    throw new AppError("This is a test error", 200);
  } catch (err) {
    next(err); // Pass to error handler
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});