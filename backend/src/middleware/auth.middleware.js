import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new AppError('Authentication required', 401);
    }
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError('Authentication required', 401);
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return next(new AppError('Authentication required', 401));
    }
    next(err);
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}
