import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./services/api";
import Header from "./Header";

function Checkout({
    cartItems,
    setCartItems,
    isLoggedIn,
    setIsLoggedIn
}) {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("next360-token");

        if (!token) {
            alert("Please login before checkout.");
            navigate("/login");
        }
    }, [navigate]);

    const [address, setAddress] = useState({
        name: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("");

    const handlePlaceOrder = async () => {
        if (
            !address.name ||
            !address.phone ||
            !address.addressLine ||
            !address.city ||
            !address.state ||
            !address.pincode
        ) {
            alert("Please fill in all delivery details.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(address.phone)) {
            alert(
                "Please enter a valid 10-digit Indian mobile number."
            );
            return;
        }

        if (!/^\d{6}$/.test(address.pincode)) {
            alert(
                "Please enter a valid 6-digit pincode."
            );
            return;
        }

        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }

        try {
            const token =
                localStorage.getItem("next360-token");

            if (!token) {
                alert(
                    "Please login before placing an order."
                );
                return;
            }

            for (const item of cartItems) {
                await api.post(
                    "/orders",
                    {
                        productId: item.id,
                        quantity: item.quantity,
                        totalPrice:
                            Number(item.price) *
                            item.quantity,
                        paymentMethod: paymentMethod
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );
            }

            alert("Order placed successfully!");

            setCartItems([]);

            localStorage.removeItem(
                "next360-cart"
            );

            navigate("/orders");

        } catch (error) {
            console.error(
                "Order creation error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to place order."
            );
        }
    };

    const total = cartItems.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
            item.quantity,
        0
    );

    if (cartItems.length === 0) {
        return (
            <>
                <Header
                    cartItems={cartItems}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />

                <main className="checkout-page">
                    <div className="checkout-empty">
                        <div className="checkout-empty-icon">
                            🛒
                        </div>

                        <h1>Checkout</h1>

                        <p>Your cart is empty.</p>

                        <Link
                            to="/"
                            className="continue-shopping-btn"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header
                cartItems={cartItems}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main className="checkout-page">

                <div className="checkout-heading">
                    <h1>Checkout</h1>
                    <p>
                        Complete your delivery and payment
                        details to place your order.
                    </p>
                </div>

                {/* DELIVERY DETAILS */}
                <section className="delivery-section">
                    <div className="checkout-section-heading">
                        <div className="section-icon">
                            📍
                        </div>

                        <div>
                            <h2>Delivery Details</h2>
                            <p>
                                Where should we deliver
                                your order?
                            </p>
                        </div>
                    </div>

                    <div className="checkout-form-grid">

                        <div className="checkout-field">
                            <label>Full Name</label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={address.name}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        name: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="checkout-field">
                            <label>Phone Number</label>

                            <input
                                type="tel"
                                placeholder="10-digit mobile number"
                                value={address.phone}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        phone: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="checkout-field checkout-field-full">
                            <label>Address</label>

                            <textarea
                                placeholder="House / Flat / Street / Area"
                                value={address.addressLine}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        addressLine:
                                            e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="checkout-field">
                            <label>City</label>

                            <input
                                type="text"
                                placeholder="Enter city"
                                value={address.city}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        city: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="checkout-field">
                            <label>State</label>

                            <input
                                type="text"
                                placeholder="Enter state"
                                value={address.state}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        state: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="checkout-field">
                            <label>Pincode</label>

                            <input
                                type="text"
                                placeholder="6-digit pincode"
                                value={address.pincode}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        pincode: e.target.value
                                    })
                                }
                            />
                        </div>

                    </div>
                </section>

                {/* ORDER SUMMARY */}
                <section className="checkout-items">

                    <div className="checkout-section-heading">
                        <div className="section-icon">
                            🛍️
                        </div>

                        <div>
                            <h2>Order Summary</h2>
                            <p>
                                Review your items before
                                placing the order.
                            </p>
                        </div>
                    </div>

                    <div className="checkout-items-list">

                        {cartItems.map((item) => (
                            <div
                                className="checkout-item"
                                key={item.id}
                            >
                                <div className="checkout-item-info">

                                    <div className="checkout-item-image">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                            />
                                        ) : (
                                            <span>🌱</span>
                                        )}
                                    </div>

                                    <div>
                                        <h3>
                                            {item.name}
                                        </h3>

                                        <p>
                                            ₹
                                            {Number(
                                                item.price
                                            ).toFixed(2)}{" "}
                                            ×{" "}
                                            {item.quantity}
                                        </p>
                                    </div>

                                </div>

                                <strong>
                                    ₹
                                    {(
                                        Number(item.price) *
                                        item.quantity
                                    ).toFixed(2)}
                                </strong>
                            </div>
                        ))}

                    </div>
                </section>

                {/* PAYMENT */}
                <section className="payment-section">

                    <div className="checkout-section-heading">
                        <div className="section-icon">
                            💳
                        </div>

                        <div>
                            <h2>Payment Method</h2>
                            <p>
                                Choose how you would like
                                to pay.
                            </p>
                        </div>
                    </div>

                    <div className="payment-options">

                        {/* UPI */}
                        <label
                            className={`payment-option ${
                                paymentMethod === "UPI"
                                    ? "selected"
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment"
                                value="UPI"
                                checked={
                                    paymentMethod === "UPI"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="payment-option-icon">
                                📱
                            </div>

                            <div className="payment-option-content">
                                <strong>UPI</strong>

                                <span>
                                    Pay securely using
                                    UPI apps
                                </span>
                            </div>

                            <div className="payment-check">
                                ✓
                            </div>
                        </label>

                        {/* CARD */}
                        <label
                            className={`payment-option ${
                                paymentMethod === "CARD"
                                    ? "selected"
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment"
                                value="CARD"
                                checked={
                                    paymentMethod === "CARD"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="payment-option-icon">
                                💳
                            </div>

                            <div className="payment-option-content">
                                <strong>
                                    Credit / Debit Card
                                </strong>

                                <span>
                                    Visa, Mastercard,
                                    RuPay and more
                                </span>
                            </div>

                            <div className="payment-check">
                                ✓
                            </div>
                        </label>

                        {/* COD */}
                        <label
                            className={`payment-option ${
                                paymentMethod === "COD"
                                    ? "selected"
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment"
                                value="COD"
                                checked={
                                    paymentMethod === "COD"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="payment-option-icon">
                                💵
                            </div>

                            <div className="payment-option-content">
                                <strong>
                                    Cash on Delivery
                                </strong>

                                <span>
                                    Pay when your order
                                    arrives
                                </span>
                            </div>

                            <div className="payment-check">
                                ✓
                            </div>
                        </label>

                    </div>

                    <div className="secure-payment-note">
                        🔒 Your payment information is
                        protected and secure.
                    </div>

                </section>

                {/* TOTAL */}
                <section className="checkout-total">

                    <div className="total-row">
                        <span>Subtotal</span>

                        <strong>
                            ₹{total.toFixed(2)}
                        </strong>
                    </div>

                    <div className="total-row">
                        <span>Delivery</span>

                        <strong className="free-delivery">
                            FREE
                        </strong>
                    </div>

                    <div className="total-divider"></div>

                    <div className="grand-total">
                        <span>Total</span>

                        <strong>
                            ₹{total.toFixed(2)}
                        </strong>
                    </div>

                    <button
                        className="place-order-btn"
                        onClick={handlePlaceOrder}
                    >
                        🔒 Place Order
                    </button>

                    <p className="order-security-text">
                        By placing your order, you agree
                        to our terms and conditions.
                    </p>

                </section>

                <Link
                    to="/cart"
                    className="back-to-cart"
                >
                    ← Back to Cart
                </Link>

            </main>
        </>
    );
}

export default Checkout;