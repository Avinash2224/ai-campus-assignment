import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';

const router: Router = Router();

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/orders', [
  authenticateToken,
  requireAdmin,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    // Transform MongoDB _id to id for client compatibility
    const transformedOrders = orders.map(order => ({
      ...order,
      id: order._id,
      _id: undefined
    }));

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id', [authenticateToken, requireAdmin], async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('userId', 'username email')
      .populate('items.productId', 'name imageUrl price')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Transform MongoDB _id to id for client compatibility
    const transformedOrder = {
      ...order,
      id: order._id,
      _id: undefined,
      userId: (order.userId as any)?._id || order.userId,
      user: (order.userId as any) ? {
        id: (order.userId as any)._id,
        username: (order.userId as any).username,
        email: (order.userId as any).email
      } : undefined,
      items: order.items.map((item: any) => ({
        ...item,
        id: item._id,
        _id: undefined,
        product: item.productId
      }))
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/status', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const orderId = req.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Transform MongoDB _id to id for client compatibility
    const transformedOrder = {
      ...updatedOrder.toObject(),
      id: updatedOrder._id,
      _id: undefined
    };

    res.json({ message: 'Order status updated successfully', status, order: transformedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/products/status:
 *   put:
 *     summary: Update product status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - status
 *             properties:
 *               productId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, out_of_stock, discontinued]
 *     responses:
 *       200:
 *         description: Product status updated
 *       404:
 *         description: Product not found
 */
router.put('/products/status', [
  authenticateToken,
  requireAdmin,
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('status').isIn(['active', 'inactive', 'out_of_stock', 'discontinued']).withMessage('Invalid product status')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, status } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Transform MongoDB _id to id for client compatibility
    const transformedProduct = {
      ...updatedProduct.toObject(),
      id: updatedProduct._id,
      _id: undefined
    };

    res.json({ message: 'Product status updated successfully', status, product: transformedProduct });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get admin analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', [authenticateToken, requireAdmin], async (req: Request, res: Response) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue, pendingOrders, lowStockProducts] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stockQuantity: { $lt: 10 } })
    ]);

    const analytics = {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      topCategories: [],
      recentOrders: []
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/dashboard', [authenticateToken, requireAdmin], async (req: Request, res: Response) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0)
    ]);

    const dashboard = {
      summary: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue
      },
      recentActivity: [],
      topProducts: [],
      orderStatusCounts: {}
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminRoutes };
