import express from 'express'
import { 
  placeOrder, 
  placeOrderStripe, 
  allOrders, 
  userOrders, 
  updateStatus, 
  verifyStripe,
  deleteOrder // Import hàm deleteOrder từ controller
} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.delete('/delete', adminAuth, deleteOrder) // Route xóa đơn hàng cho admin

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)

// User Feature
orderRouter.post('/userorders', authUser, userOrders)

// Verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)

export default orderRouter
