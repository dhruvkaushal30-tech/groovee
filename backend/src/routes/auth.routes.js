import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, logoutAll, refreshToken, register, resetPassword } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').trim().isLength({ min: 8, max: 15 }).withMessage('Enter a valid phone number'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('phone').trim().isLength({ min: 8, max: 15 }).withMessage('Enter a valid phone number'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
);

router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/logout-all', authenticateUser, logoutAll);

export default router;
