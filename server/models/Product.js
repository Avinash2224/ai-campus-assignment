const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["Electronics", "Clothing", "Furniture"], required: true },
  fragile: { type: Boolean, default: false },
  quantity: { type: Number, default: 1 },
  cost: { type: Number, default: 0 }, // cost per item
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Temporarily optional for migration
  createdAt: { type: Date, default: Date.now }
});

ProductSchema.virtual('totalcost').get(function () {
  return this.quantity * this.cost;
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Product", ProductSchema);
