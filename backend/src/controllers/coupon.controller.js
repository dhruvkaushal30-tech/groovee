import { Coupon } from '../models/Coupon.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercent, minOrder, expiry, usageLimit } = req.body;
  const coupon = await Coupon.create({
    code: String(code || '').trim().toUpperCase(),
    discountPercent: Number(discountPercent),
    minOrder: Number(minOrder),
    expiry: new Date(expiry),
    usageLimit: Number(usageLimit),
    isActive: true,
  });
  res.status(201).json({ coupon });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  const fields = ['discountPercent', 'minOrder', 'usageLimit', 'isActive'];
  for (const field of fields) {
    if (req.body[field] !== undefined) coupon[field] = req.body[field];
  }
  if (req.body.code) coupon.code = String(req.body.code).trim().toUpperCase();
  if (req.body.expiry) coupon.expiry = new Date(req.body.expiry);
  await coupon.save();
  res.json({ coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json({ message: 'Coupon deleted' });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const subtotal = Number(req.body.subtotal) || 0;
  const coupon = await Coupon.findOne({ code, isActive: true });
  if (!coupon) throw new AppError('Invalid coupon', 400);
  if (coupon.expiry <= new Date()) throw new AppError('Coupon expired', 400);
  if (coupon.usedCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached', 400);
  if (subtotal < coupon.minOrder) {
    throw new AppError(`Minimum order for this coupon is ₹${coupon.minOrder}`, 400);
  }
  res.json({
    coupon: {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      minOrder: coupon.minOrder,
    },
  });
});
