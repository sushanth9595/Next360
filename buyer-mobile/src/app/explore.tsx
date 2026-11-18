import { useCallback, useEffect, useMemo, useState, } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter,  useFocusEffect  } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";



import api from "../services/api";

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

const categories = [
  "All",
  "Food",
  "Home",
  "Personal Care",
  "Farming",
  "Other",
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem("next360-token");

        if (!token) {
          router.replace("/");
        }
      };

      checkLogin();
    }, [router])
  );

  // other code...;
  

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setError("");

      const response = await api.get("/products");

      const data = response.data;

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : [];

      setProducts(productList);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const isVerifiedOrganic = (product: Product) => {
    return (
      product.type === "ORGANIC" &&
      product.status === "APPROVED" &&
      !!product.certificate_url
    );
  };

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        product.name?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText) ||
        product.type?.toLowerCase().includes(searchText);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesVerified =
        !verifiedOnly || isVerifiedOrganic(product);

      return matchesSearch && matchesCategory && matchesVerified;
    });
  }, [products, search, selectedCategory, verifiedOnly]);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => {
      const verified = isVerifiedOrganic(item);
      const price = Number(item.price || 0);
      const stock = Number(item.stock || 0);

      return (
        <Pressable
  style={({ pressed }) => [
    styles.productCard,
    pressed && styles.productPressed,
  ]}
  onPress={() => router.push(`/product/${item.id}`)}
>
          <View style={styles.imageContainer}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.productImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderEmoji}>🌿</Text>
              </View>
            )}

            {verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>
                  ✓ Verified Organic
                </Text>
              </View>
            )}
          </View>

          <View style={styles.productContent}>
            <Text style={styles.productCategory}>
              {item.category || "Organic Product"}
            </Text>

            <Text
              style={styles.productName}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹{price.toFixed(2)}
              </Text>

              <View
                style={[
                  styles.stockBadge,
                  stock > 0
                    ? styles.stockAvailable
                    : styles.stockUnavailable,
                ]}
              >
                <Text
                  style={[
                    styles.stockText,
                    stock > 0
                      ? styles.stockAvailableText
                      : styles.stockUnavailableText,
                  ]}
                >
                  {stock > 0
                    ? `${stock} in stock`
                    : "Out of stock"}
                </Text>
              </View>
            </View>

            {!verified && (
              <View style={styles.unverifiedBadge}>
                <Text style={styles.unverifiedText}>
                  {item.type === "NATURAL"
                    ? "Natural • Unverified"
                    : item.type === "ECO-FRIENDLY"
                    ? "Eco-Friendly • Unverified"
                    : "Unverified"}
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.addButton,
                stock <= 0 && styles.addButtonDisabled,
              ]}
              disabled={stock <= 0}
              onPress={async () => {
  try {
    const storedCart = await AsyncStorage.getItem("next360-cart");
    const cart = storedCart ? JSON.parse(storedCart) : [];

    const existingItem = cart.find(
      (cartItem: any) => cartItem.id === item.id
    );

    if (existingItem) {
      if (existingItem.quantity < (item.stock || 0)) {
        existingItem.quantity += 1;
      } else {
        alert("Maximum available stock reached.");
        return;
      }
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price || 0,
        image_url: item.image_url,
        stock: item.stock || 0,
        quantity: 1,
      });
    }

    await AsyncStorage.setItem("next360-cart", JSON.stringify(cart));

    alert(`${item.name} added to cart.`);
  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Unable to add product to cart.");
  }
}}
            >
              <Text style={styles.addButtonText}>
                {stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      );
    },
    []
  );

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === "ios"
                ? insets.top + 8
                : insets.top + 12,
          },
        ]}
      >
        <View>
          <Text style={styles.brand}>Next360</Text>
          <Text style={styles.tagline}>
            Trusted organic shopping
          </Text>
        </View>
        
 <View style={styles.headerActions}>
  <Pressable
    style={styles.ordersButton}
    onPress={() => router.push("/orders")}
  >
    <Text style={styles.ordersButtonText}>📦 Orders</Text>
  </Pressable>

  <Pressable
    style={styles.headerIcon}
    onPress={() => router.push("/cart")}
  >
    <Text style={styles.headerIconText}>🛒</Text>
  </Pressable>

  <Pressable
    style={styles.logoutButton}
    onPress={async () => {
      await AsyncStorage.removeItem("next360-token");
    
      router.replace("/");
    }}
  >
    <Text style={styles.logoutButtonText}>Logout</Text>
  </Pressable>
</View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroSmall}>
          🌿 TRUSTED • VERIFIED • ORGANIC
        </Text>

        <Text style={styles.heroTitle}>
          Shop better.
          {"\n"}
          Shop naturally.
        </Text>

        <Text style={styles.heroDescription}>
          Discover trusted products from verified sellers
          on Next360.
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔎</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor="#8A9690"
          style={styles.searchInput}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Verified filter */}
      <Pressable
        style={[
          styles.verifiedFilter,
          verifiedOnly && styles.verifiedFilterActive,
        ]}
        onPress={() => setVerifiedOnly((value) => !value)}
      >
        <View
          style={[
            styles.checkbox,
            verifiedOnly && styles.checkboxActive,
          ]}
        >
          {verifiedOnly && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>

        <View style={styles.filterTextContainer}>
          <Text style={styles.filterTitle}>
            Show Verified Organic Only
          </Text>

          <Text style={styles.filterSubtitle}>
            Certified organic products approved by Next360
          </Text>
        </View>
      </Pressable>

      {/* Categories */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>
          Browse Categories
        </Text>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const active = selectedCategory === item;

            return (
              <Pressable
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Product heading */}
      <View style={styles.productsHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Products
          </Text>

          <Text style={styles.productCount}>
            {filteredProducts.length} products available
          </Text>
        </View>

        {verifiedOnly && (
          <View style={styles.smallVerifiedBadge}>
            <Text style={styles.smallVerifiedText}>
              ✓ Verified
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingLogo}>
          <Text style={styles.loadingLogoText}>🌿</Text>
        </View>

        <Text style={styles.loadingTitle}>
          Next360
        </Text>

        <ActivityIndicator
          size="large"
          color="#176B3A"
        />

        <Text style={styles.loadingText}>
          Loading trusted products...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌱</Text>

            <Text style={styles.emptyTitle}>
              No products found
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or category filter.
            </Text>

            <Pressable
              style={styles.resetButton}
              onPress={() => {
                setSearch("");
                setSelectedCategory("All");
                setVerifiedOnly(false);
              }}
            >
              <Text style={styles.resetButtonText}>
                Show All Products
              </Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🌿 Next360 • Trust in every purchase
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#176B3A"
            colors={["#176B3A"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable onPress={fetchProducts}>
            <Text style={styles.retryText}>
              Retry
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F8F6",
  },

  listContent: {
    paddingBottom: 30,
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5ECE7",
  },

  brand: {
    fontSize: 28,
    fontWeight: "900",
    color: "#176B3A",
    letterSpacing: -0.5,
  },

  tagline: {
    marginTop: 2,
    fontSize: 12,
    color: "#718078",
  },

  headerActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

ordersButton: {
  height: 44,
  paddingHorizontal: 12,
  borderRadius: 22,
  backgroundColor: "#EAF7EE",
  alignItems: "center",
  justifyContent: "center",
},

ordersButtonText: {
  color: "#176B3A",
  fontSize: 13,
  fontWeight: "800",
},

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIconText: {
    fontSize: 21,
  },

  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 22,
    borderRadius: 20,
    backgroundColor: "#176B3A",
  },

  heroSmall: {
    color: "#CDEFD8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 9,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
  },

  heroDescription: {
    color: "#E3F4E8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    maxWidth: 310,
  },

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DFE8E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#17221B",
  },

  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EDF2EF",
    alignItems: "center",
    justifyContent: "center",
  },

  clearText: {
    fontSize: 20,
    color: "#68756D",
    lineHeight: 22,
  },

  verifiedFilter: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE8E2",
    flexDirection: "row",
    alignItems: "center",
  },

  verifiedFilterActive: {
    backgroundColor: "#F0F9F3",
    borderColor: "#BBDDC6",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#AAB7AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  checkboxActive: {
    backgroundColor: "#176B3A",
    borderColor: "#176B3A",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  filterTextContainer: {
    flex: 1,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17221B",
  },

  filterSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#718078",
  },

  categorySection: {
    marginTop: 20,
  },

  sectionTitle: {
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: "900",
    color: "#17221B",
  },

  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE8E2",
  },

  categoryChipActive: {
    backgroundColor: "#176B3A",
    borderColor: "#176B3A",
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#526158",
  },

  categoryTextActive: {
    color: "#FFFFFF",
  },

  productsHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productCount: {
    marginLeft: 16,
    marginTop: 3,
    fontSize: 11,
    color: "#7A877F",
  },

  smallVerifiedBadge: {
    marginRight: 16,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EAF7EE",
  },

  smallVerifiedText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#176B3A",
  },

  productRow: {
    paddingHorizontal: 12,
    gap: 10,
  },

  productCard: {
    flex: 1,
    maxWidth: "50%",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2EAE5",
  },

  productPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },

  imageContainer: {
    height: 150,
    backgroundColor: "#EDF2EF",
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4ED",
  },

  placeholderEmoji: {
    fontSize: 42,
  },

  verifiedBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#176B3A",
  },

  verifiedBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  productContent: {
    padding: 12,
  },

  productCategory: {
    color: "#6C7A71",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  productName: {
    color: "#17221B",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
    minHeight: 38,
  },

  priceRow: {
    marginTop: 10,
    flexDirection: "column",
    alignItems: "flex-start",
  },

  price: {
    color: "#176B3A",
    fontSize: 17,
    fontWeight: "900",
  },

  stockBadge: {
    marginTop: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  stockAvailable: {
    backgroundColor: "#EAF7EE",
  },

  stockUnavailable: {
    backgroundColor: "#FFF0F0",
  },

  stockText: {
    fontSize: 9,
    fontWeight: "800",
  },

  stockAvailableText: {
    color: "#176B3A",
  },

  stockUnavailableText: {
    color: "#C62828",
  },

  unverifiedBadge: {
    marginTop: 7,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#F3F5F4",
    borderRadius: 6,
  },

  unverifiedText: {
    fontSize: 9,
    color: "#68756D",
    fontWeight: "700",
  },

  addButton: {
    marginTop: 10,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#176B3A",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonDisabled: {
    backgroundColor: "#B7C1BB",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 40,
    padding: 30,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E9E4",
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17221B",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#718078",
    fontSize: 13,
    lineHeight: 19,
  },

  resetButton: {
    marginTop: 18,
    backgroundColor: "#176B3A",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  footer: {
    paddingVertical: 24,
    alignItems: "center",
  },

  footerText: {
    color: "#829087",
    fontSize: 11,
  },

  errorBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#F0CACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  errorText: {
    flex: 1,
    color: "#A52323",
    fontSize: 12,
    marginRight: 10,
  },

  retryText: {
    color: "#176B3A",
    fontSize: 12,
    fontWeight: "900",
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F5F8F6",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5F4E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  loadingLogoText: {
    fontSize: 34,
  },

  loadingTitle: {
    color: "#176B3A",
    fontSize: 25,
    fontWeight: "900",
    marginBottom: 22,
  },

  loadingText: {
    marginTop: 12,
    color: "#718078",
    fontSize: 13,
  },

  logoutButton: {
  height: 44,
  paddingHorizontal: 12,
  borderRadius: 22,
  backgroundColor: "#FFF0F0",
  alignItems: "center",
  justifyContent: "center",
},

logoutButtonText: {
  color: "#C62828",
  fontSize: 13,
  fontWeight: "800",
},

  
});