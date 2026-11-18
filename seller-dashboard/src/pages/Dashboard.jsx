import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SellerSidebar from "../components/SellerSidebar";

function Dashboard() {
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [totalSales, setTotalSales] = useState(0);
    const [totalCommission, setTotalCommission] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                setLoading(true);

                const [
                    profileResponse,
                    productsResponse,
                    ordersResponse
                ] = await Promise.all([
                    api.get("/seller/profile"),
                    api.get("/products/my-products"),
                    api.get("/orders/seller-orders")
                ]);

                if (cancelled) {
                    return;
                }

                const sellerData =
                    profileResponse.data.user;

                const productData =
                    productsResponse.data.products || [];

                const orderData =
                    ordersResponse.data.orders || [];

                setSeller(sellerData);
                setProducts(productData);
                setOrders(orderData);

                let sales = 0;
                let commission = 0;
                let earnings = 0;

                for (const order of orderData) {
                    try {
                        const earningsResponse =
                            await api.get(
                                `/payments/seller-earnings/${order.id}`
                            );

                        const data =
                            earningsResponse.data.earnings;

                        sales += Number(
                            data.orderValue || 0
                        );

                        commission += Number(
                            data.commission || 0
                        );

                        earnings += Number(
                            data.sellerEarnings || 0
                        );
                    } catch (error) {
                        console.error(
                            `Failed to calculate earnings for order ${order.id}:`,
                            error
                        );
                    }
                }

                if (!cancelled) {
                    setTotalSales(sales);
                    setTotalCommission(commission);
                    setTotalEarnings(earnings);
                }

            } catch (error) {
                console.error(
                    "Failed to load seller dashboard:",
                    error
                );

                if (!cancelled) {
                    navigate("/login");
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("next360-token");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="seller-loading">
                <h2>
                    Loading Seller Dashboard...
                </h2>
            </div>
        );
    }

    return (
        <div className="seller-dashboard">

            <SellerSidebar />

            <main className="seller-dashboard-content">

                {/* Dashboard Header */}

                <header className="seller-dashboard-header">

                    <div>
                        <p className="seller-dashboard-label">
                            Seller Portal
                        </p>

                        <h1>
                            Welcome to Next360
                        </h1>

                        <p className="seller-welcome">
                            Welcome,{" "}
                            <strong>
                                {seller?.phone ||
                                    seller?.email ||
                                    "Seller"}
                            </strong>
                        </p>
                    </div>

                    <button
                        className="dashboard-logout-button"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>

                </header>

                {/* Statistics */}

                <section className="dashboard-statistics">

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">
                            📦
                        </div>

                        <div>
                            <p>
                                Total Products
                            </p>

                            <h2>
                                {products.length}
                            </h2>
                        </div>

                    </div>

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">
                            🛒
                        </div>

                        <div>
                            <p>
                                Total Orders
                            </p>

                            <h2>
                                {orders.length}
                            </h2>
                        </div>

                    </div>

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">
                            💰
                        </div>

                        <div>
                            <p>
                                Total Sales
                            </p>

                            <h2>
                                ₹
                                {totalSales.toFixed(2)}
                            </h2>
                        </div>

                    </div>

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">
                            💵
                        </div>

                        <div>
                            <p>
                                Net Earnings
                            </p>

                            <h2>
                                ₹
                                {totalEarnings.toFixed(2)}
                            </h2>
                        </div>

                    </div>

                </section>

                {/* Earnings Summary */}

                <section className="dashboard-earnings-summary">

                    <div className="dashboard-section-header">
                        <div>
                            <h2>
                                Earnings Summary
                            </h2>

                            <p>
                                Overview of your seller
                                earnings.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/earnings")
                            }
                        >
                            View Earnings →
                        </button>
                    </div>

                    <div className="dashboard-earnings-grid">

                        <div>
                            <span>
                                Total Sales
                            </span>

                            <strong>
                                ₹
                                {totalSales.toFixed(2)}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Commission
                            </span>

                            <strong>
                                ₹
                                {totalCommission.toFixed(2)}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Net Earnings
                            </span>

                            <strong>
                                ₹
                                {totalEarnings.toFixed(2)}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* Quick Actions */}

                <section className="dashboard-home">

                    <h2>
                        Quick Actions
                    </h2>

                    <p className="dashboard-subtitle">
                        Manage your Next360 seller
                        account.
                    </p>

                    <div className="dashboard-cards">

                        {/* Products */}

                        <div className="dashboard-card">

                            <div className="dashboard-card-icon">
                                📦
                            </div>

                            <h3>
                                Products
                            </h3>

                            <p>
                                Add, edit and manage your
                                products and inventory.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/products")
                                }
                            >
                                View Products →
                            </button>

                        </div>

                        {/* Orders */}

                        <div className="dashboard-card">

                            <div className="dashboard-card-icon">
                                🛒
                            </div>

                            <h3>
                                Orders
                            </h3>

                            <p>
                                View customer orders and
                                update delivery status.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/orders")
                                }
                            >
                                View Orders →
                            </button>

                        </div>

                        {/* Earnings */}

                        <div className="dashboard-card">

                            <div className="dashboard-card-icon">
                                💰
                            </div>

                            <h3>
                                Earnings
                            </h3>

                            <p>
                                View your sales, commission
                                and net earnings.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/earnings")
                                }
                            >
                                View Earnings →
                            </button>

                        </div>

                        {/* Profile */}

                        <div className="dashboard-card">

                            <div className="dashboard-card-icon">
                                👤
                            </div>

                            <h3>
                                Profile & KYC
                            </h3>

                            <p>
                                View your seller profile and
                                KYC approval information.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/profile")
                                }
                            >
                                View Profile →
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;