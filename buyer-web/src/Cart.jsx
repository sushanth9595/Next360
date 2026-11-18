import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";

function Cart({
    cartItems,
    setCartItems,
    isLoggedIn,
    setIsLoggedIn
}) {
    const navigate = useNavigate();

    const removeItem = (productId) => {
        setCartItems((items) =>
            items.filter((item) => item.id !== productId)
        );
    };

    const updateQuantity = (productId, newQuantity) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === productId
                    ? {
                          ...item,
                          quantity: Math.max(
                              1,
                              Math.min(item.stock, newQuantity)
                          )
                      }
                    : item
            )
        );
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Header
                    cartItems={cartItems}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />

                <main className="cart-page">
                    <h1>Your Cart</h1>

                    <p>Your cart is empty.</p>

                    <Link to="/">
                        ← Continue Shopping
                    </Link>
                </main>
            </>
        );
    }

    const total = cartItems.reduce(
        (sum, item) =>
            sum + Number(item.price) * item.quantity,
        0
    );

    return (
        <>
            <Header
                cartItems={cartItems}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main className="cart-page">
                <h1>Your Cart</h1>

                {cartItems.map((item) => (
                    <div
                        className="cart-item"
                        key={item.id}
                    >
                        <div className="cart-product-info">

                            {item.image_url && (
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="cart-product-image"
                                />
                            )}

                            <div>
                                <h3>{item.name}</h3>

                                <p>
                                    ₹{item.price} × {item.quantity}
                                </p>

                                <p className="item-subtotal">
                                    Subtotal: ₹
                                    {(
                                        Number(item.price) *
                                        item.quantity
                                    ).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="cart-actions">

                            <div className="cart-quantity">
                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity - 1
                                        )
                                    }
                                    disabled={item.quantity <= 1}
                                >
                                    −
                                </button>

                                <span>
                                    {item.quantity}
                                </span>

                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity + 1
                                        )
                                    }
                                    disabled={
                                        item.quantity >= item.stock
                                    }
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() =>
                                    removeItem(item.id)
                                }
                            >
                                Remove
                            </button>

                        </div>
                    </div>
                ))}

                <div className="cart-total">
                    <h2>
                        Total: ₹{total.toFixed(2)}
                    </h2>

                    <button
                        className="checkout-button"
                        onClick={() => {
                            const token =
                                localStorage.getItem(
                                    "next360-token"
                                );

                            if (!token) {
                                alert(
                                    "Please login before checkout."
                                );
                                navigate("/login");
                                return;
                            }

                            navigate("/checkout");
                        }}
                    >
                        Proceed to Checkout
                    </button>
                </div>

            </main>
        </>
    );
}

export default Cart;