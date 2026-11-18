import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get(
                    "/admin/dashboard/stats"
                );

                setStats(response.data);

            } catch (error) {
                console.error(
                    "Dashboard stats error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard statistics."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <AdminHeader />

                <main className="admin-content">

                    <div className="page-title-row">
    <div>
        <h2>Dashboard</h2>
        <p>Monitor sellers, products and marketplace activity.</p>
    </div>

    <button
        onClick={() => window.location.reload()}
        className="refresh-button"
    >
        Refresh
    </button>
</div>

                    {loading && (
                        <p>Loading dashboard...</p>
                    )}

                    {error && (
                        <p className="admin-error">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        stats && (

                            <div className="stats-grid">

                                <div className="stat-card">
                                    <h3>
                                        Total Sellers
                                    </h3>

                                    <p>
                                        {
                                            stats.sellers
                                                ?.total_sellers ??
                                            0
                                        }
                                    </p>
                                </div>

                                <div className="stat-card">
                                    <h3>
                                        Pending Sellers
                                    </h3>

                                    <p>
                                        {
                                            stats.sellers
                                                ?.pending_sellers ??
                                            0
                                        }
                                    </p>
                                </div>

                                <div className="stat-card">
                                    <h3>
                                        Approved Sellers
                                    </h3>

                                    <p>
                                        {
                                            stats.sellers
                                                ?.approved_sellers ??
                                            0
                                        }
                                    </p>
                                </div>

                                <div className="stat-card">
                                    <h3>
                                        Rejected Sellers
                                    </h3>

                                    <p>
                                        {
                                            stats.sellers
                                                ?.rejected_sellers ??
                                            0
                                        }
                                    </p>
                                </div>

                                <div className="stat-card">
                                    <h3>
                                        Blocked Sellers
                                    </h3>

                                    <p>
                                        {
                                            stats.sellers
                                                ?.blocked_sellers ??
                                            0
                                        }
                                    </p>
                                </div>

                                <div className="stat-card">
                                    <h3>
                                        Total Products
                                    </h3>

                                    <p>
                                        {
                                            stats.products
                                                ?.total_products ??
                                            0
                                        }
                                    </p>
                                </div>

                                <div className="stat-card">
                                    <h3>
                                        Pending Products
                                    </h3>

                                    <p>
                                        {
                                            stats.products
                                                ?.pending_products ??
                                            0
                                        }
                                    </p>
                                </div>

                                <div className="stat-card">
                                    <h3>
                                        Approved Products
                                    </h3>

                                    <p>
                                        {
                                            stats.products
                                                ?.approved_products ??
                                            0
                                        }
                                    </p>
                                </div>
                                <div className="stat-card">
    <h3>
        Rejected Products
    </h3>

    <p>
        {
            stats.products
                ?.rejected_products ??
            0
        }
    </p>
</div>

<div className="stat-card">
    <h3>
        Removed Products
    </h3>

    <p>
        {
            stats.products
                ?.removed_products ??
            0
        }
    </p>
</div>

                            </div>
                        )}

                </main>

            </div>

        </div>
    );
}

export default Dashboard;