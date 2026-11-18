import { useEffect, useState } from "react";
import api from "../services/api";
import SellerSidebar from "../components/SellerSidebar";

function Earnings() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [totalSales, setTotalSales] = useState(0);
    const [totalCommission, setTotalCommission] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                setLoading(true);
                setMessage("");

                const response = await api.get(
                    "/orders/seller-orders"
                );

                const sellerOrders =
                    response.data.orders || [];

                setOrders(sellerOrders);

                let sales = 0;
                let commission = 0;
                let earnings = 0;

                for (const order of sellerOrders) {
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

                setTotalSales(sales);
                setTotalCommission(commission);
                setTotalEarnings(earnings);

            } catch (error) {
                console.error(
                    "Failed to load earnings:",
                    error
                );

                setMessage(
                    error.response?.data?.message ||
                    "Failed to load earnings"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    return (
        <div className="seller-dashboard">

            <SellerSidebar />

            <main className="seller-dashboard-content">

                <h1>Seller Earnings</h1>

                {message && (
                    <p>{message}</p>
                )}

                {loading ? (
                    <p>Loading earnings...</p>
                ) : (
                    <>
                        <div className="earnings-cards">

                            <div className="earnings-card">
                                <h3>Total Sales</h3>

                                <p>
                                    ₹
                                    {totalSales.toFixed(2)}
                                </p>
                            </div>

                            <div className="earnings-card">
                                <h3>Commission</h3>

                                <p>
                                    ₹
                                    {totalCommission.toFixed(2)}
                                </p>
                            </div>

                            <div className="earnings-card">
                                <h3>Net Earnings</h3>

                                <p>
                                    ₹
                                    {totalEarnings.toFixed(2)}
                                </p>
                            </div>

                        </div>

                        <h2>
                            Earnings Summary
                        </h2>

                        {orders.length === 0 ? (
                            <p>
                                No orders available yet.
                            </p>
                        ) : (
                            <div className="earnings-orders">

                                {orders.map((order) => (
                                    <div
                                        className="earnings-order-card"
                                        key={order.id}
                                    >
                                        <h3>
                                            Order #{order.id}
                                        </h3>

                                        <p>
                                            Product:{" "}
                                            {order.product_name}
                                        </p>

                                        <p>
                                            Order Value: ₹
                                            {Number(
                                                order.total_price
                                            ).toFixed(2)}
                                        </p>

                                        <p>
                                            Status:{" "}
                                            {order.status}
                                        </p>

                                        <p>
                                            Payment:{" "}
                                            {order.payment_status ||
                                                "PENDING"}
                                        </p>
                                    </div>
                                ))}

                            </div>
                        )}
                    </>
                )}

            </main>

        </div>
    );
}

export default Earnings;