const admin = require('../config/firebase');
const User = require('../models/User');

exports.sendNotifications = async (req, res) => {
    console.log("inside send notifications")
  try {
    const { title, message, data, recipients} = req.body;
    // Build base query for users with valid FCM tokens
    const baseQuery = { fcmTokens: { $exists: true, $not: { $size: 0 } } };

    // Add filter if type = "admin"
    if (recipients === "ADMIN_SUPERADMIN") {
      baseQuery.role = { $in: ["admin", "superadmin"] };
    }
    // Get all valid FCM tokens
    const users = await User.find(baseQuery);

    // Flatten tokens from all users, keeping track of user info for each token
    // Filter out any empty/invalid tokens
    const tokenUserMap = [];
    users.forEach(user => {
      user.fcmTokens.forEach(tokenObj => {
        // Only include tokens that are valid (non-empty strings)
        if (tokenObj.token && typeof tokenObj.token === 'string' && tokenObj.token.trim() !== '') {
          tokenUserMap.push({
            token: tokenObj.token,
            userId: user._id,
            userName: user.name || 'Unknown',
            phone: user.phone,
            deviceName: tokenObj.deviceName || 'Unknown Device',
            platform: tokenObj.platform || 'Unknown'
          });
        }
      });
    });

    if (tokenUserMap.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users to send notifications to',
        recipients: 0
      });
    }

    console.log("\n========== SENDING NOTIFICATIONS ==========");
    console.log(`Total devices: ${tokenUserMap.length}`);
    console.log("Recipients:");
    tokenUserMap.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.userName} (${item.phone}) - ${item.deviceName} [${item.platform}]`);
    });
    
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
      tokenUserMap.map((userInfo) =>
        messaging.send({
          ...messagePayload,
          token: userInfo.token
        }).then(response => ({ ...userInfo, response, success: true }))
          .catch(error => ({ ...userInfo, error, success: false }))
      )
    );

    // Process results and clean up invalid tokens
    const successResults = [];
    const failedResults = [];
    const invalidTokens = [];

    console.log("\n---------- RESULTS ----------");

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { success, token, userName, phone, deviceName, platform, response, error } = result.value;
        if (success) {
          successResults.push({ userName, phone, deviceName, platform, messageId: response });
          console.log(`✅ SUCCESS: ${userName} (${phone}) - ${deviceName} [${platform}]`);
        } else {
          failedResults.push({ userName, phone, deviceName, platform, error: error.message });
          console.log(`❌ FAILED: ${userName} (${phone}) - ${deviceName} [${platform}] - Error: ${error.message}`);
          // Check if token is invalid/not registered
          if (error.code === 'messaging/registration-token-not-registered' ||
              error.code === 'messaging/invalid-registration-token') {
            invalidTokens.push(token);
          }
        }
      }
    });

    // Remove invalid tokens from database
    if (invalidTokens.length > 0) {
      await User.updateMany(
        { 'fcmTokens.token': { $in: invalidTokens } },
        { $pull: { fcmTokens: { token: { $in: invalidTokens } } } }
      );
      console.log(`\n🗑️  Removed ${invalidTokens.length} invalid FCM tokens from database`);
    }

    // Also clean up any empty/null tokens that might exist in the database
    await User.updateMany(
      {},
      { $pull: { fcmTokens: { token: { $in: [null, '', undefined] } } } }
    );

    console.log("\n---------- SUMMARY ----------");
    console.log(`✅ Successful: ${successResults.length}`);
    console.log(`❌ Failed: ${failedResults.length}`);
    console.log("========================================\n");

    res.status(200).json({
      success: true,
      message: 'Notifications processed',
      recipients: successResults.length,
      totalDevices: tokenUserMap.length,
      failed: failedResults.length,
      invalidTokensRemoved: invalidTokens.length,
      successDetails: successResults,
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