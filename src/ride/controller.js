import Ride from '../model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';

const { OK, CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = HTTP_STATUS;

class RideController {
    async requestRide(req, res) {
        const { passengerId, pickupLocation, dropoffLocation, fare } = req.body;
    
        try {
          const newRide = new Ride({
            passenger: passengerId,
            pickupLocation,
            dropoffLocation,
            fare,
            status: 'requested'
          });
    
          const savedRide = await newRide.save();
    
          // Notify nearby drivers about the new ride request
          // You can implement real-time notifications using WebSockets or push notifications
    
          return sendSuccessResponse(res, CREATED, 'Ride requested successfully', savedRide);
        } catch (error) {
          return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error requesting ride', error.message);
        }
      }

  async acceptRide(req, res) {
    const rideId = req.params.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return sendErrorResponse(res, NOT_FOUND, 'Ride not found');
      }

      if (ride.status !== 'requested') {
        return sendErrorResponse(res, BAD_REQUEST, 'Ride cannot be accepted. It is not in requested status.');
      }

      ride.status = 'accepted';
      await ride.save();

      return sendSuccessResponse(res, OK, 'Ride accepted successfully', ride);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error accepting ride', error.message);
    }
  }

  async cancelRide(req, res) {
    const rideId = req.params.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return sendErrorResponse(res, NOT_FOUND, 'Ride not found');
      }

      ride.status = 'cancelled';
      await ride.save();

      return sendSuccessResponse(res, OK, 'Ride cancelled successfully', ride);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error cancelling ride', error.message);
    }
  }
}

export default new RideController();
