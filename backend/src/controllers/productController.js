const productModel = require("../models/productModel");

const createProduct = async (req, res) => {
    try {
        const sellerId = req.seller.id;

        const {
            name,
            category,
            type,
            price,
            stock,
            description,
            imageUrl,
            certificateUrl
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !category ||
            !type ||
            price === undefined ||
            stock === undefined
        ) {
            return res.status(400).json({
                message:
                    "Name, category, type, price and stock are required"
            });
        }

        // Validate price
        if (Number(price) <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0"
            });
        }

        // Validate stock
        if (Number(stock) < 0) {
            return res.status(400).json({
                message: "Stock cannot be negative"
            });
        }

        // Validate product type
        const allowedTypes = [
            "ORGANIC",
            "NATURAL",
            "ECO_FRIENDLY"
        ];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid product type"
            });
        }

        // Organic products must have a certificate
        if (type === "ORGANIC") {
            if (!certificateUrl) {
                return res.status(400).json({
                    message:
                        "Organic products require a certificate"
                });
            }

            try {
                new URL(certificateUrl);
            } catch (error) {
                return res.status(400).json({
                    message:
                        "Certificate URL must be a valid URL"
                });
            }
        }

        // Set product status
        let productStatus;

        if (type === "ORGANIC") {
            productStatus = "PENDING";
        } else {
            productStatus = "APPROVED";
        }

        const product =
            await productModel.createProduct(
                sellerId,
                name,
                category,
                type,
                price,
                stock,
                description || null,
                imageUrl || null,
                certificateUrl || null,
                productStatus
            );

        res.status(201).json({
            message: "Product created successfully",
            product: product
        });

    } catch (error) {
        console.error(
            "PRODUCT CREATION ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to create product"
        });
    }
};


const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.seller.id;

        const products =
            await productModel.findProductsBySeller(
                sellerId
            );

        res.json({
            products: products
        });

    } catch (error) {
        console.error(
            "GET SELLER PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to get seller products"
        });
    }
};


/* =========================================
   UPDATE SELLER PRODUCT
========================================= */

const updateProduct = async (req, res) => {
    try {
        const sellerId = req.seller.id;
        const { productId } = req.params;

        const {
            name,
            category,
            type,
            price,
            stock,
            description,
            imageUrl,
            certificateUrl
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !category ||
            !type ||
            price === undefined ||
            stock === undefined
        ) {
            return res.status(400).json({
                message:
                    "Name, category, type, price and stock are required"
            });
        }

        // Validate price
        if (Number(price) <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0"
            });
        }

        // Validate stock
        if (
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                message:
                    "Stock must be a whole number of 0 or more"
            });
        }

        // Validate product type
        const allowedTypes = [
            "ORGANIC",
            "NATURAL",
            "ECO_FRIENDLY"
        ];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid product type"
            });
        }

        // Find existing product
        const existingProduct =
            await productModel.findProductById(
                productId
            );

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check seller ownership
        if (
            String(existingProduct.seller_id) !==
            String(sellerId)
        ) {
            return res.status(403).json({
                message:
                    "You do not own this product"
            });
        }

        // Organic products require certificate
        if (type === "ORGANIC") {
            if (!certificateUrl) {
                return res.status(400).json({
                    message:
                        "Organic products require a certificate"
                });
            }

            try {
                new URL(certificateUrl);
            } catch (error) {
                return res.status(400).json({
                    message:
                        "Certificate URL must be a valid URL"
                });
            }
        }

        /*
         * Product changes require the appropriate
         * product status.
         *
         * Organic:
         * PENDING -> Admin certification approval
         *
         * Natural / Eco-Friendly:
         * APPROVED -> self-declared products
         */

        let productStatus;

        if (type === "ORGANIC") {
            productStatus = "PENDING";
        } else {
            productStatus = "APPROVED";
        }

        const updatedProduct =
            await productModel.updateProduct(
                productId,
                sellerId,
                name,
                category,
                type,
                Number(price),
                Number(stock),
                description || null,
                imageUrl || null,
                certificateUrl || null,
                productStatus
            );

        if (!updatedProduct) {
            return res.status(404).json({
                message:
                    "Product could not be updated"
            });
        }

        res.json({
            message:
                "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error(
            "UPDATE PRODUCT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update product"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const sellerId = req.user.id;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const product =
            await productModel.deleteProduct(
                productId,
                sellerId
            );

        if (!product) {
            return res.status(404).json({
                message:
                    "Product not found or you are not the owner"
            });
        }

        res.json({
            message: "Product deleted successfully",
            product
        });

    } catch (error) {
        console.error(
            "Delete product error:",
            error
        );

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
};


/* =========================================
   UPLOAD ORGANIC CERTIFICATE
========================================= */

const uploadCertificate = async (req, res) => {
    try {
        const sellerId = req.seller.id;
        const { productId } = req.params;
        const { certificateUrl } = req.body;

        if (!certificateUrl) {
            return res.status(400).json({
                message:
                    "Certificate URL is required"
            });
        }

        const product =
            await productModel.findProductById(
                productId
            );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (
            String(product.seller_id) !==
            String(sellerId)
        ) {
            return res.status(403).json({
                message:
                    "You do not own this product"
            });
        }

        if (product.type !== "ORGANIC") {
            return res.status(400).json({
                message:
                    "Certificate is only required for Organic products"
            });
        }

        const updatedProduct =
            await productModel.updateCertificate(
                productId,
                sellerId,
                certificateUrl
            );

        res.json({
            message:
                "Certificate uploaded successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error(
            "CERTIFICATE UPLOAD ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to upload certificate"
        });
    }
};


const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const product =
            await productModel.findProductById(
                productId
            );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            product: product
        });

    } catch (error) {
        console.error(
            "GET PRODUCT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get product"
        });
    }
};


const getAllProducts = async (req, res) => {
    try {
        const products =
            await productModel.findAllProducts();

        res.json({
            products: products
        });

    } catch (error) {
        console.error(
            "GET ALL PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get all products"
        });
    }
};

const getApprovedProducts = async (req, res) => {
    try {
        const products =
            await productModel.findAllProducts();

        const approvedProducts = products.filter(
            (product) => product.status === "APPROVED"
        );

        res.json({
            products: approvedProducts
        });

    } catch (error) {
        console.error(
            "GET APPROVED PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get approved products"
        });
    }
};


const getVerifiedOrganicProducts = async (
    req,
    res
) => {
    try {
        const products =
            await productModel.findVerifiedOrganicProducts();

        res.json({
            products: products
        });

    } catch (error) {
        console.error(
            "GET VERIFIED ORGANIC PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get verified organic products"
        });
    }
};


/* =========================================
   ADMIN PRODUCT APPROVAL
========================================= */

const updateProductApproval = async (
    req,
    res
) => {
    try {
        const { productId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message:
                    "Product status is required"
            });
        }

        if (
            !["APPROVED", "REJECTED"].includes(
                status
            )
        ) {
            return res.status(400).json({
                message:
                    "Status must be APPROVED or REJECTED"
            });
        }

        const product =
            await productModel.findProductById(
                productId
            );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const updatedProduct =
            await productModel.updateProductStatus(
                productId,
                status
            );

        res.json({
            message:
                `Product ${status.toLowerCase()} successfully`,
            product: updatedProduct
        });

    } catch (error) {
        console.error(
            "PRODUCT APPROVAL ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update product approval"
        });
    }
};

const removeProductByAdmin = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const product =
            await productModel.removeProductByAdmin(
                productId
            );

        res.json({
            message: "Product removed successfully",
            product
        });

    } catch (error) {
        console.error(
            "ADMIN REMOVE PRODUCT ERROR:",
            error
        );

        if (
            error.message ===
            "PRODUCT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(500).json({
            message: "Failed to remove product"
        });
    }
};


const getPendingProducts = async (
    req,
    res
) => {
    try {
        const products =
            await productModel.findPendingProducts();

        res.json({
            products: products
        });

    } catch (error) {
        console.error(
            "GET PENDING PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get pending products"
        });
    }
};




module.exports = {
    createProduct,
    getSellerProducts,
    updateProduct,
    uploadCertificate,
    getProductById,
    getAllProducts,
    getVerifiedOrganicProducts,
    updateProductApproval,
    getPendingProducts,
    deleteProduct,
    removeProductByAdmin,
    getApprovedProducts

};

