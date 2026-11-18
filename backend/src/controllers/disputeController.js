const disputeModel = require("../models/disputeModel");

const createDispute = async (req, res) => {
    try {
        const { orderId, reason, description } = req.body;

        if (!orderId || !reason) {
            return res.status(400).json({
                message: "Order ID and reason are required"
            });
        }

        const order = await disputeModel.findOrderForUser(
            orderId,
            req.user.id
        );

        if (!order) {
            return res.status(403).json({
                message: "You can only raise a dispute for your own order"
            });
        }

        const dispute = await disputeModel.createDispute(
            orderId,
            req.user.id,
            reason,
            description || null
        );

        res.status(201).json({
            message: "Dispute created successfully",
            dispute
        });
    } catch (error) {
        console.error(
            "CREATE DISPUTE ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to create dispute"
        });
    }
};

const getMyDisputes = async (req, res) => {
    try {
        const disputes =
            await disputeModel.getDisputesByUser(
                req.user.id
            );

        res.json(disputes);

    } catch (error) {
        console.error("GET MY DISPUTES ERROR:", error);

        res.status(500).json({
            message: "Failed to get disputes"
        });
    }
};

const getAllDisputes = async (req, res) => {
    try {
        const disputes =
            await disputeModel.getAllDisputes();

        res.json(disputes);

    } catch (error) {
        console.error("GET ALL DISPUTES ERROR:", error);

        res.status(500).json({
            message: "Failed to get disputes"
        });
    }
};

const updateDisputeStatus = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { status, adminNote } = req.body;

        if (!disputeId || !status) {
            return res.status(400).json({
                message: "Dispute ID and status are required"
            });
        }

        const allowedStatuses = [
            "OPEN",
            "RESOLVED",
            "REJECTED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid dispute status"
            });
        }

        const dispute =
            await disputeModel.updateDisputeStatus(
                disputeId,
                status,
                adminNote || null
            );

        res.json({
            message: "Dispute updated successfully",
            dispute
        });

    } catch (error) {
        console.error(
            "UPDATE DISPUTE STATUS ERROR:",
            error
        );

        if (
            error.message ===
            "DISPUTE_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Dispute not found"
            });
        }

        res.status(500).json({
            message: "Failed to update dispute"
        });
    }
};

module.exports = {
    createDispute,
    getMyDisputes,
    getAllDisputes,
    updateDisputeStatus
};