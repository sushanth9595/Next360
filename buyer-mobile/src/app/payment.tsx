import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

type CartItem = {
  id: number;
  name: string;
  price: number | string;
  quantity: number;
  stock?: number;
  image_url?: string;
};

export default function PaymentScreen() {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("next360-cart");

      if (!storedCart) {
        setCart([]);
        setTotal(0);
        return;
      }

      const parsedCart: CartItem[] = JSON.parse(storedCart);

      setCart(parsedCart);

      const cartTotal = parsedCart.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) * Number(item.quantity || 0),
        0
      );

      setTotal(cartTotal);
    } catch (error) {
      console.error("Load cart error:", error);
      Alert.alert("Error", "Unable to load your cart.");
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert(
        "Select Payment",
        "Please select a payment method."
      );
      return;
    }

    if (cart.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Your cart is empty."
      );
      return;
    }

    try {
      setProcessing(true);

      /*
       * STEP 1
       * Create development/test payment order
       */
      const paymentResponse = await api.post(
        "/payments/create-order",
        {
          amount: total,
          receipt: `next360_test_${Date.now()}`,
        }
      );

      const testPaymentOrder =
        paymentResponse.data?.order;

      if (!testPaymentOrder) {
        throw new Error(
          "Payment order was not created."
        );
      }

      /*
       * STEP 2
       * Create backend orders.
       *
       * Your current backend supports one
       * product per order, so each cart item
       * becomes a separate order.
       */
      const createdOrders: any[] = [];

      for (const item of cart) {
        const itemTotal =
          Number(item.price || 0) *
          Number(item.quantity || 0);

        const orderResponse = await api.post(
          "/orders",
          {
            productId: item.id,
            quantity: item.quantity,
            totalPrice: itemTotal,
          }
        );

        const createdOrder =
          orderResponse.data?.order?.order ||
          orderResponse.data?.order;

        if (!createdOrder?.id) {
          throw new Error(
            `Order could not be created for ${item.name}.`
          );
        }

        createdOrders.push(createdOrder);
      }

      /*
       * STEP 3
       * Mark each created order as PAID
       * in development/test mode.
       */
      for (const order of createdOrders) {
        await api.put(
          "/payments/update-status",
          {
            orderId: order.id,
            paymentStatus: "PAID",
            paymentId: testPaymentOrder.id,
            paymentMethod,
          }
        );
      }

      /*
       * STEP 4
       * Clear cart after successful payment.
       */
      await AsyncStorage.removeItem(
        "next360-cart"
      );

      Alert.alert(
        "Order Successful 🎉",
        `Your payment was successful.\n\nTotal: ₹${total.toFixed(
          2
        )}\nPayment: ${paymentMethod}`,
        [
          {
            text: "View Orders",
            onPress: () => router.replace("/orders"),
          },
          {
            text: "Continue Shopping",
            onPress: () => router.replace("/explore"),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "Payment/order error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Payment failed. Please try again.";

      Alert.alert(
        "Payment Failed",
        message
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          disabled={processing}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.title}>
          Payment
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <Text style={styles.sectionTitle}>
        Select Payment Method
      </Text>

      <Pressable
        style={[
          styles.paymentOption,
          paymentMethod === "UPI" &&
            styles.selectedOption,
        ]}
        onPress={() => setPaymentMethod("UPI")}
        disabled={processing}
      >
        <Text style={styles.icon}>📱</Text>

        <View>
          <Text style={styles.optionTitle}>
            UPI
          </Text>

          <Text style={styles.optionDescription}>
            Pay using UPI
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={[
          styles.paymentOption,
          paymentMethod === "Card" &&
            styles.selectedOption,
        ]}
        onPress={() => setPaymentMethod("Card")}
        disabled={processing}
      >
        <Text style={styles.icon}>💳</Text>

        <View>
          <Text style={styles.optionTitle}>
            Credit / Debit Card
          </Text>

          <Text style={styles.optionDescription}>
            Pay securely using your card
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={[
          styles.paymentOption,
          paymentMethod === "Cash on Delivery" &&
            styles.selectedOption,
        ]}
        onPress={() =>
          setPaymentMethod("Cash on Delivery")
        }
        disabled={processing}
      >
        <Text style={styles.icon}>💵</Text>

        <View>
          <Text style={styles.optionTitle}>
            Cash on Delivery
          </Text>

          <Text style={styles.optionDescription}>
            Pay when your order arrives
          </Text>
        </View>
      </Pressable>

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>
          Order Total
        </Text>

        <Text style={styles.total}>
          ₹{total.toFixed(2)}
        </Text>
      </View>

      <Pressable
        style={[
          styles.payButton,
          processing && styles.disabledButton,
        ]}
        onPress={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <>
            <ActivityIndicator color="#FFFFFF" />

            <Text style={styles.payButtonText}>
              Processing...
            </Text>
          </>
        ) : (
          <Text style={styles.payButtonText}>
            Pay ₹{total.toFixed(2)}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBF8",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  back: {
    fontSize: 38,
    color: "#1F6B3A",
    lineHeight: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#173D25",
  },

  headerSpace: {
    width: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#173D25",
    marginBottom: 16,
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E5DA",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },

  selectedOption: {
    borderWidth: 2,
    borderColor: "#1F6B3A",
    backgroundColor: "#EAF7EE",
  },

  icon: {
    fontSize: 28,
    marginRight: 16,
  },

  optionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#173D25",
  },

  optionDescription: {
    fontSize: 13,
    color: "#66806D",
    marginTop: 4,
  },

  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EAF7EE",
    borderRadius: 14,
    padding: 18,
    marginTop: 10,
    marginBottom: 20,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#315B3D",
  },

  total: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F6B3A",
  },

  payButton: {
    backgroundColor: "#1F6B3A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },

  disabledButton: {
    opacity: 0.7,
  },

  payButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});