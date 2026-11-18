import { useEffect, useState } from "react";
import api from "../services/api";
import SellerSidebar from "../components/SellerSidebar";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const handleStatusChange = async (
        orderId,
        newStatus
    ) => {
        try {
            setMessage("");

            const response = await api.put(
                `/orders/seller-orders/${orderId}/status`,
                {
                    status: newStatus
                }
            );

            setMessage(
                response.data.message ||
                "Order status updated successfully"
            );

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: newStatus
                        }
                        : order
                )
            );

        } catch (error) {
            console.error(
                "Failed to update order status:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to update order status"
            );
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchSellerOrders = async () => {
            try {
                const response = await api.get(
                    "/orders/seller-orders"
                );

                if (!cancelled) {
                    setOrders(
                        response.data.orders || []
                    );
                }

            } catch (error) {
                console.error(
                    "Failed to load seller orders:",
                    error
                );

                if (!cancelled) {
                    setMessage(
                        error.response?.data?.message ||
                        "Failed to load orders"
                    );
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchSellerOrders();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="seller-dashboard">

            <SellerSidebar />

            <main className="seller-dashboard-content">

                <h1>Seller Orders</h1>

                {message && (
                    <p>{message}</p>
                )}

                {loading && (
                    <p>Loading orders...</p>
                )}

                {!loading &&
                    orders.length === 0 && (
                        <p>
                            You have no orders yet.
                        </p>
                    )}

                {!loading &&
                    orders.length > 0 && (
                        <div className="orders-list">

                            {orders.map((order) => (
                                <div
                                    className="order-card"
                                    key={order.id}
                                >

                                    <h2>
                                        Order #{order.id}
                                    </h2>

                                    {order.product_image && (
                                        <img
                                            src={
                                                order.product_image
                                            }
                                            alt={
                                                order.product_name
                                            }
                                            width="150"
                                        />
                                    )}

                                    <h3>
                                        {order.product_name}
                                    </h3>

                                    <p>
                                        Quantity:{" "}
                                        {order.quantity}
                                    </p>

                                    <p>
                                        Total: ₹
                                        {Number(
                                            order.total_price
                                        ).toFixed(2)}
                                    </p>

                                    <p>
                                        Order Status:{" "}
                                        <strong>
                                            {order.status}
                                        </strong>
                                    </p>

                                    <label>
                                        Update Status:
                                    </label>

                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            handleStatusChange(
                                                order.id,
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            order.status ===
                                            "DELIVERED"
                                        }
                                    >
                                        <option value="PLACED">
                                            Placed
                                        </option>

                                        <option value="SHIPPED">
                                            Shipped
                                        </option>

                                        <option value="DELIVERED">
                                            Delivered
                                        </option>
                                    </select>

                                    <p>
                                        Payment Status:{" "}
                                        <strong>
                                            {order.payment_status ||
                                                "PENDING"}
                                        </strong>
                                    </p>

                                    <p>
                                        Order Date:{" "}
                                        {new Date(
                                            order.created_at
                                        ).toLocaleString()}
                                    </p>

                                </div>
                            ))}

                        </div>
                    )}

            </main>

        </div>
    );
}

export default Orders;