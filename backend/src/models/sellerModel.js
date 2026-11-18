const pool = require("../../db");

const createSeller = async (
    userId,
    businessName,
    kycDetails
) => {
    const result = await pool.query(
        `INSERT INTO sellers
        (user_id, business_name, kyc_details)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [
            userId,
            businessName,
            kycDetails
        ]
    );

    return result.rows[0];
};

const getSellerStats = async () => {
    const result = await pool.query(`
        SELECT
            COUNT(*) AS total_sellers,
            COUNT(*) FILTER (
                WHERE status = 'PENDING'
            ) AS pending_sellers,
            COUNT(*) FILTER (
                WHERE status = 'APPROVED'
            ) AS approved_sellers,
            COUNT(*) FILTER (
                WHERE status = 'REJECTED'
            ) AS rejected_sellers,
            COUNT(*) FILTER (
                WHERE status = 'BLOCKED'
            ) AS blocked_sellers
        FROM sellers
    `);

    return result.rows[0];
};

const findSellerByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT *
         FROM sellers
         WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

const updateKycDetails = async (
    userId,
    kycDetails
) => {
    const result = await pool.query(
        `UPDATE sellers
         SET kyc_details = $1
         WHERE user_id = $2
         RETURNING *`,
        [
            kycDetails,
            userId
        ]
    );

    return result.rows[0];
};

const updateSellerStatus = async (
    sellerId,
    status
) => {
    const result = await pool.query(
        `UPDATE sellers
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [
            status,
            sellerId
        ]
    );

    return result.rows[0];
};

const blockSeller = async (sellerId) => {
    const result = await pool.query(
        `UPDATE sellers
         SET status = 'BLOCKED'
         WHERE id = $1
         RETURNING *`,
        [sellerId]
    );

    if (result.rows.length === 0) {
        throw new Error("SELLER_NOT_FOUND");
    }

    return result.rows[0];
};

const findSellerById = async (sellerId) => {
    const result = await pool.query(
        `SELECT *
         FROM sellers
         WHERE id = $1`,
        [sellerId]
    );

    return result.rows[0];
};

const findPendingSellers = async () => {
    const result = await pool.query(
        `SELECT
            s.id,
            s.user_id,
            s.business_name,
            s.status,
            s.kyc_details,
            s.created_at,
            u.phone,
            u.email
         FROM sellers s
         JOIN users u
         ON s.user_id = u.id
         WHERE s.status = 'PENDING'
         ORDER BY s.created_at DESC`
    );

    return result.rows;
};

const findAllSellers = async () => {
    const result = await pool.query(
        `SELECT
            s.id,
            s.user_id,
            s.business_name,
            s.status,
            s.kyc_details,
            s.created_at,
            u.phone,
            u.email
         FROM sellers s
         JOIN users u
         ON s.user_id = u.id
         ORDER BY s.created_at DESC`
    );

    return result.rows;
};

module.exports = {
    createSeller,
    findSellerByUserId,
    updateKycDetails,
    updateSellerStatus,
    blockSeller,
    findSellerById,
    findPendingSellers,
    findAllSellers,
    getSellerStats
};