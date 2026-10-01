import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '../controllers/product.controller.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';
import { uploadImages } from '../middleware/upload.middleware.js';

const router = Router();
const admin = [authenticateUser, checkRole('ADMIN')];

router.get('/search', optionalAuth, listProducts);
router.get('/', optionalAuth, listProducts);
router.get('/:id', optionalAuth, getProduct);
router.post('/', ...admin, uploadImages.array('images', 5), createProduct);
router.patch('/:id', ...admin, uploadImages.array('images', 5), updateProduct);
router.delete('/:id', ...admin, deleteProduct);

export default router;
