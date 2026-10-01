import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export const dashboard = asyncHandler(async (_req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueAgg, recentOrders, pendingOrders] = await Promise.all([
    User.countDocuments({ role: 'USER' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'firstName lastName email'),
    Order.countDocuments({ orderStatus: 'Pending' }),
  ]);

  res.json({
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      revenue: revenueAgg[0]?.total || 0,
    },
    recentOrders,
  });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-addresses');
  res.json({ users });
});

export const listOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('user', 'firstName lastName email');
  res.json({ orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  if (!STATUSES.includes(orderStatus)) throw new AppError('Invalid order status', 400);
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
  if (!order) throw new AppError('Order not found', 404);
  order.orderStatus = orderStatus;
  if (orderStatus === 'Delivered') order.paymentStatus = 'Paid';
  await order.save();
  res.json({ order });
});
