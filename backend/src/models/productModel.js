const pool = require("../../db");

const createProduct = async (
    sellerId,
    name,
    category,
    type,
    price,
    stock,
    description,
    imageUrl,
    certificateUrl,
    status
) => {
    const result = await pool.query(
        `INSERT INTO products
        (
            seller_id,
            name,
            category,
            type,
            price,
            stock,
            description,
            image_url,
            certificate_url,
            status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *`,
        [
            sellerId,
            name,
            category,
            type,
            price,
            stock,
            description,
            imageUrl,
            certificateUrl,
            status
        ]
    );

    return result.rows[0];
};

const findProductById = async (productId) => {
    const result = await pool.query(
        `SELECT
            p.*,
            s.business_name
         FROM products p
         JOIN sellers s
         ON p.seller_id = s.id
         WHERE p.id = $1`,
        [productId]
    );

    return result.rows[0];
};


const findVerifiedOrganicProducts = async () => {
    const result = await pool.query(
        `SELECT *
         FROM products
         WHERE type = 'ORGANIC'
         AND status = 'APPROVED'
         AND certificate_url IS NOT NULL
         ORDER BY created_at DESC`
    );

    return result.rows;
};

const updateProductStatus = async (productId, status) => {
    const result = await pool.query(
        `UPDATE products
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, productId]
    );

    return result.rows[0];
};

const findPendingProducts = async () => {
    const result = await pool.query(
        `SELECT
            p.*,
            s.business_name
         FROM products p
         JOIN sellers s
         ON p.seller_id = s.id
         WHERE p.status = 'PENDING'
         ORDER BY p.created_at DESC`
    );

    return result.rows;
};

const findAllProducts = async () => {
    const result = await pool.query(
        `SELECT
            p.*,
            s.business_name
         FROM products p
         JOIN sellers s
         ON p.seller_id = s.id
         WHERE
            p.type != 'ORGANIC'
            OR (
                p.type = 'ORGANIC'
                AND p.status = 'APPROVED'
                AND p.certificate_url IS NOT NULL
            )
         ORDER BY p.created_at DESC`
    );

    return result.rows;
};

const findProductsBySeller = async (sellerId) => {
    const result = await pool.query(
        `SELECT *
         FROM products
         WHERE seller_id = $1
         ORDER BY created_at DESC`,
        [sellerId]
    );

    return result.rows;
};

const updateCertificate = async (
    productId,
    sellerId,
    certificateUrl
) => {
    const result = await pool.query(
        `UPDATE products
         SET certificate_url = $1,
             status = 'PENDING'
         WHERE id = $2
         AND seller_id = $3
         AND type = 'ORGANIC'
         RETURNING *`,
        [certificateUrl, productId, sellerId]
    );

    return result.rows[0];
};

/* --------------------------------
   UPDATE SELLER PRODUCT
--------------------------------- */

const updateProduct = async (
    productId,
    sellerId,
    name,
    category,
    type,
    price,
    stock,
    description,
    imageUrl,
    certificateUrl,
    status
) => {
    const result = await pool.query(
        `UPDATE products
         SET
            name = $1,
            category = $2,
            type = $3,
            price = $4,
            stock = $5,
            description = $6,
            image_url = $7,
            certificate_url = $8,
            status = $9
         WHERE id = $10
         AND seller_id = $11
         RETURNING *`,
        [
            name,
            category,
            type,
            price,
            stock,
            description,
            imageUrl,
            certificateUrl,
            status,
            productId,
            sellerId
        ]
    );

    return result.rows[0];
};

const deleteProduct = async (productId, sellerId) => {
    const result = await pool.query(
        `DELETE FROM products
         WHERE id = $1
         AND seller_id = $2
         RETURNING *`,
        [productId, sellerId]
    );

    return result.rows[0];
};

const removeProductByAdmin = async (productId) => {
    const result = await pool.query(
        `UPDATE products
         SET status = 'REMOVED'
         WHERE id = $1
         RETURNING *`,
        [productId]
    );

    if (result.rows.length === 0) {
        throw new Error("PRODUCT_NOT_FOUND");
    }

    return result.rows[0];
};

const getProductStats = async () => {
    const result = await pool.query(`
        SELECT
            COUNT(*) AS total_products,

            COUNT(*) FILTER (
                WHERE status = 'PENDING'
            ) AS pending_products,

            COUNT(*) FILTER (
                WHERE status = 'APPROVED'
            ) AS approved_products,

            COUNT(*) FILTER (
                WHERE status = 'REJECTED'
            ) AS rejected_products,

            COUNT(*) FILTER (
                WHERE status = 'REMOVED'
            ) AS removed_products

        FROM products
    `);

    return result.rows[0];
};

module.exports = {
    createProduct,
    findProductById,
    findProductsBySeller,
    findAllProducts,
    updateCertificate,
    updateProduct,
    findVerifiedOrganicProducts,
    updateProductStatus,
    findPendingProducts,
    findAllProducts,
    getProductStats,
    deleteProduct,
    removeProductByAdmin
};