// controllers/foodController.js
const Food = require('../models/Food');

// READ ALL
exports.getAllFood = async (req, res) => {
  try {
  const foods = await Food.find();
  res.json(foods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(food);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
