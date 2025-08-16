"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Order_1 = require("../models/Order");
const CartItem_1 = require("../models/CartItem");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.orderRoutes = router;
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
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
 *         description: User's orders
 */
router.get('/', [
    auth_1.authenticateToken,
    auth_1.requireClient,
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
        const userId = req.user.id;
        // Build filter
        const filter = { userId };
        if (status) {
            filter.status = status;
        }
        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order_1.Order.find(filter)
                .populate('items.productId', 'name imageUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order_1.Order.countDocuments(filter)
        ]);
        // Transform the data to match the expected format
        const transformedOrders = orders.map(order => ({
            ...order,
            id: order._id,
            _id: undefined,
            items: order.items.map((item) => ({
                ...item,
                id: item._id,
                _id: undefined,
                product: item.productId
            }))
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
 * /api/orders:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal, cash_on_delivery]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', [
    auth_1.authenticateToken,
    auth_1.requireClient,
    (0, express_validator_1.body)('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    (0, express_validator_1.body)('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery']).withMessage('Invalid payment method')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { shippingAddress, paymentMethod } = req.body;
        const userId = req.user.id;
        // Get user's cart items
        const userCartItems = await CartItem_1.CartItem.find({ userId })
            .populate('productId', 'name price imageUrl')
            .lean();
        if (userCartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        // Calculate total amount and create order items
        const orderItems = [];
        let totalAmount = 0;
        for (const cartItem of userCartItems) {
            const product = cartItem.productId;
            const itemTotal = product.price * cartItem.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                productId: product._id,
                quantity: cartItem.quantity,
                price: product.price
            });
        }
        // Create order
        const newOrder = await Order_1.Order.create({
            userId,
            items: orderItems,
            totalAmount,
            status: 'pending',
            shippingAddress,
            paymentMethod
        });
        // Clear cart after order creation
        await CartItem_1.CartItem.deleteMany({ userId });
        // Populate product details for response
        const populatedOrder = await Order_1.Order.findById(newOrder._id)
            .populate('items.productId', 'name imageUrl')
            .lean();
        // Transform the response
        const transformedOrder = {
            ...populatedOrder,
            id: populatedOrder._id,
            _id: undefined,
            items: populatedOrder.items.map((item) => ({
                ...item,
                id: item._id,
                _id: undefined,
                product: item.productId
            }))
        };
        res.status(201).json(transformedOrder);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
router.get('/:id', [auth_1.authenticateToken, auth_1.requireClient], async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const order = await Order_1.Order.findOne({ _id: orderId, userId })
            .populate('items.productId', 'name imageUrl')
            .lean();
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Transform the response
        const transformedOrder = {
            ...order,
            id: order._id,
            _id: undefined,
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
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
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
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 */
router.post('/:id/cancel', [auth_1.authenticateToken, auth_1.requireClient], async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const order = await Order_1.Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
        }
        order.status = 'cancelled';
        await order.save();
        // Transform the response
        const transformedOrder = {
            ...order.toObject(),
            id: order._id,
            _id: undefined
        };
        res.json(transformedOrder);
    }
    catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=orders.js.map