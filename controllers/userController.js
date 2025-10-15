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
