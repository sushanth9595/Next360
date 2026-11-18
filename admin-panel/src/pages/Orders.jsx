import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/orders"
            );

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.orders || []
            );

        } catch (error) {
            console.error(
                "Get admin orders error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load orders."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await api.get(
                    "/admin/orders"
                );

                setOrders(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.orders || []
                );

            } catch (error) {
                console.error(
                    "Get admin orders error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load orders."
                );

            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const cancelOrder = async (orderId) => {
        const confirmed = window.confirm(
            `Are you sure you want to cancel Order #${orderId}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingOrderId(orderId);

            await api.put(
                `/admin/orders/${orderId}/cancel`
            );

            alert(
                "Order cancelled successfully."
            );

            fetchOrders();

        } catch (error) {
            console.error(
                "Cancel order error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to cancel order."
            );

        } finally {
            setCancellingOrderId(null);
        }
    };

    const updateOrderStatus = async (
        orderId,
        status
    ) => {
        try {
            setUpdatingOrderId(orderId);

            await api.put(
                `/admin/orders/${orderId}/status`,
                {
                    status
                }
            );

            alert(
                `Order status changed to ${status}.`
            );

            fetchOrders();

        } catch (error) {
            console.error(
                "Update order status error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update order status."
            );

        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <AdminHeader />

                <main className="admin-content">

                    <div className="page-title-row">

                        <div>
                            <h2>Orders</h2>

                            <p>
                                Monitor and manage all
                                orders placed on Next360.
                            </p>
                        </div>

                        <button
                            onClick={fetchOrders}
                            className="refresh-button"
                        >
                            Refresh
                        </button>

                    </div>

                    {loading && (
                        <p>Loading orders...</p>
                    )}

                    {error && (
                        <p className="admin-error">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        orders.length === 0 && (
                            <div className="empty-state">
                                No orders found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        orders.length > 0 && (

                            <div className="admin-table-container">

                                <table className="admin-table">

                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Buyer</th>
                                            <th>Product</th>
                                            <th>Seller</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {orders.map(
                                            (order) => {

                                                const status =
                                                    String(
                                                        order.status ||
                                                        ""
                                                    ).toUpperCase();

                                                const canCancel =
                                                    status !==
                                                        "DELIVERED" &&
                                                    status !==
                                                        "CANCELLED";

                                                const canUpdateStatus =
                                                    status !==
                                                        "CANCELLED";

                                                return (
                                                    <tr
                                                        key={
                                                            order.id
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                order.id
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                order.buyer_phone ??
                                                                order.user_id ??
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                order.product_name ??
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                order.seller_id ??
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                order.quantity ??
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            ₹
                                                            {
                                                                order.total_price ??
                                                                "0"
                                                            }
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`status-badge ${
                                                                    String(
                                                                        order.payment_status ||
                                                                        "PENDING"
                                                                    ).toLowerCase()
                                                                }`}
                                                            >
                                                                {
                                                                    order.payment_status ??
                                                                    "PENDING"
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>

                                                            {canUpdateStatus ? (

                                                                <select
                                                                    value={
                                                                        status
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateOrderStatus(
                                                                            order.id,
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        updatingOrderId ===
                                                                        order.id
                                                                    }
                                                                    className="status-select"
                                                                >

                                                                    <option value="PLACED">
                                                                        PLACED
                                                                    </option>

                                                                    <option value="SHIPPED">
                                                                        SHIPPED
                                                                    </option>

                                                                    <option value="DELIVERED">
                                                                        DELIVERED
                                                                    </option>

                                                                    <option value="CANCELLED">
                                                                        CANCELLED
                                                                    </option>

                                                                </select>

                                                            ) : (

                                                                <span
                                                                    className="status-badge cancelled"
                                                                >
                                                                    CANCELLED
                                                                </span>

                                                            )}

                                                        </td>

                                                        <td>
                                                            {
                                                                order.created_at
                                                                    ? new Date(
                                                                        order.created_at
                                                                    ).toLocaleDateString()
                                                                    : "-"
                                                            }
                                                        </td>

                                                        <td>

                                                            {canCancel ? (

                                                                <button
                                                                    className="reject-button"
                                                                    onClick={() =>
                                                                        cancelOrder(
                                                                            order.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        cancellingOrderId ===
                                                                        order.id
                                                                    }
                                                                >
                                                                    {cancellingOrderId ===
                                                                    order.id
                                                                        ? "Cancelling..."
                                                                        : "Cancel"}
                                                                </button>

                                                            ) : (

                                                                <span>
                                                                    —
                                                                </span>

                                                            )}

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                </main>

            </div>

        </div>
    );
}

export default Orders;