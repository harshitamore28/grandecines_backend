const Order = require('../models/Order');
const User = require('../models/User');
const getNextSequence = require('../utils/getNextSequence');

exports.createOrder = async (req, res) => {
  try {
    const { user, items, total, instructions, audiNumber, seatNumber, showTime } = req.body;
    if (!user || !items || !total ||!audiNumber || !seatNumber || !showTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate unique orderId
    const orderNumber = await getNextSequence('orders');
    const orderId = `ORD${orderNumber.toString().padStart(6, '0')}`;
    
    // Create new order
    const order = new Order({
      orderId,
      user,
      items,
      total,
      instructions,
      audiNumber,
      seatNumber,
      showTime,
    });

    // Save the order
    const savedOrder = await order.save();

    // Update user's orders array
    await User.findByIdAndUpdate(
      user,
      { $push: { orders: savedOrder._id } },
      { new: true }
    );

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};
exports.getAllOrders = async (req, res) => {
      try {
     const { status,reviewed } = await req.query;
        let filter = {};
        if (status === 'COMPLETED') {
          filter.status = 'COMPLETED';
          if(reviewed === 'false'){
            filter.reviewed = true;
          }
        } else if (status === 'PENDING') {
          filter.status = 'PENDING';
        }

        const orders = await Order.find(filter).populate("user", "name phone") // populate only name + phone
      .sort({ createdAt: -1 });
        res.json(orders);
        // console.log(orders)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
exports.getOrderByUser = async(req,res)=>{
    try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
}
exports.getOrderById = async(req,res)=>{ try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
}
exports.updateOrder = async(req,res)=>{
     try {
    const updates = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
}
exports.deleteOrder = async(req,res)=>{
     try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
}