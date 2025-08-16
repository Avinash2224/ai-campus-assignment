"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const CartItem_1 = require("../models/CartItem");
const Product_1 = require("../models/Product");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
exports.cartRoutes = router;
/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart items
 */
router.get('/', [auth_1.authenticateToken, auth_1.requireClient], async (req, res) => {
    try {
        const cartItems = await CartItem_1.CartItem.find({ userId: req.user.id })
            .populate('productId', 'name price imageUrl inStock stockQuantity')
            .lean();
        // Transform the data to match the expected format
        const transformedItems = cartItems.map(item => ({
            id: item._id,
            userId: item.userId,
            productId: item.productId._id,
            quantity: item.quantity,
            product: item.productId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));
        res.json({ data: transformedItems });
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
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
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Validation error
 */
router.post('/', [
    auth_1.authenticateToken,
    auth_1.requireClient,
    (0, express_validator_1.body)('productId').notEmpty().withMessage('Product ID is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { productId, quantity } = req.body;
        const userId = req.user.id;
        // Validate productId format
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }
        // Check if product exists and has sufficient stock
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (!product.inStock || product.stockQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        // Check if item already exists in cart
        const existingItem = await CartItem_1.CartItem.findOne({ userId, productId });
        if (existingItem) {
            // Update quantity
            existingItem.quantity += quantity;
            await existingItem.save();
            const updatedItem = await CartItem_1.CartItem.findById(existingItem._id)
                .populate('productId', 'name price imageUrl inStock stockQuantity')
                .lean();
            const transformedItem = {
                id: updatedItem._id,
                userId: updatedItem.userId,
                productId: updatedItem.productId._id,
                quantity: updatedItem.quantity,
                product: updatedItem.productId,
                createdAt: updatedItem.createdAt,
                updatedAt: updatedItem.updatedAt
            };
            res.json({ data: transformedItem });
        }
        else {
            // Add new item
            const newCartItem = await CartItem_1.CartItem.create({
                userId,
                productId,
                quantity
            });
            const populatedItem = await CartItem_1.CartItem.findById(newCartItem._id)
                .populate('productId', 'name price imageUrl inStock stockQuantity')
                .lean();
            const transformedItem = {
                id: populatedItem._id,
                userId: populatedItem.userId,
                productId: populatedItem.productId._id,
                quantity: populatedItem.quantity,
                product: populatedItem.productId,
                createdAt: populatedItem.createdAt,
                updatedAt: populatedItem.updatedAt
            };
            res.status(201).json({ data: transformedItem });
        }
    }
    catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/clear', [auth_1.authenticateToken, auth_1.requireClient], async (req, res) => {
    try {
        const userId = req.user.id;
        await CartItem_1.CartItem.deleteMany({ userId });
        res.json({ message: 'Cart cleared successfully' });
    }
    catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *       404:
 *         description: Cart item not found
 */
router.put('/:id', [
    auth_1.authenticateToken,
    auth_1.requireClient,
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { quantity } = req.body;
        const userId = req.user.id;
        const cartItemId = req.params.id;
        // Validate cartItemId format
        if (!mongoose_1.default.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).json({ error: 'Invalid cart item ID format' });
        }
        const cartItem = await CartItem_1.CartItem.findOne({ _id: cartItemId, userId });
        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        cartItem.quantity = quantity;
        await cartItem.save();
        const updatedItem = await CartItem_1.CartItem.findById(cartItem._id)
            .populate('productId', 'name price imageUrl inStock stockQuantity')
            .lean();
        const transformedItem = {
            id: updatedItem._id,
            userId: updatedItem.userId,
            productId: updatedItem.productId._id,
            quantity: updatedItem.quantity,
            product: updatedItem.productId,
            createdAt: updatedItem.createdAt,
            updatedAt: updatedItem.updatedAt
        };
        res.json({ data: transformedItem });
    }
    catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
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
 *         description: Item removed from cart
 *       404:
 *         description: Cart item not found
 */
router.delete('/:id', [auth_1.authenticateToken, auth_1.requireClient], async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItemId = req.params.id;
        // Validate cartItemId format
        if (!mongoose_1.default.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).json({ error: 'Invalid cart item ID format' });
        }
        const deletedItem = await CartItem_1.CartItem.findOneAndDelete({ _id: cartItemId, userId });
        if (!deletedItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Item removed from cart' });
    }
    catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=cart.js.map