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
import jwt from 'jsonwebtoken';
import compression from 'compression';
import passengerRoutes from './passenger/route.js';
import driverRoutes from './driver/route.js';
import vehicleRoutes from './vehicle/route.js';
import feedbackRatingRoutes from './feedback-rating/route.js';
// import { authPassenger } from './middleware/authMiddleware.js';
import { connectDB } from './utils/mongoDB.js';
import Ride from './ride/model.js'
import Driver from './driver/model.js'
import Passenger from './passenger/model.js'
import http from "http"
import Vehicle from './vehicle/model.js';
dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet());
connectDB()
// Enable CORS
const whitelist = ['https://ride-deploy.vercel.app', "http://localhost:3000", 'https://my-uber-app.vercel.app', 'http://localhost:3001', 'https://dev-kyoopay-admin.rtdemo.com'];
const corsOptions = {
  "/": {
    origin: ["https://ride-deploy.vercel.app", "http://localhost:3000", 'https://riding-app-backend.vercel.app', 'https://my-uber-app.vercel.app'], // Allowed origins for the /user route
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
app.use('/api/v1/feedback', feedbackRatingRoutes);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
// Protect routes that require authentication
// app.use('/api/passenger/profile', passengerRoutes);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000', 'https://0a8c-39-45-24-33.ngrok-free.app', 'https://ride-deploy.vercel.app', 'https://my-uber-app.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});
app.set("io", io)
const drivers = {};
const passengers = {};

// const registerDriver = (socket, driverId) => {
//   drivers[driverId] = socket;
// };

// const registerPassenger = (socket, passengerId) => {
//   passengers[passengerId] = socket;
// };

const emitSocketEvent = (userId, event, payload) => {
  io.to(userId.toString()).emit(event, payload);
};

const handleRideRequest = async (socket, data) => {
  try {
    console.log('handleRideRequest', data);

    // Ensure pickupLocation and dropoffLocation have valid coordinates
    // if (!data?.pickupLocation?.coordinates || data.pickupLocation.coordinates.length !== 2 ||
    //     !data?.dropoffLocation?.coordinates || data.dropoffLocation.coordinates.length !== 2) {
    //   throw new Error('Pickup and dropoff locations must be provided with valid coordinates.');
    // }

    // Reverse the coordinates (from [lat, lng] to [lng, lat])
    const reversedPickupCoordinates = [data.pickupLocation.coordinates[1], data.pickupLocation.coordinates[0]];
    const reversedDropoffCoordinates = [data.dropoffLocation.coordinates[1], data.dropoffLocation.coordinates[0]];
    const fee = data?.fare * 0.10;
    // Step 1: Create a new ride
    const newRide = new Ride({
      passenger: data?.passengerId,
      pickupLocation: {
        type: 'Point',
        coordinates: reversedPickupCoordinates,
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: reversedDropoffCoordinates,
      },
      distance: data.distance,
      
      fare: data?.fare,
      status: 'requested',
      onHoldBalance:fee
    });

    const savedRide = await newRide.save();

    // Step 2: Retrieve passenger information
    const passenger = await Passenger.findById(data?.passengerId).select('name email phone');
    if (!passenger) {
      throw new Error('Passenger not found');
    }

    // Step 3: Extract lat and lng from savedRide
    const { pickupLocation, dropoffLocation } = savedRide;
    const pickupCoordinates = {
      lat: pickupLocation.coordinates[1],
      lng: pickupLocation.coordinates[0],
    };
    const dropoffCoordinates = {
      lat: dropoffLocation.coordinates[1],
      lng: dropoffLocation.coordinates[0],
    };

    // Step 4: Add passenger and location details to the saved ride object
    const rideWithPassengerDetails = {
      ...savedRide.toObject(),
      pickupCoordinates,
      dropoffCoordinates,
      passenger: {
        _id: passenger._id,
        name: passenger.name,
        profileImage: passenger.profileImage,
        phone: passenger.phone,
      },
    };

    // Step 5: Find nearby drivers (commented out for now)
    const nearbyDrivers = await Driver.find({
      // Uncomment and adjust the following lines if needed
      // location: {
      //   $near: {
      //     $geometry: {
      //       type: 'Point',
      //       coordinates: reversedPickupCoordinates,
      //     },
      //     $maxDistance: 10000, // 10 km radius
      //   },
      // },
      // availability: true,
    });

    // Step 6: Emit the ride request event to nearby drivers
    nearbyDrivers.forEach((driver) => {
      emitSocketEvent(driver._id, 'rideRequest', rideWithPassengerDetails);
    });

    // Step 7: Emit the ride requested event to the passenger
    emitSocketEvent(data?.passengerId, 'rideRequested', rideWithPassengerDetails);

  } catch (error) {
    console.error('Error handling ride request:', error.message);
  }
};


const pickupRide = async (socket, data) => {
  try {
    console.log('pickupRide>>>>.', data);
    const ride = await Ride.findById(data?.rideId);
    if (!ride) {

      throw new Error('Ride not found');
    }
    
    console.log('ride>>>>>',ride)
    emitSocketEvent(ride?.passenger, 'pickupRide', {status:"pickup"});

  }
  catch (error) {
    console.error('Error picking up ride:', error.message);
  }
}

const completeRide = async (socket, data) => {
  try {
    console.log('pickupRide>>>>.', data);
    const ride = await Ride.findById(data?.rideId);
    if (!ride) {

      throw new Error('Ride not found');
    }
    ride.status='completed'
    const driver = await Driver.findById(ride.driver);
    driver.wallet -= ride.onHoldBalance;
    driver.save();
    ride.save();
    emitSocketEvent(ride?.passenger, 'completeRide', {status:"completeRide"});

  }
  catch (error) {
    console.error('Error picking up ride:', error.message);
  }
}

const handleAcceptRide = async (socket, { rideId, driverId }) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }


    // Retrieve driver information
    const driver = await Driver.findById(driverId).select('name rating driverImage phone');
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Retrieve vehicle information
    const vehicle = await Vehicle.findOne({ driver: driverId }).select('name numberPlate vehicleImage');
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Update ride status and driver
    ride.status = 'accepted';
    ride.driver = driverId;
    const updatedRide = await ride.save();
    // Add driver and vehicle information to the updated ride object
    const rideWithDetails = {
      ...updatedRide.toObject(),
      driver: {
        _id: driver._id,
        name: driver.name,
        rating: driver.rating,
        phone: driver.phone,
        driverImage: driver.driverImage,
      },
      vehicle: {
        name: vehicle.name,
        numberPlate: vehicle.numberPlate,
        vehicleImage: vehicle.vehicleImage,
      },
    };


    // Notify the passenger and driver
    emitSocketEvent(ride.passenger.toString(), 'rideAccepted', rideWithDetails);
    emitSocketEvent(driverId, 'rideAccepted', rideWithDetails);

  } catch (error) {
    console.error('Error accepting ride:', error);
  }
};


const handleConfirmRide = async (socket, { rideId, driverId }) => {
  const ride = await Ride.findById(rideId);
  if (ride) {
    ride.status = 'completed';
    // ride.driver = driverId;
    const updatedRide = await ride.save();
    emitSocketEvent(ride.passenger, 'rideCompleted', updatedRide);
    emitSocketEvent(driverId, 'rideCompleted', updatedRide);
  }
};

const handleCancelRide = async (socket, { rideId }) => {
  const ride = await Ride.findById(rideId);
  if (ride) {
    ride.status = 'cancelled';
    const updatedRide = await ride.save();
    console.log('cancelled >>>>>>>>>>>>>',ride)
    emitSocketEvent(ride.passenger, 'cancelRide', updatedRide);
    emitSocketEvent(ride.driver, 'cancelRide', updatedRide);
  }
};


const handleUpdatedLocation = async (socket, data, userId) => {

  try {

    console.log('handleUpdatedLocation', data);
    const { location } = data;
    const driver = await Driver.findById(userId);

    if (driver) {
      driver.location = {
        type: 'Point',
        coordinates: [location[1], location[0]]
      };
      await driver.save();

      // Find ongoing ride for this driver
      const ride = await Ride.findOne({ driver: userId });

      if (ride) {
        // Emit updated location to the passenger
        emitSocketEvent(ride.passenger.toString(), 'locationUpdate', { location });
      }
    }
  } catch (error) {
    console.error('Error updating location:', error.message);
  }
};


const initializeSocketIO = (io) => {
  return io.on('connection', async (socket) => {
    try {
      const authToken = socket.handshake.headers?.authorization;
      const decodedToken = await jwt.verify(authToken, 'myverysecuresecret');
      const userId = decodedToken.id.toString();
      socket.join(userId);
      socket.emit('connection', 'Connected successfully');


      console.log('client connected', userId)
      // socket.on('registerDriver', (driverId) => {
      //   registerDriver(socket, driverId);
      // });

      // socket.on('registerPassenger', (passengerId) => {
      //   registerPassenger(socket, passengerId);
      // });

      socket.on('rideRequest', (data) => {
        data = { ...data, passengerId: userId };

        console.log('>>>>', data)
        handleRideRequest(socket, data)
      });
      socket.on('acceptRide', (data) => handleAcceptRide(socket, data));
      socket.on('pickupRide', (data) => pickupRide(socket, data ));
      socket.on('completeRide', (data) => completeRide(socket, data ));

      socket.on('confirmRide', (data) => handleConfirmRide(socket, data));
      socket.on('cancelRide', (data) => handleCancelRide(socket, data));
      socket.on('updatedLocation', (data) => handleUpdatedLocation(socket, data, userId));

      socket.on('disconnect', () => {
        console.log('A user disconnected:', userId);
        delete drivers[userId];
        delete passengers[userId];
      });

    } catch (error) {
      console.error('Authentication error:', error.message);
      socket.disconnect();
    }
  });
};
initializeSocketIO(io)
