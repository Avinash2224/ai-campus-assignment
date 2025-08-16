import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  imageUrl: string;
  status: string;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String,
    required: true,
    default: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  totalValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total value before saving
productSchema.pre('save', function(next) {
  this.totalValue = this.price * this.stockQuantity;
  this.inStock = this.stockQuantity > 0;
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
