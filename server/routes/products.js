const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// GET /api/products  (with search, filter, sort, pagination) - Only user's products
router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 5, search = "", category = "", fragile = "", sort = "createdAt", order = "asc" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build filter - only show products that belong to the user
    const filter = { userId: req.user.id };
    if (search) filter.name = { $regex: new RegExp(search, "i") };
    if (category) filter.category = category;
    if (fragile === "true") filter.fragile = true;

    // Build sort
    let sortBy = {};
    sortBy[sort] = order === "desc" ? -1 : 1;

    // Query - only user's products
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    console.log(`User ${req.user.id} requesting products. Filter:`, filter);
    console.log(`Found ${total} products for user`);

    const products = await Product.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // For totalcost (virtual), just ensure `.lean({ virtuals: true })` if mongoose >=7,
    // else manually calculate below:
    for (const p of products) p.totalcost = p.quantity * p.cost;

    res.json({ data: products, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

// POST /api/products (Add) - Associate with logged-in user
router.post("/", async (req, res) => {
  try {
    const { name, category, fragile, quantity, cost } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: "Name & category are required" });
    }
    const product = new Product({
      name,
      category,
      fragile: !!fragile,
      quantity: Number(quantity) || 1,
      cost: Number(cost) || 0,
      userId: req.user.id // Associate with logged-in user (required)
    });
    
    console.log(`Creating product for user ${req.user.id}:`, product);
    await product.save();
    console.log(`Product saved with ID: ${product._id}`);
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
});

// PUT /api/products/:id (Edit) - Only user's own products
router.put("/:id", async (req, res) => {
  try {
    const { name, category, fragile, quantity, cost } = req.body;
    
    // First check if product belongs to user
    const existingProduct = await Product.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found or access denied" });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, fragile: !!fragile, quantity: Number(quantity) || 1, cost: Number(cost) || 0 },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
});

// DELETE /api/products/:id - Only user's own products
router.delete("/:id", async (req, res) => {
  try {
    // First check if product belongs to user
    const existingProduct = await Product.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found or access denied" });
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
});

module.exports = router;
