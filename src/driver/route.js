import express from 'express';
import driverController from './controller.js';

const router = express.Router();

router.post('/register', driverController.registerDriver);

router.post('/login', driverController.loginDriver);

router.get('/profile', driverController.getDriverProfile);

router.put('/profile', driverController.updateDriverProfile);

export default router;
