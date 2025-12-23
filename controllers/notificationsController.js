const admin = require('../config/firebase');
const User = require('../models/User');

exports.sendNotifications = async (req, res) => {
    console.log("inside send notifications")
  try {
    const { title, message, data, recipients} = req.body;
    // Build base query for users with valid FCM tokens
    const baseQuery = { fcmToken: { $exists: true, $ne: null } };

    // Add filter if type = "admin"
    if (recipients === "ADMIN_SUPERADMIN") {
      baseQuery.role = { $in: ["admin", "superadmin"] };
    }
    // Get all valid FCM tokens
    const users = await User.find(baseQuery);
    const tokens = users.map(user => user.fcmToken);

    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users to send notifications to',
        recipients: 0
      });
    }
    
    console.log("Tokens to send to:", tokens);
    
    // Updated message payload for all states
    const messagePayload = {
      notification: {
        title: title || 'Hello!',
        body: message || 'This is a test notification'
      },
      apns: {
        headers: {
          "apns-push-type": "alert",
          "apns-priority": "10",
          "apns-expiration": "1"
        },
        payload: {
          aps: {
            alert: {
              title: title || 'Hello!',
              body: message || 'This is a test notification'
            },
            sound: 'default',
            badge: 1,
            'content-available': 1,
            'mutable-content': 1,
            'category': 'NEW_MESSAGE'
          }
        }
      },
      data: {
        ...data,
        notificationType: data?.type || 'GENERAL',
        click_action: 'OPEN_NOTIFICATION',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Preparing messages for multiple devices');
    const messaging = admin.messaging();

    // Send to multiple devices with individual error handling
    const results = await Promise.allSettled(
      tokens.map((token, index) =>
        messaging.send({
          ...messagePayload,
          token: token
        }).then(response => ({ token, userId: users[index]._id, response, success: true }))
          .catch(error => ({ token, userId: users[index]._id, error, success: false }))
      )
    );

    // Process results and clean up invalid tokens
    const successResults = [];
    const failedResults = [];
    const invalidTokenUserIds = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { success, token, userId, response, error } = result.value;
        if (success) {
          successResults.push(response);
        } else {
          failedResults.push({ token, error: error.message });
          // Check if token is invalid/not registered
          if (error.code === 'messaging/registration-token-not-registered' ||
              error.code === 'messaging/invalid-registration-token') {
            invalidTokenUserIds.push(userId);
          }
        }
      }
    });

    // Remove invalid tokens from database
    if (invalidTokenUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: invalidTokenUserIds } },
        { $unset: { fcmToken: "" } }
      );
      console.log(`Removed ${invalidTokenUserIds.length} invalid FCM tokens`);
    }

    console.log('Firebase responses:', {
      success: successResults.length,
      failed: failedResults.length
    });

    res.status(200).json({
      success: true,
      message: 'Notifications processed',
      recipients: successResults.length,
      totalDevices: tokens.length,
      failed: failedResults.length,
      invalidTokensRemoved: invalidTokenUserIds.length,
      messageIds: successResults,
      failures: failedResults.length > 0 ? failedResults : undefined
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