const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/profile",
    authenticateToken,
    authorizeRoles("BUYER"),
    (req, res) => {
        res.json({
            message: "Welcome Buyer!",
            user: req.user
        });
    }
);

module.exports = router;