import express from 'express';
import FeedbackRatingController from './controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/', FeedbackRatingController.submitFeedbackRating);
router.get('/:driverId', FeedbackRatingController.getRideDetails);

// router.post('/login', FeedbackRatingController.loginPassenger);



export default router;
