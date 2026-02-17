const express = require("express");
const Razorpay = require("razorpay");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ test route
router.get("/test", (req, res) => {
  res.send("Payment route working");
});

// ✅ create order
router.post("/create-order", async (req, res) => {
  try {
    console.log("BODY:", req.body);  // ⭐ see what frontend sends

    const amount = req.body.amount || 100; // default ₹100

    const order = await razorpay.orders.create({
      amount: amount * 100,   // paisa
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    });

    res.json(order);

  } catch (err) {
    console.log("RAZORPAY ERROR:", err); // ⭐ show real error
    res.status(500).send("Error creating order");
  }
});

module.exports = router;
