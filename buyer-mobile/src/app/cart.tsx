import { useCallback, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


type CartItem = {
  id: number;
  name: string;
  price: number | string;
  image_url?: string;
  stock?: number;
  quantity: number;
};

export default function CartScreen() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);

      const savedCart = await AsyncStorage.getItem("next360-cart");

      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Load cart error:", error);
      Alert.alert("Error", "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const saveCart = async (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);

    await AsyncStorage.setItem(
      "next360-cart",
      JSON.stringify(updatedCart)
    );
  };

  const increaseQuantity = async (item: CartItem) => {
    const maxStock = Number(item.stock || 0);

    if (item.quantity >= maxStock) {
      Alert.alert(
        "Stock Limit",
        `Only ${maxStock} items are available.`
      );
      return;
    }

    const updatedCart = cartItems.map((cartItem) =>
      cartItem.id === item.id
        ? {
            ...cartItem,
            quantity: cartItem.quantity + 1,
          }
        : cartItem
    );

    await saveCart(updatedCart);
  };

  const decreaseQuantity = async (item: CartItem) => {
    if (item.quantity <= 1) {
      removeItem(item);
      return;
    }

    const updatedCart = cartItems.map((cartItem) =>
      cartItem.id === item.id
        ? {
            ...cartItem,
            quantity: cartItem.quantity - 1,
          }
        : cartItem
    );

    await saveCart(updatedCart);
  };

  const removeItem = (item: CartItem) => {
    Alert.alert(
      "Remove Item",
      `Remove ${item.name} from your cart?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const updatedCart = cartItems.filter(
              (cartItem) => cartItem.id !== item.id
            );

            await saveCart(updatedCart);
          },
        },
      ]
    );
  };

  const getItemPrice = (item: CartItem) => {
    return Number(item.price || 0);
  };

  const totalAmount = cartItems.reduce(
    (total, item) =>
      total + getItemPrice(item) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading cart...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>My Cart</Text>

        <View style={{ width: 42 }} />
      </View>

      {cartItems.length === 0 ? (
        /* Empty Cart */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>

          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Text style={styles.emptyText}>
            Add some trusted products from Next360.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.shopButtonText}>
              Start Shopping
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.itemCount}>
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"} in your cart
            </Text>

            {cartItems.map((item) => (
              <View
                key={item.id}
                style={styles.cartItem}
              >
                {/* Product Image */}
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
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

                {/* Product Information */}
                <View style={styles.itemContent}>
                  <Text
                    style={styles.itemName}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text style={styles.itemPrice}>
                    ₹{getItemPrice(item).toFixed(2)}
                  </Text>

                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() =>
                        decreaseQuantity(item)
                      }
                    >
                      <Text style={styles.quantityButtonText}>
                        −
                      </Text>
                    </Pressable>

                    <Text style={styles.quantityText}>
                      {item.quantity}
                    </Text>

                    <Pressable
                      style={styles.quantityButton}
                      onPress={() =>
                        increaseQuantity(item)
                      }
                    >
                      <Text style={styles.quantityButtonText}>
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Remove */}
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeItem(item)}
                >
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}

            {/* Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>
                Order Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal
                </Text>

                <Text style={styles.summaryValue}>
                  ₹{totalAmount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Delivery
                </Text>

                <Text style={styles.freeDelivery}>
                  Calculated at checkout
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.totalValue}>
                  ₹{totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.bottomBar}>
            <Pressable
              style={styles.checkoutButton}
             onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout
              </Text>
            </Pressable>
          </View>
        </>
      )}
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
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
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

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F5F0",
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonText: {
    fontSize: 34,
    lineHeight: 36,
    color: "#176B35",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#18351F",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  itemCount: {
    fontSize: 15,
    color: "#667067",
    marginBottom: 14,
  },

  cartItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E9EFE9",
  },

  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E9EFE9",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 12,
    color: "#777",
  },

  itemContent: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#18351F",
    paddingRight: 20,
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#176B35",
    marginTop: 6,
    marginBottom: 10,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E8F3EA",
    justifyContent: "center",
    alignItems: "center",
  },

  quantityButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#176B35",
  },

  quantityText: {
    width: 38,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#18351F",
  },

  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  removeText: {
    fontSize: 25,
    color: "#999",
    fontWeight: "400",
  },

  summaryBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#18351F",
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  freeDelivery: {
    fontSize: 12,
    color: "#777",
    maxWidth: 170,
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5EAE5",
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#18351F",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#176B35",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E3E8E3",
  },

  checkoutButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#176B35",
    justifyContent: "center",
    alignItems: "center",
  },

  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#18351F",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: "#667067",
    textAlign: "center",
    marginBottom: 24,
  },

  shopButton: {
    backgroundColor: "#176B35",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});