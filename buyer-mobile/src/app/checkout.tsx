import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CheckoutScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [cartTotal, setCartTotal] = useState(0);

  useMemo(() => {
    AsyncStorage.getItem("next360-cart").then((storedCart) => {
      if (!storedCart) return;

      try {
        const cart = JSON.parse(storedCart);

        const total = cart.reduce(
          (sum: number, item: any) =>
            sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        );

        setCartTotal(total);
      } catch (error) {
        console.error("Checkout cart error:", error);
      }
    });
  }, []);

  const handleContinue = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number.");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Required", "Please enter your address.");
      return;
    }

    if (!city.trim()) {
      Alert.alert("Required", "Please enter your city.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode.");
      return;
    }

    router.push("/payment");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Checkout</Text>

          <View style={styles.headerSpace} />
        </View>

        <Text style={styles.sectionTitle}>Delivery Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Full Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />

        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Order Total</Text>

          <Text style={styles.total}>
            ₹{cartTotal.toFixed(2)}
          </Text>
        </View>

        <Pressable
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            Continue to Payment
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E5DA",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    color: "#173D25",
  },

  addressInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  summary: {
    backgroundColor: "#EAF7EE",
    borderRadius: 14,
    padding: 18,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#315B3D",
  },

  total: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F6B3A",
  },

  continueButton: {
    backgroundColor: "#1F6B3A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});