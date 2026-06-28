import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST, before any other imports
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Environment variables loaded

import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

// Import models
import User from './models/User.js';

// Import routes
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import hotelRoutes from './routes/hotels.js';
import bookingRoutes from './routes/bookings.js';
import packageRoutes from './routes/packages.js';
import flightRoutes from './routes/flights.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import searchRoutes from './routes/search.js';

// Import passport config
import './config/passport.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Or use specific URL if provided
    const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (origin === allowed) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// CSP headers to prevent warnings
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self';"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Make models available to routes
app.locals.User = User;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-booker')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(() => {});

// Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Travel Booker API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/trips',
      '/api/hotels',
      '/api/bookings',
      '/api/packages',
      '/api/flights',
      '/api/users',
      '/api/ai',
      '/api/search'
    ]
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Favicon route to prevent 404
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
