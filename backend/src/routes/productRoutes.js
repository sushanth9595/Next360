const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkApprovedSeller = require("../middleware/sellerMiddleware");

const {
    createProduct,
    getSellerProducts,
    uploadCertificate,
    getProductById,
    getAllProducts,
    getApprovedProducts,
    updateProduct,
    getVerifiedOrganicProducts,
    deleteProduct
} = require("../controllers/productController");

const router = express.Router();

// Add product
router.post(
    "/",
    authenticateToken,
    authorizeRoles("SELLER"),
    checkApprovedSeller,
    createProduct
);

// Get verified organic products
router.get(
    "/organic",
    authenticateToken,
    getVerifiedOrganicProducts
);

// Get seller's products
router.get(
    "/my-products",
    authenticateToken,
    authorizeRoles("SELLER"),
    checkApprovedSeller,
    getSellerProducts
);

// Upload product certificate
router.put(
    "/:productId/certificate",
    authenticateToken,
    authorizeRoles("SELLER"),
    checkApprovedSeller,
    uploadCertificate
);

router.get(
    "/",
    getApprovedProducts
);

router.get(
    "/:productId",
    getProductById
);

router.put(
    "/:productId",
    authenticateToken,
    authorizeRoles("SELLER"),
    checkApprovedSeller,
    updateProduct
);

router.delete(
    "/:productId",
    authenticateToken,
    authorizeRoles("SELLER"),
    checkApprovedSeller,
    deleteProduct
);

module.exports = router;