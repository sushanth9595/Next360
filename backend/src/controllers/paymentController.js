const createPaymentOrder = async (req, res) => {
    try {
        const { amount, receipt } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Valid amount is required"
            });
        }

        // Development-only payment simulation
        const testPaymentOrder = {
            id: `test_order_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: receipt || `next360_test_${Date.now()}`,
            status: "created"
        };

        res.status(201).json({
            message: "Test payment order created successfully",
            testMode: true,
            order: testPaymentOrder
        });

    } catch (error) {
        console.error("Create payment order error:", error);

        res.status(500).json({
            message: "Failed to create payment order"
        });
    }
};

const orderModel = require("../models/orderModel");

const updatePayment = async (req, res) => {
    try {
        const {
            orderId,
            paymentStatus,
            paymentId,
            paymentMethod
        } = req.body;

        if (!orderId || !paymentStatus) {
            return res.status(400).json({
                message: "Order ID and payment status are required"
            });
        }

        const allowedStatuses = [
            "PENDING",
            "PAID",
            "FAILED"
        ];

        if (!allowedStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                message: "Invalid payment status"
            });
        }

        const order = await orderModel.updatePaymentStatus(
            orderId,
            paymentStatus,
            paymentId || null,
            paymentMethod || "TEST"
        );

        res.json({
            message: "Payment status updated successfully",
            order
        });

    } catch (error) {
        console.error("Update payment error:", error);

        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(500).json({
            message: "Failed to update payment status"
        });
    }
};

const getSellerEarnings = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        const earnings =
            await orderModel.calculateSellerEarnings(orderId);

        res.json({
            message: "Seller earnings calculated successfully",
            earnings
        });

    } catch (error) {
        console.error("Seller earnings error:", error);

        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(500).json({
            message: "Failed to calculate seller earnings"
        });
    }
};

module.exports = {
    createPaymentOrder,
    updatePayment,
    getSellerEarnings
};