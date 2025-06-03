const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { getProducts, getProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
router.get('/', protect, getProducts);

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Create a product
// @route   POST /api/products
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const { name, description, price, quantity, status, category } = req.body;

    const product = await Product.create({
        name,
        description,
        price,
        quantity,
        status: status || 'out_of_stock',
        category
    });

    if (product) {
        res.status(201).json(product);
    } else {
        res.status(400);
        throw new Error('Invalid product data');
    }
}));

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.quantity = req.body.quantity !== undefined ? req.body.quantity : product.quantity;
        product.status = req.body.status || product.status;
        product.category = req.body.category || product.category;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

module.exports = router; 