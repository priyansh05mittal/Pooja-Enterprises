const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Banner = require('../models/Banner');

exports.getDashboardStats = async (req, res) => {
  const [totalOrders, totalUsers, totalProducts, revenueResult] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = await Order.find({ createdAt: { $gte: last30Days } }).countDocuments();

  const salesByDay = await Order.aggregate([
    { $match: { createdAt: { $gte: last30Days }, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  const categoryDistribution = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { name: '$category.name', count: 1 } },
  ]);

  const stockAnalysis = await Product.aggregate([
    {
      $group: {
        _id: null,
        outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
        lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] } },
        inStock: { $sum: { $cond: [{ $gt: ['$stock', 10] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
      },
    },
  ]);

  const bannerAnalytics = await Banner.find({}, 'title clicks').sort({ clicks: -1 }).limit(5);
  const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  res.json({
    success: true,
    stats: { totalOrders, totalUsers, totalProducts, totalRevenue, recentOrders },
    salesByDay,
    topProducts,
    categoryDistribution,
    stockAnalysis: stockAnalysis[0] || {},
    bannerAnalytics,
    ordersByStatus,
  });
};
