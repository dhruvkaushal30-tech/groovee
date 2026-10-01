import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  clearAuthCookies,
  hashToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from '../utils/jwt.js';

const REFRESH_LIMIT = 5;

async function issueSession(user, res) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);
  const full = await User.findById(user._id).select('+refreshTokens');
  const tokens = (full.refreshTokens || []).filter((item) => item.expiresAt > new Date());
  tokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  full.refreshTokens = tokens.slice(-REFRESH_LIMIT);
  await full.save();
  setAuthCookies(res, accessToken, refreshToken);
  return user;
}

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const mobile = String(phone).replace(/[\s-]/g, '');
  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone: mobile }],
  });
  if (existing?.email === email.toLowerCase()) {
    throw new AppError('Email already registered', 409);
  }
  if (existing) {
    throw new AppError('Mobile number already registered', 409);
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashed,
    phone: mobile,
    role: 'USER',
  });
  await issueSession(user, res);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }
  user.password = undefined;
  await issueSession(user, res);
  res.json({ user });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
  if (!user || user.phone.trim() !== String(phone).trim()) {
    throw new AppError('Email and phone do not match', 401);
  }
  user.password = await bcrypt.hash(password, 12);
  user.refreshTokens = [];
  await user.save();
  user.password = undefined;
  await issueSession(user, res);
  res.json({ user });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.sub).select('+refreshTokens');
      if (user) {
        const hashed = hashToken(token);
        user.refreshTokens = user.refreshTokens.filter((item) => item.tokenHash !== hashed);
        await user.save();
      }
    } catch {
      // Clear cookies even when the refresh token is already invalid.
    }
  }
  clearAuthCookies(res);
  res.json({ message: 'Logged out' });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshTokens');
  user.refreshTokens = [];
  await user.save();
  clearAuthCookies(res);
  res.json({ message: 'Logged out of all sessions' });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError('Authentication required', 401);
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    clearAuthCookies(res);
    throw new AppError('Authentication required', 401);
  }
  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user) {
    clearAuthCookies(res);
    throw new AppError('Authentication required', 401);
  }
  const hashed = hashToken(token);
  const stored = user.refreshTokens.find((item) => item.tokenHash === hashed && item.expiresAt > new Date());
  if (!stored) {
    user.refreshTokens = [];
    await user.save();
    clearAuthCookies(res);
    throw new AppError('Authentication required', 401);
  }
  user.refreshTokens = user.refreshTokens.filter((item) => item.tokenHash !== hashed);
  await user.save();
  const publicUser = await User.findById(user._id);
  await issueSession(publicUser, res);
  res.json({ user: publicUser });
});
