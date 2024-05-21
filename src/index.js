import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
  
import cors from 'cors';  
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import passengerRoutes from './passenger/route.js'; 
import driverRoutes from './driver/route.js';
// import { authPassenger } from './middleware/authMiddleware.js';
import { connectDB } from './utils/mongoDB.js';
import http from "http"
dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet());
connectDB()
// Enable CORS
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);
// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again later!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Compress responses
app.use(compression());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/passenger', passengerRoutes);
app.use('/api/v1/driver', driverRoutes);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
// Protect routes that require authentication
// app.use('/api/passenger/profile', passengerRoutes);
io.on('connection', async (socket) => {
    console.log('A passenger connected');
    
    // Fetch nearby drivers and emit them to the passenger
    try {
      const nearbyDrivers = await Driver.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [passengerLocation] // Replace with passenger's location
            },
            $maxDistance: radius * 1000 // Convert radius from kilometers to meters
          }
        },
        availability: true
      });
  
      socket.emit('nearbyDrivers', nearbyDrivers);
    } catch (error) {
      console.error('Error fetching nearby drivers:', error);
    }
  });
// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
