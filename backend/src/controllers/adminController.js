const sellerModel = require("../models/sellerModel");
const productModel = require("../models/productModel");

const getDashboardStats = async (req, res) => {
    try {
        const sellerStats = await sellerModel.getSellerStats();
        const productStats = await productModel.getProductStats();

        res.json({
            sellers: sellerStats,
            products: productStats
        });

    } catch (error) {
        console.error("GET DASHBOARD STATS ERROR:", error);

        res.status(500).json({
            message: "Failed to get dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};