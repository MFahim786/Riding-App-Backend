export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  };

export function sendSuccessResponse(res, statusCode, message, data = null) {
    return res.status(statusCode).json({ success: true, message, data });
  }
  
  export function sendErrorResponse(res, statusCode, message, error = null) {
    return res.status(statusCode).json({ success: false, message, error });
  }
  