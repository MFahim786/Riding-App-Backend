import express from 'express';
import passengerController from './controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', passengerController.registerPassenger);

router.post('/login', passengerController.loginPassenger);

router.get('/profile', authMiddleware,passengerController.getPassengerProfile);

router.put('/profile', passengerController.updatePassengerProfile);

export default router;
