// const Category = require('../models/Category');
// const { cloudinary } = require('../config/cloudinary');

// exports.getCategories = async (req, res) => {
//   const categories = await Category.find({ isActive: true }).populate('children');
//   const roots = categories.filter((c) => !c.parent);
//   res.json({ success: true, categories: roots });
// };

// exports.getAllCategories = async (req, res) => {
//   const categories = await Category.find().sort({ order: 1, createdAt: -1 });
//   res.json({ success: true, categories });
// };

// exports.createCategory = async (req, res) => {
//   const { name, description, parent, order } = req.body;
//   let level = 0;
//   if (parent) {
//     const parentCat = await Category.findById(parent);
//     if (parentCat) level = parentCat.level + 1;
//   }
//   const category = await Category.create({ name, description, parent: parent || null, level, order });
//   res.status(201).json({ success: true, category });
// };

// exports.updateCategory = async (req, res) => {
//   const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
//   res.json({ success: true, category });
// };

// exports.deleteCategory = async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
//   if (category.image?.publicId) await cloudinary.uploader.destroy(category.image.publicId);
//   await category.deleteOne();
//   res.json({ success: true, message: 'Category deleted' });
// };


const Category = require("../models/Category");
const { cloudinary } = require("../config/cloudinary");
const mongoose = require("mongoose");

// ===============================
// @desc    Get active categories
// @route   GET /api/categories
// @access  Public
// ===============================
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("children")
      .sort({ order: 1, createdAt: -1 });

    const roots = categories.filter((c) => !c.parent);

    res.status(200).json({
      success: true,
      count: roots.length,
      categories: roots,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// @desc    Get all categories
// @route   GET /api/categories/admin
// @access  Admin
// ===============================
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate("parent", "name slug")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// @desc    Create category
// @route   POST /api/categories
// @access  Admin
// ===============================
exports.createCategory = async (req, res, next) => {
  try {
    let { name, description, parent, order } = req.body;

    // ===============================
    // Validation
    // ===============================
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    name = name.trim();

    // ===============================
    // Check duplicate category
    // ===============================
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // ===============================
    // Handle parent category
    // ===============================
    let level = 0;
    let parentValue = null;

    if (parent && parent !== "") {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category ID",
        });
      }

      const parentCategory = await Category.findById(parent);

      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      parentValue = parentCategory._id;
      level = parentCategory.level + 1;

      // Optional: Limit nesting
      if (level > 2) {
        return res.status(400).json({
          success: false,
          message: "Maximum category nesting level exceeded",
        });
      }
    }

    // ===============================
    // Create category
    // ===============================
    const category = await Category.create({
      name,
      description: description?.trim() || "",
      parent: parentValue,
      level,
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
// ===============================
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    let { name, description, parent, order, isActive } = req.body;

    // ===============================
    // Validate category ID
    // ===============================
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // ===============================
    // Find existing category
    // ===============================
    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ===============================
    // Duplicate name check
    // ===============================
    if (name && name.trim()) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another category with this name already exists",
        });
      }
    }

    // ===============================
    // Handle parent
    // ===============================
    let level = 0;
    let parentValue = null;

    if (parent && parent !== "") {
      // Prevent self-parenting
      if (parent === id) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be its own parent",
        });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category ID",
        });
      }

      const parentCategory = await Category.findById(parent);

      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      parentValue = parentCategory._id;
      level = parentCategory.level + 1;

      // Optional nesting limit
      if (level > 2) {
        return res.status(400).json({
          success: false,
          message: "Maximum category nesting level exceeded",
        });
      }
    }

    // ===============================
    // Update category
    // ===============================
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name?.trim() || existingCategory.name,
        description:
          description !== undefined
            ? description.trim()
            : existingCategory.description,

        parent: parentValue,
        level,

        order:
          order !== undefined
            ? Number(order)
            : existingCategory.order,

        isActive:
          isActive !== undefined
            ? isActive
            : existingCategory.isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
// ===============================
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ===============================
    // Validate ID
    // ===============================
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // ===============================
    // Find category
    // ===============================
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ===============================
    // Check child categories
    // ===============================
    const childCategories = await Category.find({
      parent: category._id,
    });

    if (childCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with existing subcategories",
      });
    }

    // ===============================
    // Delete Cloudinary image
    // ===============================
    if (category.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(
          category.image.publicId
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary delete error:",
          cloudinaryError.message
        );
      }
    }

    // ===============================
    // Delete category
    // ===============================
    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};