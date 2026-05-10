const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary');

exports.getActiveBanners = async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    $or: [{ startDate: null }, { startDate: { $lte: now } }],
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  }).sort({ order: 1 });
  res.json({ success: true, banners });
};

exports.getAllBanners = async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json({ success: true, banners });
};

exports.createBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
};

exports.updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.json({ success: true, banner });
};

exports.deleteBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  if (banner.image?.publicId) await cloudinary.uploader.destroy(banner.image.publicId);
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted' });
};

exports.trackClick = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    { $inc: { clicks: 1 }, $push: { clickLog: { ip: req.ip } } },
    { new: true }
  );
  res.json({ success: true, banner });
};
