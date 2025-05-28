const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        orderNumber: { $regex: req.query.keyword, $options: 'i' },
      }
    : {};

  const count = await Order.countDocuments({ ...keyword });
  const orders = await Order.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Helper function to generate order number
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get count of orders for today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const todayOrders = await Order.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  const sequence = (todayOrders + 1).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${sequence}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    totalAmount,
    status,
    paymentStatus,
    shippingMethod,
  } = req.body;

  // Validate required fields
  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Please provide valid order data');
  }

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Validate and update product stock
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(400);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    // Update stock quantity
    product.quantity -= item.quantity;
    await product.save();

    // Add validated item to order
    orderItems.push({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    });
  }

  try {
    const order = await Order.create({
      orderNumber,
      customer,
      items: orderItems,
      totalAmount,
      status: status || 'pending',
      paymentStatus: paymentStatus || 'pending',
      shippingMethod: shippingMethod || 'standard',
    });

    res.status(201).json(order);
  } catch (error) {
    // If order creation fails, restore product quantities
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }
    res.status(400);
    throw new Error(error.message || 'Failed to create order');
  }
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    order.shippingMethod = req.body.shippingMethod || order.shippingMethod;
    
    if (req.body.customer) {
      order.customer = {
        ...order.customer,
        ...req.body.customer,
      };
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Restore stock quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Order removed' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
}; 