function sendResponse(res, {
  success = false,
  message = '',
  data = null,
  sessionId = null,
  userId = null,
  statusCode = 200
}) {
  const response = { success, message };
  if (data) response.data = data;
  if (sessionId) response.sessionId = sessionId;
  if (userId) response.userId = userId;
  return res.status(statusCode).json(response);
}

module.exports = { sendResponse };
