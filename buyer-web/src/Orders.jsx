import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import api from "./services/api";

function Orders({
    cartItems,
    isLoggedIn,
    setIsLoggedIn
}) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dispute states
    const [disputeOrderId, setDisputeOrderId] = useState(null);
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeDescription, setDisputeDescription] = useState("");
    const [disputeLoading, setDisputeLoading] = useState(false);
    const [disputeMessage, setDisputeMessage] = useState("");
    const [disputeError, setDisputeError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("next360-token");

                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await api.get(
                    "/orders/my-orders",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setOrders(response.data.orders || []);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Open dispute form
    const openDisputeForm = (orderId) => {
        setDisputeOrderId(orderId);
        setDisputeReason("");
        setDisputeDescription("");
        setDisputeMessage("");
        setDisputeError("");
    };

    // Close dispute form
    const closeDisputeForm = () => {
        setDisputeOrderId(null);
        setDisputeReason("");
        setDisputeDescription("");
        setDisputeMessage("");
        setDisputeError("");
    };

    // Submit dispute
    const submitDispute = async (orderId) => {
        if (!disputeReason) {
            setDisputeError("Please select a dispute reason.");
            return;
        }

        try {
            setDisputeLoading(true);
            setDisputeError("");
            setDisputeMessage("");

            const token = localStorage.getItem("next360-token");

            await api.post(
                "/orders/disputes",
                {
                    orderId: orderId,
                    reason: disputeReason,
                    description: disputeDescription
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDisputeMessage(
                "Dispute submitted successfully."
            );

            setDisputeReason("");
            setDisputeDescription("");

        } catch (error) {
            console.error("Submit dispute error:", error);

            setDisputeError(
                error.response?.data?.message ||
                "Failed to submit dispute."
            );
        } finally {
            setDisputeLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header
                    cartItems={cartItems}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />

                <main className="orders-page">
                    <h1>My Orders</h1>
                    <p>Loading orders...</p>
                </main>
            </>
        );
    }

    return (
        <>
            <Header
                cartItems={cartItems}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main className="orders-page">
                <h1>My Orders</h1>

                {orders.length === 0 ? (
                    <>
                        <p>You have no orders yet.</p>

                        <Link to="/">
                            ← Continue Shopping
                        </Link>
                    </>
                ) : (
                    orders.map((order) => (
                        <div
                            className="order-card"
                            key={order.id}
                        >
                            <h3>Order #{order.id}</h3>

                            {order.product_image && (
                                <img
                                    src={order.product_image}
                                    alt={order.product_name}
                                    className="order-product-image"
                                />
                            )}

                            <h4>
                                {order.product_name || "Product"}
                            </h4>

                            <p>
                                Quantity: {order.quantity}
                            </p>

                            <p>
                                Total: ₹
                                {Number(order.total_price).toFixed(2)}
                            </p>

                            <p>
                                Status:{" "}
                                <strong>{order.status}</strong>
                            </p>

                            <p>
                                Payment:{" "}
                                <span
                                    className={
                                        order.payment_status === "PAID"
                                            ? "payment-paid"
                                            : order.payment_status === "FAILED"
                                            ? "payment-failed"
                                            : "payment-pending"
                                    }
                                >
                                    {order.payment_status || "PENDING"}
                                </span>
                            </p>

                            <p>
                                Date:{" "}
                                {new Date(
                                    order.created_at
                                ).toLocaleString()}
                            </p>

                            {/* Raise Dispute Button */}
{disputeOrderId !== order.id && (
  <button
    type="button"
    className="raise-dispute-btn"
    onClick={() => openDisputeForm(order.id)}
  >
    Raise Dispute
  </button>
)}

{/* Dispute Form */}
{disputeOrderId === order.id && (
  <div className="dispute-form">
    <h4>Raise a Dispute</h4>

    <div className="dispute-field">
      <label htmlFor={`reason-${order.id}`}>Reason</label>

      <select
        id={`reason-${order.id}`}
        value={disputeReason}
        onChange={(event) => setDisputeReason(event.target.value)}
      >
        <option value="">Select a reason</option>
        <option value="Product not received">
          Product not received
        </option>
        <option value="Product damaged">
          Product damaged
        </option>
        <option value="Wrong product">
          Wrong product
        </option>
        <option value="Product quality issue">
          Product quality issue
        </option>
        <option value="Payment issue">
          Payment issue
        </option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div className="dispute-field">
      <label htmlFor={`description-${order.id}`}>
        Description
      </label>

      <textarea
        id={`description-${order.id}`}
        value={disputeDescription}
        onChange={(event) =>
          setDisputeDescription(event.target.value)
        }
        placeholder="Describe your issue..."
        rows="4"
      />
    </div>

    {disputeError && (
      <p className="dispute-error">
        {disputeError}
      </p>
    )}

    {disputeMessage && (
      <p className="dispute-success">
        {disputeMessage}
      </p>
    )}

    <div className="dispute-actions">
      <button
        type="button"
        className="submit-dispute-btn"
        onClick={() => submitDispute(order.id)}
        disabled={disputeLoading}
      >
        {disputeLoading ? "Submitting..." : "Submit Dispute"}
      </button>

      <button
        type="button"
        className="close-dispute-btn"
        onClick={closeDisputeForm}
        disabled={disputeLoading}
      >
        Close
      </button>
    </div>
  </div>
)}

                        </div>
                    ))
                )}
            </main>
        </>
    );
}

export default Orders;