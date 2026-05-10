const Order = require('../models/Order');
const Product = require('../models/Product');
const { Cart } = require('../models/Cart');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
    if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

    const price = product.discountedPrice || product.price;
    itemsPrice += price * item.quantity;
    orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url || '', price, quantity: item.quantity });
  }

  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: paymentMethod === 'COD' ? false : false,
    timeline: [{ status: 'Placed', description: 'Order has been placed successfully' }],
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
  }

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  if (global.io) {
    global.io.to(req.user._id.toString()).emit('orderPlaced', { orderId: order._id });
  }

  if (paymentMethod === 'Razorpay') {
    const razorpayOrder = await razorpay.orders.create({ amount: totalPrice * 100, currency: 'INR', receipt: order._id.toString() });
    return res.status(201).json({ success: true, order, razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
  }

  res.status(201).json({ success: true, order });
};

exports.verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');

  if (generated !== razorpaySignature) return res.status(400).json({ success: false, message: 'Payment verification failed' });

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      isPaid: true,
      paidAt: Date.now(),
      paymentInfo: { razorpayOrderId, razorpayPaymentId, razorpaySignature },
      $push: { timeline: { status: 'Confirmed', description: 'Payment confirmed' } },
    },
    { new: true }
  );

  res.json({ success: true, order });
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product', 'name images');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
};

exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const descriptions = {
    Confirmed: 'Order confirmed by seller',
    Processing: 'Order is being processed',
    Shipped: 'Order has been shipped',
    Delivered: 'Order delivered successfully',
    Cancelled: 'Order has been cancelled',
  };

  order.status = status;
  if (status === 'Delivered') order.deliveredAt = Date.now();
  order.timeline.push({ status, description: descriptions[status] || status });
  await order.save();

  if (global.io) {
    global.io.to(order.user.toString()).emit('orderStatusUpdate', { orderId: order._id, status });
  }

  res.json({ success: true, order });
};
