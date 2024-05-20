import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Driver from './model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';

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
      const driver = await Driver.findOne({ email });
      if (!driver) {
        return sendErrorResponse(res, NOT_FOUND, 'Driver not found');
      }

      const isMatch = await bcrypt.compare(password, driver.password);
      if (!isMatch) {
        return sendErrorResponse(res, BAD_REQUEST, 'Invalid credentials');
      }

      const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET);

      return sendSuccessResponse(res, OK, 'Login successful', { token });
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error logging in', error.message);
    }
  }

  async getDriverProfile(req, res) {
    try {
      const driver = await Driver.findById(req.user.id).select('-password');
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
      const driver = await Driver.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
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
