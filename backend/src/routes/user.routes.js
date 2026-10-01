import { Router } from 'express';
import { body } from 'express-validator';
import { getMe, updateMe } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticateUser);
router.get('/me', getMe);
router.patch(
  '/me',
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim().isLength({ min: 8, max: 15 }).withMessage('Enter a valid phone number'),
  ],
  validate,
  updateMe
);

export default router;
