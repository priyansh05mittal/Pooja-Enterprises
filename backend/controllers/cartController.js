const { Cart, Wishlist } = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images price discountedPrice stock",
  );
  res.json({ success: true, cart: cart || { items: [] } });
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  if (product.stock < quantity)
    return res
      .status(400)
      .json({ success: false, message: "Insufficient stock" });

  const price = product.discountedPrice || product.price;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity, price }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId,
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price });
    }
    await cart.save();
  }

  await cart.populate(
    "items.product",
    "name images price discountedPrice stock",
  );
  res.json({ success: true, cart });
};

exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });

  const item = cart.items.find((i) => i._id.toString() === req.params.itemId);
  if (!item)
    return res.status(404).json({ success: false, message: "Item not found" });

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i) => i._id.toString() !== req.params.itemId,
    );
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate(
    "items.product",
    "name images price discountedPrice stock",
  );
  res.json({ success: true, cart });
};

exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, cart });
};

exports.clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: "Cart cleared" });
};

exports.getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products",
    "name images price discountedPrice stock ratings",
  );
  res.json({ success: true, wishlist: wishlist || { products: [] } });
};

exports.toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
    return res.json({ success: true, added: true, wishlist });
  }

  const index = wishlist.products.findIndex((p) => p.toString() === productId);
  if (index > -1) {
    wishlist.products.splice(index, 1);
    await wishlist.save();
    return res.json({ success: true, added: false, wishlist });
  } else {
    wishlist.products.push(productId);
    await wishlist.save();
    return res.json({ success: true, added: true, wishlist });
  }
};