const orderModel = require("../models/orderModel");

const createOrder = async (req, res) => {
    try {
        const { productId, quantity, totalPrice } = req.body;

        if (!productId || !quantity || !totalPrice) {
            return res.status(400).json({
                message: "Product, quantity and total price are required"
            });
        }

        const order = await orderModel.createOrder(
            req.user.id,
            productId,
            quantity,
            totalPrice
        );

        res.status(201).json({
            message: "Order created successfully",
            order
        });
    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            message: "Failed to create order"
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await orderModel.getOrdersByUser(
            req.user.id
        );

        res.json({
            orders
        });
        } catch (error) {
        console.error("Create order error:", error);

        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (error.message === "INSUFFICIENT_STOCK") {
            return res.status(400).json({
                message: "Insufficient stock available"
            });
        }

        res.status(500).json({
            message: "Failed to create order"
        });
    }
};

const getSellerOrders = async (req, res) => {
    try {
        const orders = await orderModel.getOrdersBySeller(
            req.user.id
        );

        res.json({
            orders
        });

    } catch (error) {
        console.error(
            "Get seller orders error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch seller orders"
        });
    }
};

const updateSellerOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                message: "Order ID and status are required"
            });
        }

        const allowedStatuses = [
            "PLACED",
            "SHIPPED",
            "DELIVERED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order =
            await orderModel.updateOrderStatus(
                orderId,
                req.user.id,
                status
            );

        res.json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error(
            "Update seller order status error:",
            error
        );

        if (
    error.message ===
    "ORDER_NOT_FOUND_OR_NOT_SELLER_ORDER"
) {
    return res.status(404).json({
        message:
            "Order not found or you are not the seller"
    });
}

if (
    error.message ===
    "INVALID_ORDER_STATUS_TRANSITION"
) {
    return res.status(400).json({
        message:
            "Order status can only move from PLACED to SHIPPED, then SHIPPED to DELIVERED"
    });
}

        res.status(500).json({
            message: "Failed to update order status"
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrders();

        res.json({
            orders
        });

    } catch (error) {
        console.error(
            "Get all orders error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch all orders"
        });
    }
};

const cancelOrderByAdmin = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        const order =
            await orderModel.cancelOrderByAdmin(
                orderId
            );

        res.json({
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.error(
            "Admin cancel order error:",
            error
        );

        if (
            error.message ===
            "ORDER_NOT_FOUND_OR_CANNOT_CANCEL"
        ) {
            return res.status(400).json({
                message:
                    "Order not found or cannot be cancelled"
            });
        }

        res.status(500).json({
            message: "Failed to cancel order"
        });
    }
};

const updateOrderStatusByAdmin = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                message: "Order ID and status are required"
            });
        }

        const allowedStatuses = [
            "PLACED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order =
            await orderModel.updateOrderStatusByAdmin(
                orderId,
                status
            );

        res.json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error(
            "Admin update order status error:",
            error
        );

        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(500).json({
            message: "Failed to update order status"
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateSellerOrderStatus,
    getAllOrders,
    cancelOrderByAdmin,
    updateOrderStatusByAdmin
};

