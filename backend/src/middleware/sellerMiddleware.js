const sellerModel = require("../models/sellerModel");

const checkApprovedSeller = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const seller = await sellerModel.findSellerByUserId(userId);

        if (!seller) {
            return res.status(404).json({
                message: "Seller account not found"
            });
        }

        if (seller.status !== "APPROVED") {
            return res.status(403).json({
                message: "Seller account is not approved yet"
            });
        }

        req.seller = seller;

        next();

    } catch (error) {
        console.error("SELLER APPROVAL CHECK ERROR:", error);

        res.status(500).json({
            message: "Failed to verify seller status"
        });
    }
};

module.exports = checkApprovedSeller;