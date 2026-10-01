import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) {
    const mobile = String(phone).replace(/[\s-]/g, '');
    const taken = await User.findOne({ phone: mobile, _id: { $ne: user._id } });
    if (taken) throw new AppError('Mobile number already registered', 409);
    user.phone = mobile;
  }
  await user.save();
  res.json({ user });
});
