import { AppError } from '../utils/AppError.js';

export function checkRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}
