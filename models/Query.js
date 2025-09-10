const mongoose = require("mongoose");
const { Schema } = mongoose;

const querySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // reference to User
  type: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Query", querySchema);
