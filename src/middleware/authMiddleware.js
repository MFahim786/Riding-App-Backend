import jwt from 'jsonwebtoken';
import { HTTP_STATUS, sendErrorResponse } from '../utils/responseUtils.js';

const { UNAUTHORIZED, INTERNAL_SERVER_ERROR } = HTTP_STATUS;

const authPassenger = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendErrorResponse(res, UNAUTHORIZED, 'No token, authorization denied');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
 
    next();
  } catch (error) {
    return sendErrorResponse(res, UNAUTHORIZED, 'Token is not valid', error.message);
  }
};

export  {authPassenger};
