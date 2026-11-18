const express = require("express");

const {
    createPaymentOrder,
    updatePayment,
    getSellerEarnings
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/create-order",
    authMiddleware,
    createPaymentOrder
);

router.put(
    "/update-status",
    authMiddleware,
    updatePayment
);

router.get(
    "/seller-earnings/:orderId",
    authMiddleware,
    getSellerEarnings
);

module.exports = router;