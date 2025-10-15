const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const crypto = require("crypto");

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// ✅ Create an order
router.post("/create-order", async (req, res) => {
  // console.log(req);
  console.log(req.body);
  try {
    const options = {
      amount: req.body.amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    console.log(order);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating order");
  }
});

// ✅ Verify Payment Signature
router.post("/verify-payment", (req, res) => {
  console.log("inside verify payment");
  console.log(req.body);
  try {
    const { order_id, payment_id, signature } = req.body;
    const hmac = crypto.createHmac("sha256", "YOUR_KEY_SECRET");
    hmac.update(order_id + "|" + payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
      console.log("Payment verified successfully");
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      console.log("Payment verification failed");
      res.json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Verification error");
  }
});

module.exports = router;
