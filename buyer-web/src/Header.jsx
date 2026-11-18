import { Link } from "react-router-dom";

function Header({ cartItems, isLoggedIn, setIsLoggedIn }) {
    return (
        <header className="header">
            <div className="logo">Next360</div>

            <nav>
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>
                <Link to="/orders">Orders</Link>
            </nav>

            <div className="header-actions">
                <Link
                    to="/cart"
                    className="cart-header-link"
                >
                    🛒 Cart (
                    {cartItems.reduce(
                        (total, item) => total + item.quantity,
                        0
                    )}
                    )
                </Link>

                {isLoggedIn ? (
                    <button
                        onClick={() => {
                            localStorage.removeItem(
                                "next360-token"
                            );
                            setIsLoggedIn(false);
                        }}
                    >
                        Logout
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="login-link"
                    >
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;