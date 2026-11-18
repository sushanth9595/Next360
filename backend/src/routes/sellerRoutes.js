const express = require("express");

const checkApprovedSeller = require("../middleware/sellerMiddleware");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    registerSeller,
    updateKyc
} = require("../controllers/sellerController");

const router = express.Router();

router.get(
    "/approved-test",
    authenticateToken,
    authorizeRoles("SELLER", "BUYER"),
    checkApprovedSeller,
    (req, res) => {
        res.json({
            message: "Seller is approved",
            seller: req.seller
        });
    }
);

router.get(
    "/profile",
    authenticateToken,
    authorizeRoles("SELLER"),
    (req, res) => {
        res.json({
            message: "Welcome Seller!",
            user: req.user
        });
    }
);

router.post(
    "/register",
    authenticateToken,
    authorizeRoles("BUYER"),
    registerSeller
);

router.put(
    "/kyc",
    authenticateToken,
    authorizeRoles("BUYER", "SELLER"),
    updateKyc
);

module.exports = router;