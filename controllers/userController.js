const User = require('../models/User');

exports.checkUser = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { phone, role , name} = req.body;
    const user = new User({ phone, role, name });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserByPhone = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
      try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
// UPDATE
exports.updateUser = async (req, res) => {
  // console.log(req.body)
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ADD FCM TOKEN (supports multiple devices per user)
exports.addFcmToken = async (req, res) => {
  try {
    const { fcmToken, deviceName, platform } = req.body;
    // Validate that fcmToken is a non-empty string
    if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim() === '') {
      return res.status(400).json({ error: 'Valid FCM token is required' });
    }

    // First, remove any existing entry with the same token (to update device info)
    await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { fcmTokens: { token: fcmToken } } }
    );

    // Then add the token with device info
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          fcmTokens: {
            token: fcmToken,
            deviceName: deviceName || 'Unknown Device',
            platform: platform || 'Unknown'
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// REMOVE FCM TOKEN (on logout)
exports.removeFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { fcmTokens: { token: fcmToken } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'Token removed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
