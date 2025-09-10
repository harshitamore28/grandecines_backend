const admin = require('../config/firebase.js');
const User = require('../models/User');

exports.sendNotifications = async (req, res) => {
    console.log("inside send notifications")
  try {
    const { title, message, data } = req.body;

    // Get all valid FCM tokens
    const users = await User.find({ 
      fcmToken: { $exists: true, $ne: null } 
    });
    console.log(users);
    const tokens = users.map(user => user.fcmToken);

    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users to send notifications to',
        recipients: 0
      });
    }

    const messagePayload = {
      notification: {
        title,
        body: message,
      },
      data: data || {},
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(messagePayload);

    console.log('Notification Response:', {
      success: response.successCount,
      failure: response.failureCount,
    });

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          invalidTokens.push(tokens[idx]);
        }
      });
      
      if (invalidTokens.length > 0) {
        await User.updateMany(
          { fcmToken: { $in: invalidTokens } },
          { $unset: { fcmToken: "" } }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Notifications sent successfully',
      recipients: response.successCount
    });

  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
};