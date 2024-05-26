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
import vehicleRoutes from './vehicle/route.js';
// import { authPassenger } from './middleware/authMiddleware.js';
import { connectDB } from './utils/mongoDB.js';
import http from "http"
dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet());
connectDB()
// Enable CORS
const whitelist = ["http://localhost:3000",'https://dev-kyoopay-be.rtdemo.com','http://localhost:3001','https://dev-kyoopay-admin.rtdemo.com'];
const corsOptions = {
  "/": {
    origin: ["http://localhost:3001", "http://localhost:3000"], // Allowed origins for the /user route
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

const server = http.createServer(app,{
  cors: {
      origin: ['http://localhost:3000','http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
  }
});
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
app.use('/api/v1/vehicles', vehicleRoutes);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
// Protect routes that require authentication
// app.use('/api/passenger/profile', passengerRoutes);
const drivers = {};
const passengers = {};

// Socket.io implementation
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('registerDriver', (driverId) => {
    drivers[driverId] = socket;
  });

  socket.on('registerPassenger', (passengerId) => {
    passengers[passengerId] = socket;
  });

  socket.on('rideRequest', async ({ passengerId, pickupLocation, dropoffLocation, fare }) => {
    const newRide = new Ride({
      passenger: passengerId,
      pickupLocation,
      dropoffLocation,
      fare,
      status: 'requested',
    });

    const savedRide = await newRide.save();

    const nearbyDrivers = await Driver.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: pickupLocation.coordinates,
          },
          $maxDistance: 10000, // 10 km radius
        },
      },
      availability: true,
    });

    nearbyDrivers.forEach((driver) => {
      if (drivers[driver._id]) {
        drivers[driver._id].emit('rideRequest', savedRide);
      }
    });

    passengers[passengerId].emit('rideRequested', savedRide);
  });

  socket.on('acceptRide', async ({ rideId, driverId }) => {
    const ride = await Ride.findById(rideId);
    if (ride) {
      ride.status = 'accepted';
      ride.driver = driverId;
      const updatedRide = await ride.save();

      if (passengers[ride.passenger]) {
        passengers[ride.passenger].emit('driverAccepted', updatedRide);
      }
    }
  });

  socket.on('confirmRide', async ({ rideId, driverId }) => {
    const ride = await Ride.findById(rideId);
    if (ride) {
      ride.status = 'confirmed';
      ride.driver = driverId;
      const updatedRide = await ride.save();

      if (drivers[driverId]) {
        drivers[driverId].emit('rideConfirmed', updatedRide);
      }
    }
  });

  socket.on('cancelRide', async ({ rideId }) => {
    const ride = await Ride.findById(rideId);
    if (ride) {
      ride.status = 'cancelled';
      const updatedRide = await ride.save();

      if (passengers[ride.passenger]) {
        passengers[ride.passenger].emit('rideCancelled', updatedRide);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
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
