import { useEffect, useState } from "react";
import api from "../services/api";
import SellerSidebar from "../components/SellerSidebar";

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        type: "ORGANIC",
        price: "",
        stock: "",
        description: "",
        imageUrl: "",
        certificateUrl: ""
    });

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            type: "ORGANIC",
            price: "",
            stock: "",
            description: "",
            imageUrl: "",
            certificateUrl: ""
        });

        setEditingProductId(null);
        setShowForm(false);
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get(
                "/products/my-products"
            );

            setProducts(
                response.data.products || []
            );
        } catch (error) {
            console.error(
                "Failed to load products:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to load products"
            );
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            try {
                const response = await api.get(
                    "/products/my-products"
                );

                if (!cancelled) {
                    setProducts(
                        response.data.products || []
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load products:",
                    error
                );

                if (!cancelled) {
                    setMessage(
                        error.response?.data?.message ||
                        "Failed to load products"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const validateProduct = () => {
        const price = Number(formData.price);
        const stock = Number(formData.stock);

        if (!formData.name.trim()) {
            setMessage(
                "Product name is required"
            );
            return false;
        }

        if (!formData.category.trim()) {
            setMessage(
                "Category is required"
            );
            return false;
        }

        if (!Number.isFinite(price) || price <= 0) {
            setMessage(
                "Price must be greater than 0"
            );
            return false;
        }

        if (!Number.isInteger(stock) || stock < 0) {
            setMessage(
                "Stock must be a whole number of 0 or more"
            );
            return false;
        }

        if (
            formData.type === "ORGANIC" &&
            !formData.certificateUrl.trim()
        ) {
            setMessage(
                "Organic products require a certificate URL"
            );
            return false;
        }

        return true;
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        setMessage("");

        if (!validateProduct()) {
            return;
        }

        try {
            const response = await api.post(
                "/products",
                {
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock)
                }
            );

            setMessage(
                response.data.message ||
                "Product created successfully"
            );

            resetForm();

            await fetchProducts();
        } catch (error) {
            console.error(
                "Failed to create product:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to create product"
            );
        }
    };

    const handleEditProduct = (product) => {
        setMessage("");

        setEditingProductId(product.id);

        setFormData({
            name: product.name || "",
            category: product.category || "",
            type: product.type || "ORGANIC",
            price: product.price || "",
            stock: product.stock ?? "",
            description: product.description || "",
            imageUrl: product.image_url || "",
            certificateUrl:
                product.certificate_url || ""
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        setMessage("");

        if (!editingProductId) {
            setMessage(
                "Product ID is missing"
            );
            return;
        }

        if (!validateProduct()) {
            return;
        }

        try {
            const response = await api.put(
                `/products/${editingProductId}`,
                {
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock)
                }
            );

            setMessage(
                response.data.message ||
                "Product updated successfully"
            );

            resetForm();

            await fetchProducts();
        } catch (error) {
            console.error(
                "Failed to update product:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to update product"
            );
        }
    };

    const handleDeleteProduct = async (productId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        setMessage("");

        try {
            const response = await api.delete(
                `/products/${productId}`
            );

            setMessage(
                response.data.message ||
                "Product deleted successfully"
            );

            await fetchProducts();
        } catch (error) {
            console.error(
                "Failed to delete product:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to delete product"
            );
        }
    };

    const getStatusClass = (status) => {
        const normalizedStatus =
            String(status || "PENDING").toUpperCase();

        if (normalizedStatus === "APPROVED") {
            return "product-status-badge approved";
        }

        if (normalizedStatus === "REJECTED") {
            return "product-status-badge rejected";
        }

        return "product-status-badge pending";
    };

    const getTypeClass = (type) => {
        const normalizedType =
            String(type || "").toUpperCase();

        if (normalizedType === "ORGANIC") {
            return "product-type-badge organic";
        }

        if (normalizedType === "NATURAL") {
            return "product-type-badge natural";
        }

        return "product-type-badge eco-friendly";
    };

    const getTypeLabel = (type) => {
        const normalizedType =
            String(type || "").toUpperCase();

        if (normalizedType === "ORGANIC") {
            return "🌱 ORGANIC";
        }

        if (normalizedType === "NATURAL") {
            return "🍃 NATURAL";
        }

        if (normalizedType === "ECO_FRIENDLY") {
            return "♻️ ECO-FRIENDLY";
        }

        return normalizedType;
    };

    const getStockClass = (stock) => {
        if (stock === 0) {
            return "stock-badge out-of-stock";
        }

        if (stock <= 5) {
            return "stock-badge low-stock";
        }

        return "stock-badge in-stock";
    };

    const getStockLabel = (stock) => {
        if (stock === 0) {
            return "Out of Stock";
        }

        if (stock <= 5) {
            return "Low Stock";
        }

        return "In Stock";
    };

    return (
        <div className="seller-dashboard">

            <SellerSidebar />

            <main className="seller-dashboard-content">

                <div className="products-header">

                    <div>
                        <p className="seller-dashboard-label">
                            Seller Portal
                        </p>

                        <h1>My Products</h1>

                        <p className="page-subtitle">
                            Manage your products and
                            inventory.
                        </p>
                    </div>

                    {!editingProductId && (
                        <button
                            onClick={() => {
                                setMessage("");

                                if (showForm) {
                                    resetForm();
                                } else {
                                    setShowForm(true);
                                }
                            }}
                        >
                            {showForm
                                ? "Cancel"
                                : "Add Product"}
                        </button>
                    )}

                </div>

                {message && (
                    <p className="products-message">
                        {message}
                    </p>
                )}

                {showForm && (
                    <div className="add-product-form">

                        <h2>
                            {editingProductId
                                ? "Edit Product"
                                : "Add New Product"}
                        </h2>

                        <form
                            onSubmit={
                                editingProductId
                                    ? handleUpdateProduct
                                    : handleAddProduct
                            }
                        >

                            <label>
                                Product Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                            <label>
                                Category
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />

                            <label>
                                Product Type
                            </label>

                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="ORGANIC">
                                    Organic
                                </option>

                                <option value="NATURAL">
                                    Natural
                                </option>

                                <option value="ECO_FRIENDLY">
                                    Eco-Friendly
                                </option>
                            </select>

                            <label>
                                Price (₹)
                            </label>

                            <input
                                type="number"
                                name="price"
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />

                            <label>
                                Stock
                            </label>

                            <input
                                type="number"
                                name="stock"
                                min="0"
                                step="1"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />

                            <label>
                                Image URL
                            </label>

                            <input
                                type="url"
                                name="imageUrl"
                                placeholder="https://example.com/image.jpg"
                                value={formData.imageUrl}
                                onChange={handleChange}
                            />

                            {formData.type === "ORGANIC" && (
                                <>
                                    <label>
                                        Organic Certificate URL
                                    </label>

                                    <input
                                        type="url"
                                        name="certificateUrl"
                                        placeholder="https://example.com/certificate.pdf"
                                        value={
                                            formData.certificateUrl
                                        }
                                        onChange={handleChange}
                                        required
                                    />

                                    <p>
                                        Organic products require
                                        a certificate for approval.
                                    </p>
                                </>
                            )}

                            <button type="submit">
                                {editingProductId
                                    ? "Save Changes"
                                    : "Create Product"}
                            </button>

                            {editingProductId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel Edit
                                </button>
                            )}

                        </form>

                    </div>
                )}

                <section>

                    <h2>Your Products</h2>

                    {loading && (
                        <p>
                            Loading products...
                        </p>
                    )}

                    {!loading &&
                        products.length === 0 && (
                            <p>
                                You have no products yet.
                            </p>
                        )}

                    {!loading &&
                        products.length > 0 && (
                            <div className="products-list">

                                {products.map((product) => {

                                    const stock =
                                        Number(
                                            product.stock
                                        );

                                    return (
                                        <div
                                            className="product-card"
                                            key={product.id}
                                        >

                                            {product.image_url ? (
                                                <img
                                                    src={
                                                        product.image_url
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                />
                                            ) : (
                                                <div className="product-image-placeholder">
                                                    No Image
                                                </div>
                                            )}

                                            <div className="product-card-top">

                                                <h3>
                                                    {product.name}
                                                </h3>

                                                <span
                                                    className={getStatusClass(
                                                        product.status
                                                    )}
                                                >
                                                    {product.status ||
                                                        "PENDING"}
                                                </span>

                                            </div>

                                            <div className="product-badges">

                                                <span
                                                    className={getTypeClass(
                                                        product.type
                                                    )}
                                                >
                                                    {getTypeLabel(
                                                        product.type
                                                    )}
                                                </span>

                                                <span
                                                    className={getStockClass(
                                                        stock
                                                    )}
                                                >
                                                    {getStockLabel(
                                                        stock
                                                    )}
                                                </span>

                                            </div>

                                            <p>
                                                <strong>
                                                    Price:
                                                </strong>{" "}
                                                ₹
                                                {Number(
                                                    product.price
                                                ).toFixed(2)}
                                            </p>

                                            <p>
                                                <strong>
                                                    Stock:
                                                </strong>{" "}
                                                {stock}
                                            </p>

                                            <p>
                                                <strong>
                                                    Category:
                                                </strong>{" "}
                                                {product.category}
                                            </p>

                                            {product.description && (
    <p>
        <strong>
            Description:
        </strong>{" "}
        {product.description}
    </p>
)}

{String(product.type || "").toUpperCase() === "ORGANIC" &&
    product.certificate_url && (
        <button
            type="button"
            className="certificate-button"
            onClick={() =>
                window.open(
                    product.certificate_url,
                    "_blank",
                    "noopener,noreferrer"
                )
            }
        >
            📄 View Organic Certificate
        </button>
    )}

<div className="product-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditProduct(
                                                            product
                                                        )
                                                    }
                                                >
                                                    Edit Product
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    Delete Product
                                                </button>

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>
                        )}

                </section>

            </main>

        </div>
    );
}

export default Products;