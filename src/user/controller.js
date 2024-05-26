import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './model.js';
import Wallet from '../wallet/model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';

const { OK, CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = HTTP_STATUS;

class UserController {
  async registerUser(req, res) {
    try {
      const { email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendErrorResponse(res, BAD_REQUEST, `${role} already exists`);
      }

      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.HASH_SALT_ROUNDS, 10));

      const userData = {
        ...req.body,
        password: hashedPassword
      };

      const user = new User(userData);

      const savedUser = await user.save();

      const wallet = new Wallet({
        owner: savedUser._id,
        ownerModel: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize role
        balance: 0,
        transactions: []
      });

      const savedWallet = await wallet.save();
      savedUser.wallet = savedWallet._id;
      await savedUser.save();

      return sendSuccessResponse(res, CREATED, `${role} registered successfully`, savedUser);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, `Error registering ${role}`, error.message);
    }
  }

  async loginUser(req, res) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return sendErrorResponse(res, NOT_FOUND, 'User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return sendErrorResponse(res, BAD_REQUEST, 'Invalid credentials');
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return sendSuccessResponse(res, OK, 'Login successful', { data: user, token });
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error logging in', error.message);
    }
  }

  async getUserProfile(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return sendErrorResponse(res, NOT_FOUND, 'User not found');
      }

      return sendSuccessResponse(res, OK, 'User profile retrieved successfully', user);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error fetching user profile', error.message);
    }
  }

  async updateUserProfile(req, res) {
    const updates = req.body;

    try {
      const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
      if (!user) {
        return sendErrorResponse(res, NOT_FOUND, 'User not found');
      }

      return sendSuccessResponse(res, OK, 'Profile updated successfully', user);
    } catch (error) {
      return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error updating profile', error.message);
    }
  }
}

export default new UserController();
