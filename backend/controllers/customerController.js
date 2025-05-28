const asyncHandler = require('express-async-handler');
const Customer = require('../models/customerModel');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { email: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await Customer.countDocuments({ ...keyword });
  const customers = await Customer.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    customers,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, address, status } = req.body;

  // Check if customer exists
  const customerExists = await Customer.findOne({ email });

  if (customerExists) {
    res.status(400);
    throw new Error('Customer already exists');
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    address,
    status: status || 'active',
  });

  if (customer) {
    res.status(201).json(customer);
  } else {
    res.status(400);
    throw new Error('Invalid customer data');
  }
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;
    customer.phone = req.body.phone || customer.phone;
    customer.address = req.body.address || customer.address;
    customer.status = req.body.status || customer.status;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    await Customer.deleteOne({ _id: req.params.id });
    res.json({ message: 'Customer removed' });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}; 