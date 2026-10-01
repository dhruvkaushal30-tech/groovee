import { Router } from 'express';
import { body } from 'express-validator';
import {
  addCartItem,
  applyCoupon,
  clearCart,
  getCart,
  mergeCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cart.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticateUser);
router.get('/', getCart);
router.post(
  '/',
  [body('productId').notEmpty(), body('size').notEmpty(), body('color').notEmpty()],
  validate,
  addCartItem
);
router.post('/merge', mergeCart);
router.post('/coupon', applyCoupon);
router.patch('/:itemId', [body('quantity').isInt({ min: 1 })], validate, updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
