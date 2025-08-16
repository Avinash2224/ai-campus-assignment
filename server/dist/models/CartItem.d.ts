import mongoose, { Document } from 'mongoose';
export interface ICartItem extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CartItem: mongoose.Model<ICartItem, {}, {}, {}, mongoose.Document<unknown, {}, ICartItem, {}, {}> & ICartItem & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CartItem.d.ts.map