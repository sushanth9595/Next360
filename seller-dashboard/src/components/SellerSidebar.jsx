import { NavLink, useNavigate } from "react-router-dom";

function SellerSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("next360-token");
        navigate("/login");
    };

    return (
        <aside className="seller-sidebar">

            <h2>Next360 </h2>

            <nav>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    🏠 Dashboard
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    👤 Profile & KYC
                </NavLink>

                <NavLink
                    to="/products"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    📦 Products
                </NavLink>

                <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    🛒 Orders
                </NavLink>

                <NavLink
                    to="/earnings"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    💰 Earnings
                </NavLink>

            </nav>

            <button
                className="seller-logout-button"
                onClick={handleLogout}
            >
                🚪 Logout
            </button>

        </aside>
    );
}

export default SellerSidebar;