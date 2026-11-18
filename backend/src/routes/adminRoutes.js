const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getDashboardStats
} = require("../controllers/adminController");

const {
    getAllDisputes,
    updateDisputeStatus
} = require("../controllers/disputeController");

const {
    getAllOrders,
    cancelOrderByAdmin,
    updateOrderStatusByAdmin
} = require("../controllers/orderController");

const {
    updateProductApproval,
    getPendingProducts,
    getAllProducts,
    removeProductByAdmin
} = require("../controllers/productController");

const {
    getPendingSellers,
    getAllSellers,
    blockSeller,
    updateSellerApproval
} = require("../controllers/sellerController");

const router = express.Router();

router.get(
    "/profile",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.json({
            message: "Welcome Admin!",
            user: req.user
        });
    }
);

router.get(
    "/dashboard/stats",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getDashboardStats
);

router.put(
    "/product/:productId/approval",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateProductApproval
);

router.put(
    "/product/:productId/remove",
    authenticateToken,
    authorizeRoles("ADMIN"),
    removeProductByAdmin
);

router.put(
    "/seller/approval",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateSellerApproval
);

router.get(
    "/sellers/pending",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getPendingSellers
);

router.get(
    "/sellers",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAllSellers
);

router.put(
    "/seller/:sellerId/block",
    authenticateToken,
    authorizeRoles("ADMIN"),
    blockSeller
);

router.get(
    "/products",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAllProducts
);

router.get(
    "/orders",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAllOrders
);

router.put(
    "/orders/:orderId/cancel",
    authenticateToken,
    authorizeRoles("ADMIN"),
    cancelOrderByAdmin
);

router.put(
    "/orders/:orderId/status",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateOrderStatusByAdmin
);

router.get(
    "/disputes",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAllDisputes
);

router.put(
    "/disputes/:disputeId/status",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateDisputeStatus
);

module.exports = router;