import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import api from "./services/api";
import ProductDetails from "./ProductDetails";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Orders from "./Orders";
import Disputes from "./Disputes";
import Login from "./Login";
import Header from "./Header";

function Home({ cartItems, isLoggedIn, setIsLoggedIn }) {
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [verifiedOnly, setVerifiedOnly] = useState(true);
    const [searchMessage, setSearchMessage] = useState("");
    const [sortOption, setSortOption] = useState("default");

    const isProductsPage = location.pathname === "/products";

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products");
                setProducts(response.data.products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    // Filter and sort products
   // Filter products
const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        product.type.toLowerCase().includes(search);

    const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

    const isVerifiedOrganic =
        product.type === "ORGANIC" &&
        product.status === "APPROVED" &&
        product.certificate_url;

    const matchesVerified =
        !verifiedOnly || isVerifiedOrganic;

    return (
        matchesSearch &&
        matchesCategory &&
        matchesVerified
    );
});

// Sort filtered products
const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "low-high") {
        return Number(a.price) - Number(b.price);
    }

    if (sortOption === "high-low") {
        return Number(b.price) - Number(a.price);
    }

    return 0;
});

    return (
        <>
            <Header
                cartItems={cartItems}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main>

                {/* Hero Section */}
                {isProductsPage && (
    <div className="products-back-link">
        <Link to="/">
            ← Back to Home
        </Link>
    </div>
)}
                <section className="hero">

                    <h1>
                        {isProductsPage
                            ? "All Products"
                            : "Shop Trusted Organic Products"}
                    </h1>

                    <p>
                        Discover verified organic products from trusted sellers.
                    </p>

                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                        />

                        <button
    onClick={() => {
        if (searchTerm.trim() === "") {
            setSearchMessage("");
            return;
        }

        const count = filteredProducts.length;

        setSearchMessage(
            `${count} product${count !== 1 ? "s" : ""} found`
        );
    }}
>
    Search
</button>
{searchMessage && (
    <p className="search-message">
        {searchMessage}
    </p>
)}

                    </div>
                    

                </section>


                {/* Filters */}
                <section className="filters">

                    <button
                        onClick={() =>
                            setSelectedCategory("All")
                        }
                        className={
                            selectedCategory === "All"
                                ? "active-filter"
                                : ""
                        }
                    >
                        All
                    </button>


                    <button
                        onClick={() =>
                            setSelectedCategory("Food")
                        }
                        className={
                            selectedCategory === "Food"
                                ? "active-filter"
                                : ""
                        }
                    >
                        Food
                    </button>


                    <button
                        onClick={() =>
                            setSelectedCategory("Personal Care")
                        }
                        className={
                            selectedCategory === "Personal Care"
                                ? "active-filter"
                                : ""
                        }
                    >
                        Personal Care
                    </button>


                    <button
                        onClick={() =>
                            setSelectedCategory("Home")
                        }
                        className={
                            selectedCategory === "Home"
                                ? "active-filter"
                                : ""
                        }
                    >
                        Home
                    </button>


                    <label>

                        <input
                            type="checkbox"
                            checked={verifiedOnly}
                            onChange={(e) =>
                                setVerifiedOnly(
                                    e.target.checked
                                )
                            }
                        />

                        Show Verified Organic Only

                    </label>
                    <button
    onClick={() => {
        setSearchTerm("");
        setSelectedCategory("All");
        setVerifiedOnly(true);
        setSearchMessage("");
        setSortOption("default");
    }}
    className="clear-filter-button"
>
    Clear Filters
</button>
<select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="sort-select"
>
    <option value="default">Sort By</option>
    <option value="low-high">Price: Low to High</option>
    <option value="high-low">Price: High to Low</option>
</select>
                

                </section>


                {/* Products */}
                <section className="products-section">

                    <h2>Products</h2>
                  {searchMessage && (
                     <div className="search-result-count">
                       {searchMessage}
                    </div>
                  )}
                    <div className="products-grid">

                        {sortedProducts.length === 0 ? (

                            <div className="no-products">
    <div className="no-products-icon">🔍</div>
    <h3>No products found</h3>
    <p>
        Try changing your search or filters to find
        more products.
    </p>

    <button
        onClick={() => {
            setSearchTerm("");
            setSelectedCategory("All");
            setVerifiedOnly(false);
            setSearchMessage("");
             setSortOption("default");
        }}
    >
        Show All Products
    </button>
</div>

                        ) : (

                            sortedProducts.map(
                                (product) => (

                                    <Link
                                        to={`/products/${product.id}`}
                                        className="product-card"
                                        key={product.id}
                                    >

                                        {product.image_url && (
                                            <img
                                                src={
                                                    product.image_url
                                                }
                                                alt={
                                                    product.name
                                                }
                                                className="product-image"
                                            />
                                        )}


                                        <h3>
                                            {product.name}
                                        </h3>


                                        <p>
                                            Category:{" "}
                                            {product.category}
                                        </p>


                                        <p>
                                            Price: ₹
                                            {product.price}
                                        </p>


                                        <p
                                          className={
                                            product.stock === 0
                                                 ? "stock-out"
                                                 : product.stock <= 5
                                                  ? "stock-low"
                                                 : "stock-available"
                                                }
                                                >
                                                  {product.stock === 0
                                                      ? "Out of Stock"
                                                       : product.stock <= 5
                                                        ? `Only ${product.stock} left`
                                                        : `${product.stock} in stock`}
                                      </p>


                                        <p>
                                            Type:{" "}
                                            {product.type}
                                        </p>


                                        {product.type ===
                                            "ORGANIC" &&
                                            product.status ===
                                                "APPROVED" &&
                                            product.certificate_url && (

                                                <span className="verified-badge">
                                                    ✓ Verified Organic
                                                </span>

                                            )}


                                        {product.type ===
                                            "NATURAL" && (

                                            <span className="unverified-details">
                                                ⚠ Unverified Natural
                                            </span>

                                        )}


                                        {product.type ===
                                            "ECO_FRIENDLY" && (

                                            <span className="unverified-details">
                                                ⚠ Unverified Eco-Friendly
                                            </span>

                                        )}
                                        <div
    className={
        product.stock === 0
            ? "view-product-button disabled"
            : "view-product-button"
    }
>
    {product.stock === 0
        ? "Out of Stock"
        : "View Product →"}
</div>

                                    </Link>

                                )
                            )

                        )}

                    </div>

                </section>

            </main>
        </>
    );
}


function App() {

    const [cartItems, setCartItems] = useState(() => {

        const savedCart =
            localStorage.getItem("next360-cart");

        return savedCart
            ? JSON.parse(savedCart)
            : [];

    });


    useEffect(() => {

        localStorage.setItem(
            "next360-cart",
            JSON.stringify(cartItems)
        );

    }, [cartItems]);


    const [isLoggedIn, setIsLoggedIn] = useState(
        Boolean(
            localStorage.getItem("next360-token")
        )
    );


    return (

        <Routes>

            {/* Home */}
            <Route
                path="/"
                element={
                    <Home
                        cartItems={cartItems}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />


            {/* Products */}
            <Route
                path="/products"
                element={
                    <Home
                        cartItems={cartItems}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />


            {/* Product Details */}
            <Route
                path="/products/:productId"
                element={
                    <ProductDetails
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />


            {/* Cart */}
            <Route
                path="/cart"
                element={
                    <Cart
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />


            {/* Checkout */}
            <Route
                path="/checkout"
                element={
                    <Checkout
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />


            {/* Orders */}
            <Route
                path="/orders"
                element={
                    <Orders
                        cartItems={cartItems}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />

            <Route
    path="/disputes"
    element={
        <Disputes
            cartItems={cartItems}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
        />
    }
/>


            {/* Login */}
            <Route
                path="/login"
                element={
                    <Login
                        cartItems={cartItems}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />

        </Routes>

    );
}


export default App;