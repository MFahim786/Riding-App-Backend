import express from 'express';
import userController from './controller.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserProfile);
router.put('/profile',  userController.updateUserProfile);

export default router;
