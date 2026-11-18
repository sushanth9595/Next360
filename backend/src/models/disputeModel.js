const pool = require("../../db");

const createDispute = async (
    orderId,
    userId,
    reason,
    description
) => {
    const result = await pool.query(
        `INSERT INTO disputes
        (
            order_id,
            user_id,
            reason,
            description
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            orderId,
            userId,
            reason,
            description
        ]
    );

    return result.rows[0];
};

const getDisputesByUser = async (userId) => {
    const result = await pool.query(
        `SELECT
            disputes.*,
            products.name AS product_name
         FROM disputes
         JOIN orders
            ON disputes.order_id = orders.id
         JOIN products
            ON orders.product_id = products.id
         WHERE disputes.user_id = $1
         ORDER BY disputes.created_at DESC`,
        [userId]
    );

    return result.rows;
};

const getAllDisputes = async () => {
    const result = await pool.query(
        `SELECT
            disputes.*,
            products.name AS product_name,
            users.phone AS buyer_phone
         FROM disputes
         JOIN orders
            ON disputes.order_id = orders.id
         JOIN products
            ON orders.product_id = products.id
         JOIN users
            ON disputes.user_id = users.id
         ORDER BY disputes.created_at DESC`
    );

    return result.rows;
};

const updateDisputeStatus = async (
    disputeId,
    status,
    adminNote
) => {
    const result = await pool.query(
        `UPDATE disputes
         SET
            status = $1,
            admin_note = $2,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [
            status,
            adminNote,
            disputeId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error("DISPUTE_NOT_FOUND");
    }

    return result.rows[0];
};

const findOrderForUser = async (orderId, userId) => {
    const result = await pool.query(
        `SELECT id
         FROM orders
         WHERE id = $1 AND user_id = $2`,
        [orderId, userId]
    );

    return result.rows[0] || null;
};

const findActiveDisputeByOrder = async (orderId, userId) => {
    const result = await pool.query(
        `SELECT id, status
         FROM disputes
         WHERE order_id = $1
           AND user_id = $2
           AND status = 'OPEN'
         LIMIT 1`,
        [orderId, userId]
    );

    return result.rows[0] || null;
};

module.exports = {
    createDispute,
    getDisputesByUser,
    getAllDisputes,
    updateDisputeStatus,
    findOrderForUser,
    findActiveDisputeByOrder
};
