import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calcTotals, sellingPrice } from '../utils/pricing.js';

const CANCELLABLE = ['Pending', 'Confirmed'];

function publicOrder(order) {
  return order;
}

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw new AppError('Your cart is empty', 400);

  const address = req.body.address || {};
  const required = ['firstName', 'lastName', 'phone', 'email', 'address', 'city', 'state', 'pincode', 'country'];
  for (const field of required) {
    if (!String(address[field] || '').trim()) {
      throw new AppError(`Address ${field} is required`, 400);
    }
  }

  const lines = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) throw new AppError(`${item.name} is no longer available`, 400);
    const variant = product.variants.find((entry) => entry.sku === item.sku);
    if (!variant || variant.stock < item.quantity) {
      throw new AppError(`${product.name} (${item.size}) does not have enough stock`, 400);
    }
    lines.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      size: variant.size,
      color: variant.color,
      price: sellingPrice(product),
      quantity: item.quantity,
      sku: variant.sku,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  let coupon = null;
  if (cart.couponCode) {
    coupon = await Coupon.findOne({ code: cart.couponCode, isActive: true });
    if (!coupon || coupon.expiry <= new Date() || coupon.usedCount >= coupon.usageLimit || subtotal < coupon.minOrder) {
      coupon = null;
    }
  }
  const totals = calcTotals(subtotal, coupon ? coupon.discountPercent : 0);

  const reserved = [];
  try {
    for (const line of lines) {
      const updated = await Product.findOneAndUpdate(
        { _id: line.product, variants: { $elemMatch: { sku: line.sku, stock: { $gte: line.quantity } } } },
        { $inc: { 'variants.$.stock': -line.quantity, soldCount: line.quantity } },
        { new: true }
      );
      if (!updated) throw new AppError(`${line.name} just sold out`, 409);
      reserved.push(line);
    }
  } catch (err) {
    for (const line of reserved) {
      await Product.updateOne(
        { _id: line.product, 'variants.sku': line.sku },
        { $inc: { 'variants.$.stock': line.quantity, soldCount: -line.quantity } }
      );
    }
    throw err;
  }

  if (coupon) {
    const claimed = await Coupon.findOneAndUpdate(
      { _id: coupon._id, usedCount: { $lt: coupon.usageLimit } },
      { $inc: { usedCount: 1 } }
    );
    if (!claimed) coupon = null;
  }

  const finalTotals = coupon ? totals : calcTotals(subtotal, 0);
  const order = await Order.create({
    orderNumber: `VLD-${Date.now().toString().slice(-8)}`,
    user: req.user._id,
    items: lines,
    address: {
      firstName: address.firstName.trim(),
      lastName: address.lastName.trim(),
      phone: address.phone.trim(),
      email: address.email.trim(),
      address: address.address.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      country: address.country.trim(),
    },
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    couponCode: coupon ? coupon.code : '',
    ...finalTotals,
  });

  cart.items = [];
  cart.couponCode = '';
  await cart.save();

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      addresses: {
        $each: [order.address],
        $position: 0,
        $slice: 5,
      },
    },
  });

  res.status(201).json({ order });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ order: publicOrder(order) });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  if (!CANCELLABLE.includes(order.orderStatus)) {
    throw new AppError('This order can no longer be cancelled', 400);
  }
  for (const line of order.items) {
    await Product.updateOne(
      { _id: line.product, 'variants.sku': line.sku },
      { $inc: { 'variants.$.stock': line.quantity, soldCount: -line.quantity } }
    );
  }
  if (order.couponCode) {
    await Coupon.updateOne({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
  }
  order.orderStatus = 'Cancelled';
  await order.save();
  res.json({ order });
});
