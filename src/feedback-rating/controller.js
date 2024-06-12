import FeedbackRating from './model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';

const { OK, CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = HTTP_STATUS;

class FeedbackRatingController {
  async submitFeedbackRating(req, res) {
    const { ride, passenger, driver, rating, feedback } = req.body;

    try {
      const newFeedbackRating = new FeedbackRating({
        ride,
        passenger,
        driver,
        rating,
        feedback
      });

      const savedFeedbackRating = await newFeedbackRating.save();

      return sendSuccessResponse(res, CREATED, 'Feedback and rating submitted successfully', savedFeedbackRating);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error submitting feedback and rating', error.message);
    }
  }
}

export default new FeedbackRatingController();
