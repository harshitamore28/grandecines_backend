const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Migrate old fcmToken string to new fcmTokens array with object structure
    const result = await mongoose.connection.db.collection('users').updateMany(
      { fcmToken: { $exists: true, $ne: null } },
      [{
        $set: {
          fcmTokens: [{
            token: "$fcmToken",
            deviceName: "Unknown Device (Migrated)",
            platform: "Unknown"
          }]
        }
      }, { $unset: "fcmToken" }]
    );

    console.log(`Migration complete: ${result.modifiedCount} users migrated`);

    // Also clean up any users that had null/empty fcmToken
    const cleanup = await mongoose.connection.db.collection('users').updateMany(
      { fcmToken: { $exists: true } },
      { $unset: { fcmToken: "" } }
    );

    console.log(`Cleanup complete: ${cleanup.modifiedCount} users cleaned up`);

    // Remove platform field from all users
    const platformCleanup = await mongoose.connection.db.collection('users').updateMany(
      { platform: { $exists: true } },
      { $unset: { platform: "" } }
    );

    console.log(`Platform field removed from ${platformCleanup.modifiedCount} users`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
