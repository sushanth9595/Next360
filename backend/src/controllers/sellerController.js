const sellerModel = require("../models/sellerModel");

const registerSeller = async (req, res) => {
    try {
        const userId = req.user.id;
        const { businessName, kycDetails } = req.body;

        if (!businessName) {
            return res.status(400).json({
                message: "Business name is required"
            });
        }

        const existingSeller =
            await sellerModel.findSellerByUserId(userId);

        if (existingSeller) {
            return res.status(409).json({
                message: "Seller account already exists"
            });
        }

        const seller = await sellerModel.createSeller(
            userId,
            businessName,
            kycDetails || null
        );

        res.status(201).json({
            message:
                "Seller registration submitted successfully",
            seller: seller
        });

    } catch (error) {
        console.error(
            "SELLER REGISTRATION ERROR:",
            error
        );

        res.status(500).json({
            message: "Seller registration failed"
        });
    }
};

const updateKyc = async (req, res) => {
    try {
        const userId = req.user.id;
        const { kycDetails } = req.body;

        if (!kycDetails) {
            return res.status(400).json({
                message: "KYC details are required"
            });
        }

        const seller =
            await sellerModel.findSellerByUserId(userId);

        if (!seller) {
            return res.status(404).json({
                message: "Seller account not found"
            });
        }

        const updatedSeller =
            await sellerModel.updateKycDetails(
                userId,
                kycDetails
            );

        res.json({
            message:
                "KYC details updated successfully",
            seller: updatedSeller
        });

    } catch (error) {
        console.error(
            "KYC UPDATE ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to update KYC details"
        });
    }
};

const updateSellerApproval = async (req, res) => {
    try {
        const { sellerId, status } = req.body;

        if (!sellerId || !status) {
            return res.status(400).json({
                message:
                    "Seller ID and status are required"
            });
        }

        if (
            !["APPROVED", "REJECTED"].includes(status)
        ) {
            return res.status(400).json({
                message:
                    "Status must be APPROVED or REJECTED"
            });
        }

        const seller =
            await sellerModel.findSellerById(
                sellerId
            );

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        const updatedSeller =
            await sellerModel.updateSellerStatus(
                sellerId,
                status
            );

        res.json({
            message:
                `Seller ${status.toLowerCase()} successfully`,
            seller: updatedSeller
        });

    } catch (error) {
        console.error(
            "SELLER APPROVAL ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update seller approval"
        });
    }
};

const blockSeller = async (req, res) => {
    try {
        const { sellerId } = req.params;

        if (!sellerId) {
            return res.status(400).json({
                message: "Seller ID is required"
            });
        }

        const seller =
            await sellerModel.findSellerById(
                sellerId
            );

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        const updatedSeller =
            await sellerModel.blockSeller(
                sellerId
            );

        res.json({
            message: "Seller blocked successfully",
            seller: updatedSeller
        });

    } catch (error) {
        console.error(
            "BLOCK SELLER ERROR:",
            error
        );

        if (
            error.message ===
            "SELLER_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        res.status(500).json({
            message: "Failed to block seller"
        });
    }
};

const getPendingSellers = async (req, res) => {
    try {
        const sellers =
            await sellerModel.findPendingSellers();

        res.json({
            sellers: sellers
        });

    } catch (error) {
        console.error(
            "GET PENDING SELLERS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get pending sellers"
        });
    }
};

const getAllSellers = async (req, res) => {
    try {
        const sellers =
            await sellerModel.findAllSellers();

        res.json({
            sellers: sellers
        });

    } catch (error) {
        console.error(
            "GET ALL SELLERS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to get sellers"
        });
    }
};

module.exports = {
    registerSeller,
    updateKyc,
    updateSellerApproval,
    blockSeller,
    getPendingSellers,
    getAllSellers
};