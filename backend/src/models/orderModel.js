const pool = require("../../db");

const createOrder = async (
    userId,
    productId,
    quantity,
    totalPrice
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Check product stock and lock the product row
        const productResult = await client.query(
            `SELECT id, name, price, stock
             FROM products
             WHERE id = $1
             FOR UPDATE`,
            [productId]
        );

        if (productResult.rows.length === 0) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        const product = productResult.rows[0];

        // Prevent ordering more than available stock
        if (product.stock < quantity) {
            throw new Error("INSUFFICIENT_STOCK");
        }

        // Reduce product stock
        const updatedProduct = await client.query(
            `UPDATE products
             SET stock = stock - $1
             WHERE id = $2
             RETURNING id, stock`,
            [quantity, productId]
        );

        // Create the order
        const orderResult = await client.query(
            `INSERT INTO orders
            (user_id, product_id, quantity, total_price, status)
            VALUES ($1, $2, $3, $4, 'PLACED')
            RETURNING *`,
            [userId, productId, quantity, totalPrice]
        );

        await client.query("COMMIT");

        return {
            order: orderResult.rows[0],
            remainingStock: updatedProduct.rows[0].stock,
            paymentStatus: orderResult.rows[0].payment_status
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getOrdersByUser = async (userId) => {
    const result = await pool.query(
        `SELECT
            orders.*,
            products.name AS product_name,
            products.image_url AS product_image
         FROM orders
         JOIN products
            ON orders.product_id = products.id
         WHERE orders.user_id = $1
         ORDER BY orders.created_at DESC`,
        [userId]
    );

    return result.rows;
};

const getOrdersBySeller = async (sellerId) => {
    const result = await pool.query(
        `SELECT
            orders.*,
            products.name AS product_name,
            products.image_url AS product_image,
            products.seller_id
         FROM orders
         JOIN products
            ON orders.product_id = products.id
         WHERE products.seller_id = $1
         ORDER BY orders.created_at DESC`,
        [sellerId]
    );

    return result.rows;
};

const updateOrderStatus = async (
    orderId,
    sellerId,
    status
) => {
    const result = await pool.query(
        `UPDATE orders
         SET status = $1
         FROM products
         WHERE orders.id = $2
         AND orders.product_id = products.id
         AND products.seller_id = $3
         AND (
             (orders.status = 'PLACED' AND $1 = 'SHIPPED')
             OR
             (orders.status = 'SHIPPED' AND $1 = 'DELIVERED')
         )
         RETURNING orders.*`,
        [
            status,
            orderId,
            sellerId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "INVALID_ORDER_STATUS_TRANSITION"
        );
    }

    return result.rows[0];
};

const updatePaymentStatus = async (
    orderId,
    paymentStatus,
    paymentId,
    paymentMethod
) => {
    const result = await pool.query(
        `UPDATE orders
         SET payment_status = $1,
             payment_id = $2,
             payment_method = $3
         WHERE id = $4
         RETURNING *`,
        [
            paymentStatus,
            paymentId,
            paymentMethod,
            orderId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error("ORDER_NOT_FOUND");
    }

    return result.rows[0];
};

const calculateSellerEarnings = async (orderId) => {
    const result = await pool.query(
        `SELECT
            orders.id AS order_id,
            orders.total_price,
            products.seller_id
         FROM orders
         JOIN products
            ON orders.product_id = products.id
         WHERE orders.id = $1`,
        [orderId]
    );

    if (result.rows.length === 0) {
        throw new Error("ORDER_NOT_FOUND");
    }

    const order = result.rows[0];

    const commissionRate = 0.10;

    const commission =
        Number(order.total_price) * commissionRate;

    const sellerEarnings =
        Number(order.total_price) - commission;

    return {
        orderId: order.order_id,
        sellerId: order.seller_id,
        orderValue: Number(order.total_price),
        commissionRate: 10,
        commission: Number(commission.toFixed(2)),
        sellerEarnings: Number(sellerEarnings.toFixed(2))
    };
};

const getAllOrders = async () => {
    const result = await pool.query(
        `SELECT
            orders.*,
            products.name AS product_name,
            products.image_url AS product_image,
            products.seller_id,
            users.phone AS buyer_phone
         FROM orders
         JOIN products
            ON orders.product_id = products.id
         JOIN users
            ON orders.user_id = users.id
         ORDER BY orders.created_at DESC`
    );

    return result.rows;
};

const cancelOrderByAdmin = async (orderId) => {
    const result = await pool.query(
        `UPDATE orders
         SET status = 'CANCELLED'
         WHERE id = $1
         AND status NOT IN ('DELIVERED', 'CANCELLED')
         RETURNING *`,
        [orderId]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "ORDER_NOT_FOUND_OR_CANNOT_CANCEL"
        );
    }

    return result.rows[0];
};

const updateOrderStatusByAdmin = async (
    orderId,
    status
) => {
    const currentOrderResult = await pool.query(
        `SELECT id, status
         FROM orders
         WHERE id = $1`,
        [orderId]
    );

    if (currentOrderResult.rows.length === 0) {
        throw new Error("ORDER_NOT_FOUND");
    }

    const currentStatus = currentOrderResult.rows[0].status;

    const allowedTransitions = {
        PLACED: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: []
    };

    if (
        !allowedTransitions[currentStatus] ||
        !allowedTransitions[currentStatus].includes(status)
    ) {
        throw new Error("INVALID_STATUS_TRANSITION");
    }

    const result = await pool.query(
        `UPDATE orders
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [
            status,
            orderId
        ]
    );

    return result.rows[0];
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getOrdersBySeller,
    updateOrderStatusByAdmin,
    cancelOrderByAdmin,
    updateOrderStatus,
    updatePaymentStatus,
    calculateSellerEarnings,
    getAllOrders
};