import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "./Header";
import api from "./services/api";

function ProductDetails({
    cartItems,
    setCartItems,
    isLoggedIn,
    setIsLoggedIn
}) {
    const { productId } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(
                    `/products/${productId}`
                );

                setProduct(response.data.product);
            } catch (error) {
                console.error(
                    "Error fetching product:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        const existingItem = cartItems.find(
            (item) => item.id === product.id
        );

        if (existingItem) {
            setCartItems(
                cartItems.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              quantity: Math.min(
                                  item.quantity + quantity,
                                  product.stock
                              )
                          }
                        : item
                )
            );
        } else {
            setCartItems([
                ...cartItems,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    stock: product.stock,
                    quantity: quantity
                }
            ]);
        }

        alert("Product added to cart!");
    };

    if (loading) {
        return (
            <>
                <Header
                    cartItems={cartItems}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />

                <div className="details-page">
                    <p>Loading product...</p>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header
                    cartItems={cartItems}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />

                <div className="details-page">
                    <h2>Product not found</h2>

                    <Link to="/">
                        ← Back to Products
                    </Link>
                </div>
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

            <main className="details-page">

                <Link
                    to="/"
                    className="back-link"
                >
                    ← Back to Products
                </Link>

                <div className="details-container">

                    <div className="details-image-container">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="details-image"
                            />
                        ) : (
                            <div className="no-image">
                                No Image Available
                            </div>
                        )}
                    </div>

                    <div className="details-info">

                        <h1>{product.name}</h1>

                        {product.type === "ORGANIC" &&
    product.status === "APPROVED" &&
    product.certificate_url && (
        <div className="verified-details">
            ✓ Verified Organic
        </div>
    )}

{product.type === "NATURAL" && (
    <div className="unverified-details">
        ⚠ Unverified Natural
    </div>
)}

{product.type === "ECO_FRIENDLY" && (
    <div className="unverified-details">
        ⚠ Unverified Eco-Friendly
    </div>
)}

                        <p className="details-price">
                            ₹{product.price}
                        </p>

                        <p>
                            <strong>Category:</strong>{" "}
                            {product.category}
                        </p>

                        <p>
                            <strong>Product Type:</strong>{" "}
                            {product.type}
                        </p>

                       <p>
    <strong>Available Stock:</strong>{" "}
    {product.stock > 0
        ? `${product.stock} available`
        : "Out of Stock"}
</p>

{product.stock > 0 && product.stock <= 5 && (
    <p className="low-stock-message">
        ⚠ Only {product.stock} left in stock
    </p>
)}

                        <p>
                            <strong>Seller:</strong>{" "}
                            {product.business_name ||
                                "Seller information unavailable"}
                        </p>

                        <div className="description">
                            <h2>Description</h2>

                            <p>
                                {product.description ||
                                    "No description available."}
                            </p>
                        </div>

                        {product.type === "ORGANIC" &&
                            product.status === "APPROVED" &&
                            product.certificate_url && (
                                <div className="certificate-section">

                                    <h2>
                                        Organic Certification
                                    </h2>

                                    <p>
                                        This product has been
                                        verified as organic.
                                    </p>

                                    <a
                                        href={
                                            product.certificate_url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="certificate-button"
                                    >
                                        View Organic Certificate
                                    </a>

                                </div>
                            )}

                        <div className="quantity-section">

                            <label>
                                Quantity:
                            </label>

                            <div className="quantity-controls">

                                <button
                                    onClick={() =>
                                        setQuantity(
                                            (current) =>
                                                Math.max(
                                                    1,
                                                    current - 1
                                                )
                                        )
                                    }
                                    disabled={
                                        quantity <= 1
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {quantity}
                                </span>

                                <button
                                    onClick={() =>
                                        setQuantity(
                                            (current) =>
                                                Math.min(
                                                    product.stock,
                                                    current + 1
                                                )
                                        )
                                    }
                                    disabled={
                                        quantity >=
                                        product.stock
                                    }
                                >
                                    +
                                </button>

                            </div>

                        </div>

                        <button
                            className="add-cart-button"
                            disabled={
                                product.stock <= 0
                            }
                            onClick={handleAddToCart}
                        >
                            {product.stock > 0
                                ? "Add to Cart"
                                : "Out of Stock"}
                        </button>

                    </div>

                </div>

            </main>
        </>
    );
}

export default ProductDetails;