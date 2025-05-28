const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getOrders).post(protect, createOrder);
router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, updateOrder)
  .delete(protect, admin, deleteOrder);

module.exports = router; 