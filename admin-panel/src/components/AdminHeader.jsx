import { useNavigate } from "react-router-dom";

function AdminHeader() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("next360-token");

        navigate("/login");
    };

    return (
        <header className="admin-header">

            <div>
                <h1>Next360 Admin Panel</h1>
            </div>

            <button
                onClick={handleLogout}
                className="admin-logout-button"
            >
                Logout
            </button>

        </header>
    );
}

export default AdminHeader;