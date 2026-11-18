import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import api from "./services/api";

function Disputes({
    cartItems,
    isLoggedIn,
    setIsLoggedIn
}) {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem(
                "next360-token"
            );

            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.get(
                "/orders/my-disputes",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDisputes(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.disputes || []
            );
        } catch (error) {
            console.error(
                "Failed to fetch disputes:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load disputes."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    const loadDisputes = async () => {
        await fetchDisputes();
    };

    loadDisputes();
}, []);

    return (
        <>
            <Header
                cartItems={cartItems}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main className="orders-page">
                <h1>My Disputes</h1>

                {loading && (
                    <p>Loading disputes...</p>
                )}

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                {!loading &&
                    !error &&
                    disputes.length === 0 && (
                        <div>
                            <p>
                                You have no disputes.
                            </p>

                            <Link to="/orders">
                                ← Back to My Orders
                            </Link>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    disputes.length > 0 && (
                        <div>
                            {disputes.map((dispute) => (
                                <div
                                    className="order-card"
                                    key={dispute.id}
                                >
                                    <h3>
                                        Dispute #
                                        {dispute.id}
                                    </h3>

                                    <p>
                                        <strong>
                                            Order:
                                        </strong>{" "}
                                        #
                                        {dispute.order_id}
                                    </p>

                                    <p>
                                        <strong>
                                            Product:
                                        </strong>{" "}
                                        {dispute.product_name ||
                                            "Product"}
                                    </p>

                                    <p>
                                        <strong>
                                            Reason:
                                        </strong>{" "}
                                        {dispute.reason}
                                    </p>

                                    <p>
                                        <strong>
                                            Description:
                                        </strong>{" "}
                                        {dispute.description ||
                                            "No description provided."}
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        <span>
                                            {dispute.status}
                                        </span>
                                    </p>

                                    {dispute.admin_note && (
                                        <p>
                                            <strong>
                                                Admin Note:
                                            </strong>{" "}
                                            {
                                                dispute.admin_note
                                            }
                                        </p>
                                    )}

                                    <p>
                                        <strong>
                                            Date:
                                        </strong>{" "}
                                        {dispute.created_at
                                            ? new Date(
                                                  dispute.created_at
                                              ).toLocaleString()
                                            : "-"}
                                    </p>
                                </div>
                            ))}

                            <Link to="/orders">
                                ← Back to My Orders
                            </Link>
                        </div>
                    )}
            </main>
        </>
    );
}

export default Disputes;