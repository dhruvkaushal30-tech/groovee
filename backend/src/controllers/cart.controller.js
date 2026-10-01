import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calcTotals, sellingPrice } from '../utils/pricing.js';

function matchVariant(product, size, color) {
  return product.variants.find(
    (variant) =>
      variant.size.toLowerCase() === String(size).toLowerCase() &&
      variant.color.toLowerCase() === String(color).toLowerCase()
  );
}

async function loadLine(productId, size, color, quantity) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }
  const variant = matchVariant(product, size, color);
  if (!variant) throw new AppError('Selected size or color is unavailable', 400);
  const qty = Number(quantity) || 1;
  if (qty < 1) throw new AppError('Quantity must be at least 1', 400);
  if (variant.stock < qty) throw new AppError(`Only ${variant.stock} left for this size`, 400);
  return {
    product: product._id,
    name: product.name,
    image: product.images[0] || '',
    size: variant.size,
    color: variant.color,
    price: sellingPrice(product),
    quantity: qty,
    sku: variant.sku,
    stock: variant.stock,
  };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

async function presentCart(cart) {
  let coupon = null;
  const items = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    const variant = product ? matchVariant(product, item.size, item.color) : null;
    items.push({
      _id: item._id,
      product: item.product,
      name: product?.name || item.name,
      image: product?.images?.[0] || item.image,
      size: item.size,
      color: item.color,
      price: product ? sellingPrice(product) : item.price,
      quantity: item.quantity,
      sku: item.sku,
      stock: variant?.stock ?? 0,
      available: Boolean(product?.isActive && variant),
    });
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountPercent = 0;
  if (cart.couponCode) {
    coupon = await Coupon.findOne({ code: cart.couponCode });
    const valid =
      coupon &&
      coupon.isActive &&
      coupon.expiry > new Date() &&
      coupon.usedCount < coupon.usageLimit &&
      subtotal >= coupon.minOrder;
    if (valid) discountPercent = coupon.discountPercent;
    else coupon = null;
  }
  return {
    items,
    couponCode: coupon ? coupon.code : '',
    discountPercent: coupon ? coupon.discountPercent : 0,
    ...calcTotals(subtotal, discountPercent),
  };
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ cart: await presentCart(cart) });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, size, color, quantity } = req.body;
  const line = await loadLine(productId, size, color, quantity || 1);
  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((item) => item.sku === line.sku);
  const nextQty = (existing?.quantity || 0) + line.quantity;
  if (nextQty > line.stock) throw new AppError(`Only ${line.stock} left for this size`, 400);
  if (existing) existing.quantity = nextQty;
  else {
    const { stock, ...stored } = line;
    cart.items.push(stored);
  }
  await cart.save();
  res.status(201).json({ cart: await presentCart(cart) });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('Cart item not found', 404);
  const line = await loadLine(item.product, item.size, item.color, req.body.quantity);
  item.quantity = line.quantity;
  item.price = line.price;
  await cart.save();
  res.json({ cart: await presentCart(cart) });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('Cart item not found', 404);
  item.deleteOne();
  await cart.save();
  res.json({ cart: await presentCart(cart) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.couponCode = '';
  await cart.save();
  res.json({ cart: await presentCart(cart) });
});

export const mergeCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const incoming = Array.isArray(req.body.items) ? req.body.items : [];
  for (const raw of incoming) {
    try {
      const line = await loadLine(raw.productId || raw.product, raw.size, raw.color, raw.quantity || 1);
      const existing = cart.items.find((item) => item.sku === line.sku);
      const nextQty = Math.min(line.stock, (existing?.quantity || 0) + line.quantity);
      if (nextQty < 1) continue;
      if (existing) existing.quantity = nextQty;
      else {
        const { stock, ...stored } = line;
        stored.quantity = nextQty;
        cart.items.push(stored);
      }
    } catch {
      // Skip guest lines that are no longer available.
    }
  }
  await cart.save();
  res.json({ cart: await presentCart(cart) });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) {
    cart.couponCode = '';
    await cart.save();
    return res.json({ cart: await presentCart(cart) });
  }
  const presented = await presentCart({ ...cart.toObject(), couponCode: '' });
  const coupon = await Coupon.findOne({ code });
  if (!coupon || !coupon.isActive) throw new AppError('Invalid coupon', 400);
  if (coupon.expiry <= new Date()) throw new AppError('Coupon expired', 400);
  if (coupon.usedCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached', 400);
  if (presented.subtotal < coupon.minOrder) {
    throw new AppError(`Minimum order for this coupon is ₹${coupon.minOrder}`, 400);
  }
  cart.couponCode = coupon.code;
  await cart.save();
  res.json({ cart: await presentCart(cart) });
});
