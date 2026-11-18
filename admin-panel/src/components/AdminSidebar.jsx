import { NavLink } from "react-router-dom";

function AdminSidebar() {
    return (
        <aside className="admin-sidebar">

            <div className="admin-logo">
                <h2>Next360</h2>
                <span>Admin Panel</span>
            </div>

            <nav>

                <NavLink to="/">
                    Dashboard
                </NavLink>

                <NavLink to="/sellers">
                    Sellers
                </NavLink>

                <NavLink to="/products">
                    Products
                </NavLink>

                <NavLink to="/orders">
                    Orders
                </NavLink>

                <NavLink to="/disputes">Disputes</NavLink>

            </nav>

        </aside>
    );
}

export default AdminSidebar;