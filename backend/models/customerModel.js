const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster queries
customerSchema.index({ email: 1 });
customerSchema.index({ name: 'text' });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema); 