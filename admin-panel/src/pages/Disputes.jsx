import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

function Disputes() {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedDispute, setSelectedDispute] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [updatingDisputeId, setUpdatingDisputeId] = useState(null);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/disputes");

            setDisputes(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.disputes || []
            );
        } catch (error) {
            console.error("Get disputes error:", error);

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
            try {
                const response = await api.get("/admin/disputes");

                setDisputes(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.disputes || []
                );
            } catch (error) {
                console.error("Get disputes error:", error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load disputes."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDisputes();
    }, []);

    const openDispute = (dispute) => {
        setSelectedDispute(dispute);
        setAdminNote(dispute.admin_note || "");
        setError("");
    };

    const closeDispute = () => {
        setSelectedDispute(null);
        setAdminNote("");
    };

    const updateDisputeStatus = async (status) => {
        if (!selectedDispute) {
            return;
        }

        try {
            setUpdatingDisputeId(selectedDispute.id);
            setError("");

            await api.put(
                `/admin/disputes/${selectedDispute.id}/status`,
                {
                    status,
                    adminNote
                }
            );

            alert(
                `Dispute #${selectedDispute.id} marked as ${status}.`
            );

            closeDispute();
            fetchDisputes();
        } catch (error) {
            console.error(
                "Update dispute status error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update dispute."
            );
        } finally {
            setUpdatingDisputeId(null);
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
                            <h2>Disputes</h2>

                            <p>
                                Review buyer disputes and manage
                                resolutions.
                            </p>
                        </div>

                        <button
                            onClick={fetchDisputes}
                            className="refresh-button"
                        >
                            Refresh
                        </button>
                    </div>

                    {loading && (
                        <p>Loading disputes...</p>
                    )}

                    {error && (
                        <p className="admin-error">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        disputes.length === 0 && (
                            <div className="empty-state">
                                No disputes found.
                            </div>
                        )}

                    {!loading &&
                        disputes.length > 0 && (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Dispute ID</th>
                                            <th>Order ID</th>
                                            <th>Buyer</th>
                                            <th>Product</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {disputes.map(
                                            (dispute) => (
                                                <tr
                                                    key={
                                                        dispute.id
                                                    }
                                                >
                                                    <td>
                                                        #
                                                        {
                                                            dispute.id
                                                        }
                                                    </td>

                                                    <td>
                                                        #
                                                        {
                                                            dispute.order_id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            dispute.buyer_phone ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            dispute.product_name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            dispute.reason ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`status-badge status-${String(
                                                                dispute.status ||
                                                                    ""
                                                            ).toLowerCase()}`}
                                                        >
                                                            {
                                                                dispute.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {dispute.created_at
                                                            ? new Date(
                                                                  dispute.created_at
                                                              ).toLocaleString()
                                                            : "-"}
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="approve-button"
                                                            onClick={() =>
                                                                openDispute(
                                                                    dispute
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    {selectedDispute && (
                        <div className="kyc-modal-overlay">
                            <div className="kyc-modal">
                                <div className="kyc-modal-header">
                                    <h3>
                                        Dispute #
                                        {
                                            selectedDispute.id
                                        }
                                    </h3>

                                    <button
                                        onClick={
                                            closeDispute
                                        }
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="kyc-modal-body">
                                    <p>
                                        <strong>
                                            Order ID:
                                        </strong>{" "}
                                        #
                                        {
                                            selectedDispute.order_id
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Buyer:
                                        </strong>{" "}
                                        {selectedDispute.buyer_phone ||
                                            "-"}
                                    </p>

                                    <p>
                                        <strong>
                                            Product:
                                        </strong>{" "}
                                        {selectedDispute.product_name ||
                                            "-"}
                                    </p>

                                    <p>
                                        <strong>
                                            Reason:
                                        </strong>{" "}
                                        {selectedDispute.reason ||
                                            "-"}
                                    </p>

                                    <p>
                                        <strong>
                                            Description:
                                        </strong>{" "}
                                        {selectedDispute.description ||
                                            "No description provided."}
                                    </p>

                                    <p>
                                        <strong>
                                            Current Status:
                                        </strong>{" "}
                                        {
                                            selectedDispute.status
                                        }
                                    </p>

                                    <label>
                                        Admin Note
                                    </label>

                                    <textarea
                                        value={adminNote}
                                        onChange={(event) =>
                                            setAdminNote(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter your decision or note..."
                                        rows="4"
                                        style={{
                                            width: "100%",
                                            marginTop: "8px",
                                            padding: "10px"
                                        }}
                                    />

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            marginTop: "15px"
                                        }}
                                    >
                                        <button
                                            className="approve-button"
                                            onClick={() =>
                                                updateDisputeStatus(
                                                    "RESOLVED"
                                                )
                                            }
                                            disabled={
                                                updatingDisputeId ===
                                                selectedDispute.id
                                            }
                                        >
                                            Resolve
                                        </button>

                                        <button
                                            className="reject-button"
                                            onClick={() =>
                                                updateDisputeStatus(
                                                    "REJECTED"
                                                )
                                            }
                                            disabled={
                                                updatingDisputeId ===
                                                selectedDispute.id
                                            }
                                        >
                                            Reject
                                        </button>

                                        <button
                                            onClick={
                                                closeDispute
                                            }
                                            disabled={
                                                updatingDisputeId ===
                                                selectedDispute.id
                                            }
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Disputes;