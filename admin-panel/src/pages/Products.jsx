import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingProductId, setRemovingProductId] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/products"
            );

            setProducts(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.products || []
            );

        } catch (error) {
            console.error(
                "Get products error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load pending products."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await api.get(
                    "/admin/products"
                );

                setProducts(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.products || []
                );

            } catch (error) {
                console.error(
                    "Get products error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load pending products."
                );

            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);
const updateProductStatus = async (
    productId,
    status
) => {
    try {
        const response = await api.put(
            `/admin/product/${productId}/approval`,
            {
                status
            }
        );

        console.log(
            "Product approval response:",
            response.data
        );

        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.id === productId
                    ? {
                          ...product,
                          status: status
                      }
                    : product
            )
        );

        alert(
            `Product ${status.toLowerCase()} successfully.`
        );

    } catch (error) {
        console.error(
            "Product approval error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Failed to update product status."
        );
    }
};

    const removeProduct = async (productId) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove Product #${productId}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingProductId(productId);

            await api.put(
                `/admin/product/${productId}/remove`
            );

            alert(
                "Product removed successfully."
            );

            fetchProducts();

        } catch (error) {
            console.error(
                "Remove product error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to remove product."
            );

        } finally {
            setRemovingProductId(null);
        }
    };

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <AdminHeader />

                <main className="admin-content">

                    <div className="page-title-row">

                        <div>
                            <h2>Products</h2>

                            <p>
                                Review organic products,
                                certificates and approvals.
                            </p>
                        </div>

                        <button
                            onClick={fetchProducts}
                            className="refresh-button"
                        >
                            Refresh
                        </button>

                    </div>

                    {loading && (
                        <p>Loading products...</p>
                    )}

                    {error && (
                        <p className="admin-error">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        products.length === 0 && (
                            <div className="empty-state">
                                No pending products found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        products.length > 0 && (

                            <div className="admin-table-container">

                                <table className="admin-table">

                                    <thead>

                                        <tr>
                                            <th>Product ID</th>
                                            <th>Product Name</th>
                                            <th>Category</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Seller</th>
                                            <th>Certificate</th>
                                            <th>Action</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {products.map(
                                            (product) => (

                                                <tr
                                                    key={
                                                        product.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            product.id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            product.name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            product.category ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            product.type ||
                                                            product.classification ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
    <span
        className={
            product.status === "APPROVED"
                ? "status-approved"
                : product.status === "REJECTED"
                ? "status-rejected"
                : "status-pending"
        }
    >
        {product.status || "PENDING"}
    </span>
</td>

                                                    <td>
                                                        ₹
                                                        {
                                                            product.price ??
                                                            "0"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            product.stock ??
                                                            "0"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            product.seller_id ??
                                                            product.sellerId ??
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        {String(
                                                            product.type ||
                                                            ""
                                                        ).toUpperCase() ===
                                                            "ORGANIC" &&
                                                        product.certificate_url ? (

                                                            <a
                                                                href={
                                                                    product.certificate_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="certificate-button"
                                                            >
                                                                View Certificate
                                                            </a>

                                                        ) : (

                                                            <span>
                                                                Not Available
                                                            </span>

                                                        )}

                                                    </td>

                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="approve-button"
                                                                onClick={() =>
                                                                    updateProductStatus(
                                                                        product.id,
                                                                        "APPROVED"
                                                                    )
                                                                }
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="reject-button"
                                                                onClick={() =>
                                                                    updateProductStatus(
                                                                        product.id,
                                                                        "REJECTED"
                                                                    )
                                                                }
                                                            >
                                                                Reject
                                                            </button>

                                                            <button
                                                                className="reject-button"
                                                                onClick={() =>
                                                                    removeProduct(
                                                                        product.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    removingProductId ===
                                                                    product.id
                                                                }
                                                            >
                                                                {removingProductId ===
                                                                product.id
                                                                    ? "Removing..."
                                                                    : "Remove"}
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                </main>

            </div>

        </div>
    );
}

export default Products;