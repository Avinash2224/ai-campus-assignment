"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const database_1 = require("./config/database");
const auth_1 = require("./routes/auth");
const products_1 = require("./routes/products");
const orders_1 = require("./routes/orders");
const cart_1 = require("./routes/cart");
const admin_1 = require("./routes/admin");
const User_1 = require("./models/User");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Connect to MongoDB
(0, database_1.connectDB)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shipsy E-commerce API',
            version: '1.0.0',
            description: 'A comprehensive e-commerce platform API with admin and client sides',
            contact: {
                name: 'Shipsy Assignment',
                email: 'assignment@shipsy.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.ts']
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
// Initialize essential admin user
const initializeAdmin = async () => {
    try {
        // Check if admin user exists
        const adminExists = await User_1.User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User_1.User.create({
                username: 'admin',
                email: 'admin@shipsy.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('✅ Admin user created');
        }
    }
    catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
};
// Routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/products', products_1.productRoutes);
app.use('/api/orders', orders_1.orderRoutes);
app.use('/api/cart', cart_1.cartRoutes);
app.use('/api/admin', admin_1.adminRoutes);
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
    // Initialize admin user after server starts
    await initializeAdmin();
});
//# sourceMappingURL=index.js.map