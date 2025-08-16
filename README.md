# 🚢 Shipsy E-commerce Platform

A comprehensive e-commerce platform built for Shipsy's assignment, featuring both admin and client sides with full CRUD operations, authentication, and real-time status updates.

## ✨ Features

### 🔐 Authentication System
- **Username/Password Login**: Secure authentication with JWT tokens
- **Role-based Access Control**: Separate admin and client interfaces
- **Session Management**: Persistent login with localStorage
- **Demo Accounts**: Pre-configured admin and client accounts

### 📊 CRUD Operations
- **Products Management**: Full Create, Read, Update, Delete operations
- **Required Fields Implementation**:
  - ✅ **Text field**: Product name and description
  - ✅ **Enum (dropdown)**: Product category and status
  - ✅ **Boolean field**: In-stock status
  - ✅ **Calculated field**: Total value (price × stock quantity)

### 📑 Listing & Data Management
- **Pagination**: 10 items per page with navigation
- **Advanced Filtering**: Search, category, status, and stock filters
- **Sorting Capabilities**: Sort by name, price, and creation date
- **Search Functionality**: Real-time search across product names and descriptions

### 🛒 E-commerce Features
- **Shopping Cart**: Add, remove, and manage cart items
- **Order Management**: Create orders with shipping and payment details
- **Real-time Updates**: Admin can update product/order status, clients see changes immediately
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express.js + TypeScript
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Authentication**: JWT with bcrypt password hashing
- **Documentation**: Swagger/OpenAPI 3.0
- **State Management**: React hooks and local storage
- **HTTP Client**: Axios for API communication

### Project Structure
```
shipsy-ecommerce/
├── server/                 # Backend API server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Authentication middleware
│   │   ├── types/         # TypeScript interfaces
│   │   └── index.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── client/                 # Frontend Next.js app
│   ├── app/               # App router pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── client/        # Client interface
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home/login page
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── package.json            # Root package.json
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipsy-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend client (port 3000) concurrently.

### Manual Setup (Alternative)

If you prefer to run servers separately:

**Backend Server:**
```bash
cd server
npm install
npm run dev
```

**Frontend Client:**
```bash
cd client
npm install
npm run dev
```

## 🔑 Demo Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full admin dashboard, product management, order management

### Client Account
- **Username**: `client`
- **Password**: `client123`
- **Access**: Product browsing, cart management, order placement

## 📚 API Documentation

### Swagger UI
Once the server is running, visit: `http://localhost:8080/api-docs`

### Authentication Endpoints

#### POST `/api/auth/login`
Login with username and password
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### POST `/api/auth/register`
Register a new client account
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

### Product Endpoints

#### GET `/api/products`
Get products with pagination and filtering
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string
- category: string
- status: string
- inStock: boolean
- sortBy: name|price|createdAt
- sortOrder: asc|desc
```

#### POST `/api/products` (Admin only)
Create a new product
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "stockQuantity": 100,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### PUT `/api/products/:id` (Admin only)
Update product details

#### DELETE `/api/products/:id` (Admin only)
Delete a product

### Cart Endpoints

#### GET `/api/cart` (Client only)
Get user's cart items

#### POST `/api/cart` (Client only)
Add item to cart
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

### Order Endpoints

#### GET `/api/orders` (Client only)
Get user's orders with pagination

#### POST `/api/orders` (Client only)
Create a new order
```json
{
  "shippingAddress": "123 Main St, City, Country",
  "paymentMethod": "credit_card"
}
```

### Admin Endpoints

#### GET `/api/admin/dashboard` (Admin only)
Get admin dashboard data

#### GET `/api/admin/orders` (Admin only)
Get all orders with pagination

#### PUT `/api/admin/orders/:id/status` (Admin only)
Update order status

#### PUT `/api/admin/products/status` (Admin only)
Update product status

## 🎨 UI Components

### Design System
- **Color Palette**: Primary blues and secondary grays
- **Typography**: Inter font family
- **Components**: Cards, buttons, forms, tables
- **Responsive**: Mobile-first design approach

### Key Components
- **Product Cards**: Grid and list view modes
- **Filter Panel**: Advanced search and filtering
- **Data Tables**: Sortable and paginated data
- **Status Badges**: Color-coded status indicators
- **Loading States**: Skeleton loaders and spinners

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access**: Admin and client route protection
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configured for development and production
- **Helmet Security**: HTTP security headers

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch-Friendly**: Optimized for touch interactions
- **Cross-Browser**: Compatible with modern browsers

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set environment variables (JWT_SECRET, PORT)
3. Deploy to your preferred hosting service

### Frontend Deployment
1. Build the Next.js app: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting service

## 🧪 Testing

The project includes basic error handling and validation. For production use, consider adding:

- Unit tests with Jest
- Integration tests
- E2E tests with Playwright or Cypress
- API testing with Postman or similar tools

## 🔧 Configuration

### Environment Variables
```bash
# Server
JWT_SECRET=your-secret-key
PORT=5000

# Client
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Database Integration
Currently uses in-memory storage for demo purposes. For production:

1. Set up PostgreSQL, MongoDB, or your preferred database
2. Update the data access layer in route files
3. Add connection pooling and error handling
4. Implement proper data persistence

## 📈 Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Browser and API response caching
- **Bundle Analysis**: Built-in Next.js bundle analyzer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is created for Shipsy's assignment. All rights reserved.

## 🆘 Support

For questions or issues:
1. Check the API documentation at `/api-docs`
2. Review the console logs for errors
3. Ensure all dependencies are installed
4. Verify the server is running on port 5000

## 🎯 Future Enhancements

- **Real-time Updates**: WebSocket integration for live status updates
- **Payment Integration**: Stripe, PayPal, or other payment gateways
- **Email Notifications**: Order confirmations and status updates
- **Inventory Management**: Advanced stock tracking and alerts
- **Analytics Dashboard**: Sales reports and customer insights
- **Multi-language Support**: Internationalization (i18n)
- **Mobile App**: React Native or Flutter mobile application

---

**Built with ❤️ for Shipsy Assignment**
