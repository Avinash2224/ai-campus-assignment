export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'client';
    createdAt: Date;
    updatedAt: Date;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    inStock: boolean;
    stockQuantity: number;
    imageUrl: string;
    status: ProductStatus;
    totalValue: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum ProductCategory {
    ELECTRONICS = "electronics",
    CLOTHING = "clothing",
    BOOKS = "books",
    HOME = "home",
    SPORTS = "sports",
    BEAUTY = "beauty"
}
export declare enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    OUT_OF_STOCK = "out_of_stock",
    DISCONTINUED = "discontinued"
}
export interface CartItem {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    product: Product;
    createdAt: Date;
    updatedAt: Date;
}
export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: string;
    paymentMethod: PaymentMethod;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product: Product;
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    PAYPAL = "paypal",
    CASH_ON_DELIVERY = "cash_on_delivery"
}
export interface AuthRequest extends Request {
    user?: User;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    category?: ProductCategory;
    status?: ProductStatus;
    inStock?: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
//# sourceMappingURL=index.d.ts.map