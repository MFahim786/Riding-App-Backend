import FeedbackRating from './model.js';
import Ride from '../ride/model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';

const { OK, CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = HTTP_STATUS;

class FeedbackRatingController {
  async submitFeedbackRating(req, res) {
    // const { ride, passenger, driver, rating, feedback } = req.body;
    const { ride, rating, feedback } = req.body;

    try {
      // Find the ride by ID
      console.log('rideId',req.body)
      const savedRide = await Ride.findById(ride);
  
      if (!savedRide) {
        return res.status(404).json({ message: 'Ride not found' });
      }
  
      // Update rating and feedback
      savedRide.rating = rating;
      savedRide.feedback = feedback;
  
      // Save the ride
      const updatedRide = await savedRide.save();
  
      res.status(200).json({
        message: 'Feedback and rating added successfully',
        ride: updatedRide,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }


  async getRideDetails (req, res)  {
    const { driverId } = req.params;

    try {
      // Find all rides where the driverId matches and populate passenger details
      const rides = await Ride.find({ driver: driverId }).populate('passenger', 'image');
  
      if (!rides || rides.length === 0) {
        return res.status(404).json({ message: 'No rides found for this driver' });
      }
  
      // Map over the rides to format the response
      const formattedRides = rides.map((ride) => ({
        passenger: {
          name: "ride.passenger.name",
          image: "ride.passenger.image",
        },
        createdAt: ride.createdAt,
        fare: ride.fare,
        distance: ride.distance,
        rating: ride.rating,
        feedback: ride.feedback,
      }));
  
      res.status(200).json(formattedRides);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
}

export default new FeedbackRatingController();
