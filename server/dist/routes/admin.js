"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
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
    auth_1.authenticateToken,
    auth_1.requireAdmin,
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status;
        // Build filter
        const filter = {};
        if (status) {
            filter.status = status;
        }
        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order_1.Order.find(filter)
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order_1.Order.countDocuments(filter)
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
    }
    catch (error) {
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
router.get('/orders/:id', [auth_1.authenticateToken, auth_1.requireAdmin], async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order_1.Order.findById(orderId)
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
            userId: order.userId?._id || order.userId,
            user: order.userId ? {
                id: order.userId._id,
                username: order.userId.username,
                email: order.userId.email
            } : undefined,
            items: order.items.map((item) => ({
                ...item,
                id: item._id,
                _id: undefined,
                product: item.productId
            }))
        };
        res.json(transformedOrder);
    }
    catch (error) {
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
    auth_1.authenticateToken,
    auth_1.requireAdmin,
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { status } = req.body;
        const orderId = req.params.id;
        const updatedOrder = await Order_1.Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
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
    }
    catch (error) {
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
    auth_1.authenticateToken,
    auth_1.requireAdmin,
    (0, express_validator_1.body)('productId').notEmpty().withMessage('Product ID is required'),
    (0, express_validator_1.body)('status').isIn(['active', 'inactive', 'out_of_stock', 'discontinued']).withMessage('Invalid product status')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { productId, status } = req.body;
        const updatedProduct = await Product_1.Product.findByIdAndUpdate(productId, { status }, { new: true, runValidators: true });
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
    }
    catch (error) {
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
router.get('/analytics', [auth_1.authenticateToken, auth_1.requireAdmin], async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalUsers, totalRevenue, pendingOrders, lowStockProducts] = await Promise.all([
            Product_1.Product.countDocuments(),
            Order_1.Order.countDocuments(),
            User_1.User.countDocuments(),
            Order_1.Order.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).then(result => result[0]?.total || 0),
            Order_1.Order.countDocuments({ status: 'pending' }),
            Product_1.Product.countDocuments({ stockQuantity: { $lt: 10 } })
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
    }
    catch (error) {
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
router.get('/dashboard', [auth_1.authenticateToken, auth_1.requireAdmin], async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
            Product_1.Product.countDocuments(),
            Order_1.Order.countDocuments(),
            User_1.User.countDocuments(),
            Order_1.Order.aggregate([
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
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=admin.js.map