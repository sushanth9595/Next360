import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../../services/api";

type Product = {
  id: number;
  name: string;
  category?: string;
  type?: string;
  status?: string;
  price?: number | string;
  stock?: number;
  image_url?: string;
  description?: string;
  certificate_url?: string | null;
};

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/products/${id}`);

      const productData =
        response.data?.product ?? response.data;

      setProduct(productData);
    } catch (error: any) {
      console.error("Product details error:", error);

      Alert.alert(
        "Error",
        "Unable to load product details."
      );

      router.back();
    } finally {
      setLoading(false);
    }
  };

  const isVerifiedOrganic =
    product?.type === "ORGANIC" &&
    product?.status === "APPROVED" &&
    !!product?.certificate_url;

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: insets.top },
        ]}
      >
        <Text style={styles.errorText}>
          Product not found.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleAddToCart = async () => {
  if (!product) return;

  try {
    const savedCart = await AsyncStorage.getItem("next360-cart");

    const cart = savedCart ? JSON.parse(savedCart) : [];

    const existingItem = cart.find(
      (item: any) => item.id === product.id
    );

    if (existingItem) {
      existingItem.quantity = Math.min(
        existingItem.quantity + 1,
        Number(product.stock || 0)
      );
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        quantity: 1,
      });
    }

    await AsyncStorage.setItem(
      "next360-cart",
      JSON.stringify(cart)
    );

    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`
    );
  } catch (error) {
    console.error("Add to cart failed:", error);

    Alert.alert(
      "Error",
      "Unable to add the product to your cart."
    );
  }
};

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 10 },
          ]}
        >
          <Pressable
            style={styles.headerBack}
            onPress={() => router.back()}
          >
            <Text style={styles.headerBackText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Product Details
          </Text>

          <View style={{ width: 42 }} />
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                No Image
              </Text>
            </View>
          )}
        </View>

        {/* Product Information */}
        <View style={styles.content}>
          {isVerifiedOrganic && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                ✓ VERIFIED ORGANIC
              </Text>
            </View>
          )}

          {!isVerifiedOrganic && (
            <View style={styles.unverifiedBadge}>
              <Text style={styles.unverifiedText}>
                UNVERIFIED
              </Text>
            </View>
          )}

          <Text style={styles.category}>
            {product.category || "Other"}
          </Text>

          <Text style={styles.name}>
            {product.name}
          </Text>

          <Text style={styles.price}>
            ₹{Number(product.price || 0).toFixed(2)}
          </Text>

          {/* Stock */}
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>
              Availability
            </Text>

            <Text
              style={[
                styles.stockValue,
                {
                  color:
                    (product.stock || 0) > 0
                      ? "#16803C"
                      : "#C62828",
                },
              ]}
            >
              {(product.stock || 0) > 0
                ? `${product.stock} in stock`
                : "Out of stock"}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Description
            </Text>

            <Text style={styles.description}>
              {product.description ||
                "No description available for this product."}
            </Text>
          </View>

          {/* Organic Certification */}
          {isVerifiedOrganic && (
            <View style={styles.certificationBox}>
              <Text style={styles.certificationTitle}>
                🌱 Organic Certification
              </Text>

              <Text style={styles.certificationText}>
                This product has an approved organic
                certification verified by Next360.
              </Text>

              {product.certificate_url && (
                <Pressable
                  style={styles.certificateButton}
                  onPress={() =>
                    Alert.alert(
                      "Certificate",
                      product.certificate_url || ""
                    )
                  }
                >
                  <Text style={styles.certificateButtonText}>
                    View Certificate
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Trust Information */}
          <View style={styles.trustBox}>
            <Text style={styles.trustTitle}>
              Next360 Trust
            </Text>

            <Text style={styles.trustText}>
              ✓ Product information is provided by the
              seller.
            </Text>

            <Text style={styles.trustText}>
              ✓ Verified Organic products require approved
              certification.
            </Text>

            <Text style={styles.trustText}>
              ✓ Stock availability is updated from the
              marketplace inventory.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <Pressable
          style={[
            styles.addButton,
            (product.stock || 0) <= 0 &&
              styles.disabledButton,
          ]}
          disabled={(product.stock || 0) <= 0}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>
            {(product.stock || 0) > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF7",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAF7",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },

  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },

  header: {
    minHeight: 70,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAE5",
  },

  headerBack: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F5F0",
    justifyContent: "center",
    alignItems: "center",
  },

  headerBackText: {
    fontSize: 34,
    lineHeight: 36,
    color: "#176B35",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#18351F",
  },

  imageContainer: {
    width: "100%",
    height: 320,
    backgroundColor: "#FFFFFF",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E9EFE9",
  },

  placeholderText: {
    fontSize: 16,
    color: "#777",
  },

  content: {
    padding: 20,
  },

  verifiedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F6EA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },

  verifiedText: {
    color: "#16803C",
    fontSize: 12,
    fontWeight: "800",
  },

  unverifiedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },

  unverifiedText: {
    color: "#A65B00",
    fontSize: 12,
    fontWeight: "800",
  },

  category: {
    fontSize: 13,
    color: "#6D7A70",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#18351F",
    marginBottom: 10,
  },

  price: {
    fontSize: 25,
    fontWeight: "800",
    color: "#176B35",
    marginBottom: 18,
  },

  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },

  stockLabel: {
    fontSize: 14,
    color: "#666",
  },

  stockValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#18351F",
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#5E665F",
  },

  certificationBox: {
    backgroundColor: "#EDF8EF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#CFE8D3",
  },

  certificationTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#176B35",
    marginBottom: 8,
  },

  certificationText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4F6655",
    marginBottom: 14,
  },

  certificateButton: {
    alignSelf: "flex-start",
    backgroundColor: "#176B35",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  certificateButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  trustBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  trustTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#18351F",
    marginBottom: 10,
  },

  trustText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#667067",
    marginBottom: 5,
  },

  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E3E8E3",
  },

  addButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#176B35",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#AAB2AA",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  backButton: {
    backgroundColor: "#176B35",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});