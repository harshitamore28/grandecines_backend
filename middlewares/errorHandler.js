const { sendResponse } = require('../utils/responseHelper');

function errorHandler(err, req, res, next) {
  console.error('🔥 Global Error:', err.stack || err);

  if (err.statusCode) {
    return sendResponse(res, {
      success: false,
      message: err.message || 'Something went wrong',
      statusCode: err.statusCode,
      data: err.data || null
    });
  }

  return sendResponse(res, {
    success: false,
    message: 'Internal Server Error',
    statusCode: 500
  });
}

module.exports = errorHandler;
