import { Router } from 'express';
import { body } from 'express-validator';
import { createCoupon, deleteCoupon, listCoupons, updateCoupon, validateCoupon } from '../controllers/coupon.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();
const admin = [authenticateUser, checkRole('ADMIN')];

router.post('/validate', validateCoupon);
router.get('/', ...admin, listCoupons);
router.post(
  '/',
  ...admin,
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('discountPercent').isFloat({ min: 1, max: 90 }).withMessage('Discount must be between 1 and 90'),
    body('minOrder').isFloat({ min: 0 }).withMessage('Minimum order is required'),
    body('expiry').isISO8601().withMessage('Expiry date is required'),
    body('usageLimit').isInt({ min: 1 }).withMessage('Usage limit is required'),
  ],
  validate,
  createCoupon
);
router.patch('/:id', ...admin, updateCoupon);
router.delete('/:id', ...admin, deleteCoupon);

export default router;
