const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema(
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
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    contactPerson: {
      name: String,
      phone: String,
      email: String,
      position: String,
    },
    paymentTerms: {
      type: String,
      default: 'net 30',
    },
    taxId: String,
    categories: [{
      type: String,
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Supplier', supplierSchema); 