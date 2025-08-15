const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products  (with search, filter, sort, pagination)
router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 5, search = "", category = "", fragile = "", sort = "createdAt", order = "asc" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build filter
    const filter = {};
    if (search) filter.name = { $regex: new RegExp(search, "i") };
    if (category) filter.category = category;
    if (fragile === "true") filter.fragile = true;

    // Build sort
    let sortBy = {};
    sortBy[sort] = order === "desc" ? -1 : 1;

    // Query
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

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

// POST /api/products (Add)
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
      cost: Number(cost) || 0
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
});

// PUT /api/products/:id (Edit)
router.put("/:id", async (req, res) => {
  try {
    const { name, category, fragile, quantity, cost } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, fragile: !!fragile, quantity: Number(quantity) || 1, cost: Number(cost) || 0 },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
});

module.exports = router;
