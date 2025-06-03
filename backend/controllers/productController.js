const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { category: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 }); // Sort by newest first

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    
    const {
      name,
      description,
      price,
      category,
      quantity,
      image,
      barcode,
      status
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Create product with explicit status
    const product = await Product.create({
      user: req.user._id,
      name,
      description,
      price,
      category,
      quantity: quantity || 0,
      image,
      barcode,
      status: status || 'out_of_stock' // Default to out_of_stock if not provided
    });

    console.log('Product created successfully:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400);
    throw error;
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  try {
    console.log('Updating product with data:', req.body);
    
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ensure status is included in updates
    const updates = {
      name: req.body.name !== undefined ? req.body.name : product.name,
      description: req.body.description !== undefined ? req.body.description : product.description,
      price: req.body.price !== undefined ? req.body.price : product.price,
      category: req.body.category !== undefined ? req.body.category : product.category,
      quantity: req.body.quantity !== undefined ? req.body.quantity : product.quantity,
      image: req.body.image !== undefined ? req.body.image : product.image,
      barcode: req.body.barcode !== undefined ? req.body.barcode : product.barcode,
      status: req.body.status || product.status // Use existing status if not provided
    };

    console.log('Applying updates:', updates);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    console.log('Product updated successfully:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400);
    throw error;
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
}; 