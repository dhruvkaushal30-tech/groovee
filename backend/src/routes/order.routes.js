import { Router } from 'express';
import { cancelMyOrder, createOrder, getMyOrder, listMyOrders } from '../controllers/order.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateUser);
router.post('/', createOrder);
router.get('/', listMyOrders);
router.get('/:id', getMyOrder);
router.patch('/:id/cancel', cancelMyOrder);

export default router;
