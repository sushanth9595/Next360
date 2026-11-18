import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

function Sellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [blockingSellerId, setBlockingSellerId] = useState(null);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/sellers"
            );

            setSellers(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.sellers || []
            );

        } catch (error) {
            console.error(
                "Get sellers error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load sellers."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    const loadSellers = async () => {
        try {
            const response = await api.get(
                "/admin/sellers"
            );

            setSellers(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.sellers || []
            );

        } catch (error) {
            console.error(
                "Get sellers error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load sellers."
            );

        } finally {
            setLoading(false);
        }
    };

    loadSellers();
}, []);

    const updateSellerApproval = async (
        sellerId,
        status
    ) => {
        try {
            await api.put(
                "/admin/seller/approval",
                {
                    sellerId,
                    status
                }
            );

            alert(
                `Seller ${status.toLowerCase()} successfully.`
            );

            setSelectedSeller(null);

            fetchSellers();

        } catch (error) {
            console.error(
                "Seller approval error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update seller status."
            );
        }
    };

    const blockSeller = async (sellerId) => {
        const confirmed = window.confirm(
            `Are you sure you want to block Seller #${sellerId}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setBlockingSellerId(sellerId);

            await api.put(
                `/admin/seller/${sellerId}/block`
            );

            alert(
                "Seller blocked successfully."
            );

            fetchSellers();

        } catch (error) {
            console.error(
                "Block seller error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to block seller."
            );

        } finally {
            setBlockingSellerId(null);
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
                            <h2>Sellers</h2>

                            <p>
                                Review seller accounts,
                                KYC details and status.
                            </p>
                        </div>

                        <button
                            onClick={fetchSellers}
                            className="refresh-button"
                        >
                            Refresh
                        </button>

                    </div>

                    {loading && (
                        <p>Loading sellers...</p>
                    )}

                    {error && (
                        <p className="admin-error">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        sellers.length === 0 && (
                            <div className="empty-state">
                                No sellers found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        sellers.length > 0 && (

                            <div className="admin-table-container">

                                <table className="admin-table">

                                    <thead>

                                        <tr>
                                            <th>Seller ID</th>
                                            <th>Business Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>KYC</th>
                                            <th>Action</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {sellers.map(
                                            (seller) => {

                                                const status =
                                                    String(
                                                        seller.status ||
                                                        ""
                                                    ).toUpperCase();

                                                const isBlocked =
                                                    status ===
                                                    "BLOCKED";

                                                return (
                                                    <tr
                                                        key={
                                                            seller.id
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                seller.id
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                seller.business_name ||
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                seller.phone ||
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                seller.email ||
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={`status-badge ${status.toLowerCase()}`}
                                                            >
                                                                {
                                                                    status ||
                                                                    "UNKNOWN"
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <button
                                                                className="view-button"
                                                                onClick={() =>
                                                                    setSelectedSeller(
                                                                        seller
                                                                    )
                                                                }
                                                            >
                                                                View KYC
                                                            </button>

                                                        </td>

                                                        <td>

                                                            <div className="action-buttons">

                                                                {status ===
                                                                    "PENDING" && (
                                                                    <>
                                                                        <button
                                                                            className="approve-button"
                                                                            onClick={() =>
                                                                                updateSellerApproval(
                                                                                    seller.id,
                                                                                    "APPROVED"
                                                                                )
                                                                            }
                                                                        >
                                                                            Approve
                                                                        </button>

                                                                        <button
                                                                            className="reject-button"
                                                                            onClick={() =>
                                                                                updateSellerApproval(
                                                                                    seller.id,
                                                                                    "REJECTED"
                                                                                )
                                                                            }
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {!isBlocked &&
                                                                    status !==
                                                                        "REJECTED" && (
                                                                        <button
                                                                            className="reject-button"
                                                                            onClick={() =>
                                                                                blockSeller(
                                                                                    seller.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                blockingSellerId ===
                                                                                seller.id
                                                                            }
                                                                        >
                                                                            {blockingSellerId ===
                                                                            seller.id
                                                                                ? "Blocking..."
                                                                                : "Block"}
                                                                        </button>
                                                                    )}

                                                                {isBlocked && (
                                                                    <span>
                                                                        Blocked
                                                                    </span>
                                                                )}

                                                            </div>

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

            {selectedSeller && (

                <div className="kyc-overlay">

                    <div className="kyc-modal">

                        <div className="kyc-modal-header">

                            <div>
                                <h3>
                                    Seller KYC Details
                                </h3>

                                <p>
                                    Seller #
                                    {
                                        selectedSeller.id
                                    }
                                </p>
                            </div>

                            <button
                                className="kyc-close-button"
                                onClick={() =>
                                    setSelectedSeller(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="kyc-details">

                            <div className="kyc-detail-item">
                                <strong>
                                    Business Name
                                </strong>

                                <span>
                                    {
                                        selectedSeller.business_name ||
                                        "-"
                                    }
                                </span>
                            </div>

                            <div className="kyc-detail-item">
                                <strong>
                                    Status
                                </strong>

                                <span>
                                    {
                                        selectedSeller.status ||
                                        "-"
                                    }
                                </span>
                            </div>

                            <div className="kyc-detail-item">
                                <strong>
                                    Phone
                                </strong>

                                <span>
                                    {
                                        selectedSeller.phone ||
                                        "-"
                                    }
                                </span>
                            </div>

                            <div className="kyc-detail-item">
                                <strong>
                                    Email
                                </strong>

                                <span>
                                    {
                                        selectedSeller.email ||
                                        "-"
                                    }
                                </span>
                            </div>

                            <div className="kyc-detail-item kyc-full-width">
                                <strong>
                                    KYC Details
                                </strong>

                                <pre>
                                    {
                                        selectedSeller.kyc_details ||
                                        "No KYC details available."
                                    }
                                </pre>
                            </div>

                        </div>

                        {String(
                            selectedSeller.status
                        ).toUpperCase() ===
                            "PENDING" && (

                            <div className="kyc-modal-actions">

                                <button
                                    className="approve-button"
                                    onClick={() =>
                                        updateSellerApproval(
                                            selectedSeller.id,
                                            "APPROVED"
                                        )
                                    }
                                >
                                    Approve Seller
                                </button>

                                <button
                                    className="reject-button"
                                    onClick={() =>
                                        updateSellerApproval(
                                            selectedSeller.id,
                                            "REJECTED"
                                        )
                                    }
                                >
                                    Reject Seller
                                </button>

                            </div>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default Sellers;