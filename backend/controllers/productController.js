const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

exports.getProducts = async (req, res) => {
  const { keyword, category, minPrice, maxPrice, rating, sort, page = 1, limit = 12, featured } = req.query;

  const query = { isActive: true };

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query.ratings = { $gte: Number(rating) };

  let sortQuery = { createdAt: -1 };
  if (sort === 'price_asc') sortQuery = { price: 1 };
  else if (sort === 'price_desc') sortQuery = { price: -1 };
  else if (sort === 'rating') sortQuery = { ratings: -1 };
  else if (sort === 'newest') sortQuery = { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query).populate('category', 'name slug').sort(sortQuery).skip(skip).limit(Number(limit));

  res.json({ success: true, products, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
};

exports.getProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  for (const img of product.images) {
    if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
};

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Already reviewed' });

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.calcAverageRating();
  await product.save();

  res.json({ success: true, message: 'Review added' });
};

exports.getAdminProducts = async (req, res) => {
  const { page = 1, limit = 20, keyword } = req.query;
  const query = {};
  if (keyword) query.$text = { $search: keyword };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query).populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

  res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
};
