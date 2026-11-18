import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import api from "../services/api";

type Order = {
  id: number;
  product_id: number;
  product_name?: string;
  product_image?: string;
  quantity: number;
  total_price: number | string;
  status: string;
  payment_status?: string;
  payment_method?: string;
  created_at?: string;
};

export default function OrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");

      const data = response.data;

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders(data?.orders || []);
      }
    } catch (error: any) {
      console.error(
        "Load orders error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        "Unable to load your orders.";

      Alert.alert("Orders", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PLACED":
        return styles.placedStatus;

      case "SHIPPED":
        return styles.shippedStatus;

      case "DELIVERED":
        return styles.deliveredStatus;

      case "CANCELLED":
        return styles.cancelledStatus;

      default:
        return styles.defaultStatus;
    }
  };

  const getPaymentStyle = (status?: string) => {
    switch (status) {
      case "PAID":
        return styles.paidStatus;

      case "FAILED":
        return styles.failedStatus;

      case "PENDING":
      default:
        return styles.pendingStatus;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#1F6B3A"
        />

        <Text style={styles.loadingText}>
          Loading your orders...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/explore")}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.title}>
          My Orders
        </Text>

        <Pressable
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshText}>
            ↻
          </Text>
        </Pressable>
      </View>

      {orders.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1F6B3A"
            />
          }
        >
          <Text style={styles.emptyIcon}>
            📦
          </Text>

          <Text style={styles.emptyTitle}>
            No Orders Yet
          </Text>

          <Text style={styles.emptyDescription}>
            Your completed orders will appear here.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.replace("/explore")}
          >
            <Text style={styles.shopButtonText}>
              Start Shopping
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1F6B3A"
            />
          }
        >
          <View style={styles.orderCountBox}>
            <Text style={styles.orderCountText}>
              {orders.length}{" "}
              {orders.length === 1
                ? "Order"
                : "Orders"}
            </Text>
          </View>

          {orders.map((order) => (
            <View
              key={order.id}
              style={styles.orderCard}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderLabel}>
                    Order #{order.id}
                  </Text>

                  <Text style={styles.date}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.status,
                    getStatusStyle(order.status),
                  ]}
                >
                  {order.status}
                </Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.productName}>
                {order.product_name ||
                  `Product #${order.product_id}`}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Quantity
                </Text>

                <Text style={styles.infoValue}>
                  {order.quantity}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Order Total
                </Text>

                <Text style={styles.total}>
                  ₹
                  {Number(
                    order.total_price || 0
                  ).toFixed(2)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Payment
                </Text>

                <Text
                  style={[
                    styles.paymentStatus,
                    getPaymentStyle(
                      order.payment_status
                    ),
                  ]}
                >
                  {order.payment_status ||
                    "PENDING"}
                </Text>
              </View>

              {order.payment_method && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    Method
                  </Text>

                  <Text style={styles.infoValue}>
                    {order.payment_method}
                  </Text>
                </View>
              )}

              <View style={styles.trackingBox}>
                <Text style={styles.trackingTitle}>
                  Order Tracking
                </Text>

                <View style={styles.trackingRow}>
                  <View
                    style={[
                      styles.dot,
                      order.status !== "CANCELLED" &&
                        styles.activeDot,
                    ]}
                  />

                  <Text style={styles.trackingText}>
                    Placed
                  </Text>

                  <Text style={styles.arrow}>
                    →
                  </Text>

                  <View
                    style={[
                      styles.dot,
                      (order.status === "SHIPPED" ||
                        order.status === "DELIVERED") &&
                        styles.activeDot,
                    ]}
                  />

                  <Text style={styles.trackingText}>
                    Shipped
                  </Text>

                  <Text style={styles.arrow}>
                    →
                  </Text>

                  <View
                    style={[
                      styles.dot,
                      order.status === "DELIVERED" &&
                        styles.activeDot,
                    ]}
                  />

                  <Text style={styles.trackingText}>
                    Delivered
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBF8",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FBF8",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#66806D",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1EAE3",
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  back: {
    fontSize: 38,
    lineHeight: 40,
    color: "#1F6B3A",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#173D25",
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
  },

  refreshText: {
    fontSize: 27,
    color: "#1F6B3A",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  orderCountBox: {
    marginBottom: 14,
  },

  orderCountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#66806D",
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E5DA",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  orderLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#173D25",
  },

  date: {
    fontSize: 13,
    color: "#66806D",
    marginTop: 4,
  },

  status: {
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },

  placedStatus: {
    backgroundColor: "#FFF3CD",
    color: "#856404",
  },

  shippedStatus: {
    backgroundColor: "#DDEEFF",
    color: "#245B8A",
  },

  deliveredStatus: {
    backgroundColor: "#E1F5E8",
    color: "#1F6B3A",
  },

  cancelledStatus: {
    backgroundColor: "#FDE2E2",
    color: "#B42318",
  },

  defaultStatus: {
    backgroundColor: "#EEEEEE",
    color: "#555555",
  },

  divider: {
    height: 1,
    backgroundColor: "#E8EEE9",
    marginVertical: 14,
  },

  productName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#173D25",
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
  },

  infoLabel: {
    fontSize: 14,
    color: "#66806D",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#173D25",
  },

  total: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F6B3A",
  },

  paymentStatus: {
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },

  paidStatus: {
    backgroundColor: "#E1F5E8",
    color: "#1F6B3A",
  },

  pendingStatus: {
    backgroundColor: "#FFF3CD",
    color: "#856404",
  },

  failedStatus: {
    backgroundColor: "#FDE2E2",
    color: "#B42318",
  },

  trackingBox: {
    marginTop: 14,
    backgroundColor: "#F5FAF6",
    borderRadius: 12,
    padding: 14,
  },

  trackingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#315B3D",
    marginBottom: 12,
  },

  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#C9D4CC",
  },

  activeDot: {
    backgroundColor: "#1F6B3A",
  },

  trackingText: {
    fontSize: 11,
    color: "#66806D",
    marginHorizontal: 4,
  },

  arrow: {
    fontSize: 14,
    color: "#9AAA9F",
    marginHorizontal: 2,
  },

  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#173D25",
  },

  emptyDescription: {
    fontSize: 15,
    color: "#66806D",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  shopButton: {
    backgroundColor: "#1F6B3A",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});