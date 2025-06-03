const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a product description'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    status: {
        type: String,
        enum: ['in_stock', 'out_of_stock', 'discontinued'],
        required: [true, 'Please add a status'],
        default: 'in_stock'
    }
}, {
    timestamps: true
});

// Add index for faster queries
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema); 