const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true }, // ✅ auto-increment
  name: { type: String },
  email: { type: String },
  phone: { type: String, required: true ,
    unique: true},
  role: { type: String, enum: ["user", "admin","superadmin"], default: "user" },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  queries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
    },
  ],
  fcmToken: { type: String },
  platform: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
