import jwt from 'jsonwebtoken';
import User from '../user/model.js';
import { sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';

const { UNAUTHORIZED } = HTTP_STATUS;

const authUser = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return sendErrorResponse(res, UNAUTHORIZED, 'No token, authorization denied');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return sendErrorResponse(res, UNAUTHORIZED, 'Token is not valid', error.message);
  }
};

export default { authUser };
