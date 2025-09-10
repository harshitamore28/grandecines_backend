const axios = require('axios');
const User = require('../models/User');
const getNextSequence = require('../utils/getNextSequence');
const ApiError = require('../utils/apiError');
const { sendResponse } = require('../utils/responseHelper');
const API_KEY = process.env.TWOFACTOR_API_KEY; // keep secret in env

/**
 * Send OTP
 */
exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new ApiError('Phone number is required', 400);
    if (!API_KEY) {
  throw new ApiError("TWO_FACTOR_API_KEY is missing in .env",400);
}

    const response = await axios.get(`https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN`);
    const { Status, Details } = response.data;

    if (Status !== 'Success') {
      throw new ApiError('Failed to send OTP', 400, response.data);
    }

    return sendResponse(res, {
      success: true,
      message: 'OTP sent successfully',
      sessionId: Details,
      data: response.data
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, sessionId, otp } = req.body;
    if (!phone || !sessionId || !otp) {
      throw new ApiError('Phone, sessionId, and OTP are required', 400);
    }

    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    const { Status, Details } = response.data;

    if (Status === 'Error') {
      if (Details === 'OTP Mismatch') {
        throw new ApiError('OTP is incorrect', 400, response.data);
      }
      if (Details.includes('expired') || Details.includes('not found')) {
        throw new ApiError('OTP session expired or invalid', 400, response.data);
      }
      throw new ApiError('OTP verification failed', 400, response.data);
    }

    // ✅ Success → check/create user
    let user = await User.findOne({ phone });
    if (!user) {
      const userId = await getNextSequence("userId");
      user = new User({ userId, phone, role: "user" });
      await user.save();
    }

    return sendResponse(res, {
      success: true,
      message: 'OTP verified successfully',
      data: response.data,
      userId: user.userId
    });

  } catch (error) {
    next(error);
  }
};
