import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Driver from './model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';
import Passenger from '../passenger/model.js';

const { OK, CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = HTTP_STATUS;

class DriverController {
  async registerDriver(req, res) {
    try {
      const { email, password } = req.body;

      const existingDriver = await Driver.findOne({ email });
      if (existingDriver) {
        return sendErrorResponse(res, BAD_REQUEST, 'Driver already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const driverData = {
        ...req.body,
        password: hashedPassword
      };

      const driver = new Driver(driverData);

      const savedDriver = await driver.save();

      return sendSuccessResponse(res, CREATED, 'Driver registered successfully', savedDriver);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error registering driver', error.message);
    }
  }


  async loginDriver(req, res) {
    const { email, password } = req.body;

    try {
      let user = {}
      if (email) {
        user = await Driver.findOne({ email });

      }
      else {
        if (!user) {

          user = await Passenger.findOne({ email });
        }
      }
      // if (user) {
      //   return sendErrorResponse(res, NOT_FOUND, 'Not found');
      // }
      console.log('passenger', user);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return sendErrorResponse(res, BAD_REQUEST, 'Invalid credentials');
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return sendSuccessResponse(res, OK, 'Login successful', { data: user, token });
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error logging in', error.message);
    }
  }

  async getDriverProfile(req, res) {
    try {
      const driver = await Driver.findById(req.userId).select('-password');
      if (!driver) {
        return sendErrorResponse(res, NOT_FOUND, 'Driver not found');
      }

      return sendSuccessResponse(res, OK, 'Driver profile retrieved successfully', driver);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error fetching driver profile', error.message);
    }
  }

  async updateDriverProfile(req, res) {
    const updates = req.body;

    try {
      const driver = await Driver.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
      if (!driver) {
        return sendErrorResponse(res, NOT_FOUND, 'Driver not found');
      }

      return sendSuccessResponse(res, OK, 'Profile updated successfully', driver);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error updating profile', error.message);
    }
  }
}

export default new DriverController();
