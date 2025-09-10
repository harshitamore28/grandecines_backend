const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  signature: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["success", "failed"], default: "success" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", PaymentSchema);