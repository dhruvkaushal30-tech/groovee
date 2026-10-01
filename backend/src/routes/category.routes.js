import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/category.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = Router();
const admin = [authenticateUser, checkRole('ADMIN')];

router.get('/', listCategories);
router.post('/', ...admin, createCategory);
router.patch('/:id', ...admin, updateCategory);
router.delete('/:id', ...admin, deleteCategory);

export default router;
