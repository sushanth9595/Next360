const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("../db");

const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const buyerRoutes = require("./routes/buyerRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Buyer routes
app.use("/api/buyer", buyerRoutes);


// Seller routes
app.use("/api/seller", sellerRoutes);


// Admin routes
app.use("/api/admin", adminRoutes);

// Product routes
app.use("/api/products", productRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

// payment
app.use("/api/payments", paymentRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Next360 API"
    });
});

// Database test
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error("DATABASE ERROR:", error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});
// Protected test route
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({
        message: "You have access to the protected API",
        user: req.user
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Next360 server running on port ${PORT}`);
});