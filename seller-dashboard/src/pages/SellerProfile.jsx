import { useEffect, useState } from "react";
import api from "../services/api";
import SellerSidebar from "../components/SellerSidebar";

function SellerProfile() {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(
                    "/seller/profile"
                );

                setSeller(response.data.user);

            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error
                );

                setMessage(
                    error.response?.data?.message ||
                    "Failed to load seller profile"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const getKycStatus = () => {
        const status =
            seller?.kyc_status ||
            seller?.seller_status ||
            seller?.approval_status;

        if (!status) {
            return {
                label: "Not Available",
                className: "kyc-status unknown",
                description:
                    "KYC status is not currently provided by the seller profile API."
            };
        }

        const normalized =
            String(status).toUpperCase();

        if (
            normalized === "APPROVED" ||
            normalized === "VERIFIED"
        ) {
            return {
                label: "Approved",
                className: "kyc-status approved",
                description:
                    "Your seller account has been approved."
            };
        }

        if (
            normalized === "REJECTED"
        ) {
            return {
                label: "Rejected",
                className: "kyc-status rejected",
                description:
                    "Your seller account requires attention."
            };
        }

        if (
            normalized === "PENDING"
        ) {
            return {
                label: "Pending",
                className: "kyc-status pending",
                description:
                    "Your seller approval is currently pending."
            };
        }

        return {
            label: status,
            className: "kyc-status pending",
            description:
                "Seller approval status is available."
        };
    };

    if (loading) {
        return (
            <div className="seller-loading">
                <h2>
                    Loading Seller Profile...
                </h2>
            </div>
        );
    }

    const kycStatus = getKycStatus();

    return (
        <div className="seller-dashboard">

            <SellerSidebar />

            <main className="seller-dashboard-content">

                {/* Page Header */}

                <div className="page-header">

                    <div>
                        <p className="seller-dashboard-label">
                            Seller Portal
                        </p>

                        <h1>
                            Seller Profile & KYC
                        </h1>

                        <p className="page-subtitle">
                            View your seller account
                            information and approval status.
                        </p>
                    </div>

                </div>

                {message && (
                    <div className="profile-message">
                        {message}
                    </div>
                )}

                {seller && (
                    <>

                        {/* Account Information */}

                        <section className="profile-card">

                            <div className="profile-card-header">

                                <div className="profile-icon">
                                    👤
                                </div>

                                <div>
                                    <h2>
                                        Account Information
                                    </h2>

                                    <p>
                                        Your registered
                                        Next360 seller details.
                                    </p>
                                </div>

                            </div>

                            <div className="profile-details">

                                <div className="profile-detail">

                                    <span>
                                        User ID
                                    </span>

                                    <strong>
                                        {seller.id}
                                    </strong>

                                </div>

                                {seller.phone && (
                                    <div className="profile-detail">

                                        <span>
                                            Phone Number
                                        </span>

                                        <strong>
                                            {seller.phone}
                                        </strong>

                                    </div>
                                )}

                                {seller.email && (
                                    <div className="profile-detail">

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {seller.email}
                                        </strong>

                                    </div>
                                )}

                                {seller.role && (
                                    <div className="profile-detail">

                                        <span>
                                            Account Role
                                        </span>

                                        <strong>
                                            {seller.role}
                                        </strong>

                                    </div>
                                )}

                            </div>

                        </section>

                        {/* KYC Status */}

                        <section className="kyc-card">

                            <div className="kyc-card-header">

                                <div className="kyc-icon">
                                    🛡️
                                </div>

                                <div>
                                    <h2>
                                        Seller Verification
                                    </h2>

                                    <p>
                                        Your Next360 seller
                                        approval information.
                                    </p>
                                </div>

                            </div>

                            <div className="kyc-status-row">

                                <span>
                                    Seller Status
                                </span>

                                <strong
                                    className={
                                        kycStatus.className
                                    }
                                >
                                    {kycStatus.label}
                                </strong>

                            </div>

                            <p className="kyc-description">
                                {kycStatus.description}
                            </p>

                            <div className="kyc-info">

                                <strong>
                                    About Seller Verification
                                </strong>

                                <p>
                                    Next360 requires seller
                                    verification before
                                    restricted seller
                                    activities can be
                                    performed.
                                </p>

                            </div>

                        </section>

                    </>
                )}

            </main>

        </div>
    );
}

export default SellerProfile;