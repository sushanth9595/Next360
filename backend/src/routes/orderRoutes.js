const express = require("express");

const {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateSellerOrderStatus
} = require("../controllers/orderController");

const {
    createDispute,
    getMyDisputes
} = require("../controllers/disputeController");

const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

// Create a new order
router.post("/", authMiddleware, createOrder);

// Get logged-in buyer's orders
router.get("/my-orders", authMiddleware, getMyOrders);

// Create a buyer dispute
router.post(
    "/disputes",
    authMiddleware,
    createDispute
);

// Get logged-in buyer's disputes
router.get(
    "/my-disputes",
    authMiddleware,
    getMyDisputes
);

// Get logged-in seller's orders
router.get(
    "/seller-orders",
    authMiddleware,
    getSellerOrders
);

// Update seller order status
router.put(
    "/seller-orders/:orderId/status",
    authMiddleware,
    updateSellerOrderStatus
);

module.exports = router;