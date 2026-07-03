const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: { url: String, publicId: String },
    redirectType: {
      type: String,
      enum: ["product", "category", "url"],
      default: "url",
    },
    redirectValue: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    clickLog: [{ clickedAt: { type: Date, default: Date.now }, ip: String }],
  },
  { timestamps: true },
);

bannerSchema.virtual("isLive").get(function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

module.exports = mongoose.model("Banner", bannerSchema);