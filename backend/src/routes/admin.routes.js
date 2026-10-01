import { Router } from 'express';
import { dashboard, listOrders, listUsers, updateOrderStatus } from '../controllers/admin.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticateUser, checkRole('ADMIN'));
router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.get('/orders', listOrders);
router.patch('/orders/:id', updateOrderStatus);

export default router;
