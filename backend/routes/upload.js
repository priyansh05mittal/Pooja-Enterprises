const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

router.post('/', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    const uploaded = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    res.json({ success: true, images: uploaded });
  } catch {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

router.delete('/', protect, admin, async (req, res) => {
  try {
    const { publicId } = req.body;
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

module.exports = router;
