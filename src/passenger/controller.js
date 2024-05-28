import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Passenger from './model.js';
import Wallet from '../wallet/model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';

const { OK, CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = HTTP_STATUS;

class PassengerController {
  async registerPassenger(req, res) {
    try {
      const { email, password } = req.body;
      const existingPassenger = await Passenger.findOne({ email });
      if (existingPassenger) {
        return sendErrorResponse(res, BAD_REQUEST, 'Passenger already exists');
      }
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.HASH_SALT_ROUNDS, 10));
      const passengerData = {
        ...req.body,
        password: hashedPassword
      };
      const passenger = new Passenger(passengerData);
      const savedPassenger = await passenger.save();
  
      const wallet = new Wallet({
        owner: savedPassenger._id,
        ownerModel: 'Passenger',
        balance: 0,
        transactions: []
      });
  
      const savedWallet = await wallet.save();
      savedPassenger.wallet = savedWallet._id;
      await savedPassenger.save();
  
      return sendSuccessResponse(res, CREATED, 'Passenger registered successfully', savedPassenger);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error registering passenger', error.message);
    }
  }
  

  async loginPassenger(req, res) {
    const { email, password } = req.body;

    try {
      const passenger = await Passenger.findOne({ email });
      if (!passenger) {
        return sendErrorResponse(res, NOT_FOUND, 'Passenger not found');
      }

      const isMatch = await bcrypt.compare(password, passenger.password);
      if (!isMatch) {
        return sendErrorResponse(res, BAD_REQUEST, 'Invalid credentials');
      }

      const token = jwt.sign({ id: passenger._id }, process.env.JWT_SECRET);

      return sendSuccessResponse(res, OK, 'Login successful', {data: passenger, token });
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error logging in', error.message);
    }
  }

  async getPassengerProfile(req, res) {
    try {
      const passenger = await Passenger.findById(req.userId).select('-password');
      if (!passenger) {
        return sendErrorResponse(res, NOT_FOUND, 'Passenger not found');
      }

      return sendSuccessResponse(res, OK, 'Passenger profile retrieved successfully', passenger);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error fetching passenger profile', error.message);
    }
  }

  async updatePassengerProfile(req, res) {
    const updates = req.body;

    try {
      const passenger = await Passenger.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
      if (!passenger) {
        return sendErrorResponse(res, NOT_FOUND, 'Passenger not found');
      }

      return sendSuccessResponse(res, OK, 'Profile updated successfully', passenger);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error updating profile', error.message);
    }
  }
}

export default new PassengerController();
