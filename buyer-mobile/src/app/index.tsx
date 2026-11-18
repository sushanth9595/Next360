import { useState, useEffect } from "react";

import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function LoginScreen() {
  useEffect(() => {
  const onBackPress = () => {
    return true;
  };

  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    onBackPress
  );

  return () => subscription.remove();
}, []);
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [loading, setLoading] = useState(false);

  const [developmentOtp, setDevelopmentOtp] = useState("");

  /* =====================================================
     SEND OTP
     ===================================================== */

  const handleSendOtp = async () => {
    const cleanedPhone = phone.replace(/\D/g, "");

    if (!cleanedPhone) {
      Alert.alert("Phone Number", "Please enter your phone number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        phone: cleanedPhone,
      });

      const generatedOtp = response.data?.developmentOtp;

      if (generatedOtp) {
        setDevelopmentOtp(String(generatedOtp));

        Alert.alert(
          "OTP Generated",
          `Development OTP: ${generatedOtp}`
        );
      }

      setStep("otp");
    } catch (error: any) {
      console.error("OTP request failed:", error);

      const message =
        error.response?.data?.message ||
        "Unable to send OTP. Please try again.";

      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     VERIFY OTP
     ===================================================== */

  const handleVerifyOtp = async () => {
    const cleanedPhone = phone.replace(/\D/g, "");
    const cleanedOtp = otp.replace(/\D/g, "");

    if (!/^\d{6}$/.test(cleanedOtp)) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-otp", {
        phone: cleanedPhone,
        otp: cleanedOtp,
      });

      const token = response.data?.token;

      if (!token) {
        Alert.alert(
          "Login Failed",
          "Token was not received from the server."
        );
        return;
      }

      /* Save JWT token */

      await AsyncStorage.setItem(
        "next360-token",
        token
      );

      /* Save user information if returned */

      if (response.data?.user) {
        await AsyncStorage.setItem(
          "next360-user",
          JSON.stringify(response.data.user)
        );
      }

      Alert.alert(
        "Login Successful",
        "Welcome to Next360!",
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/explore");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "OTP verification failed:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Invalid OTP. Please try again.";

      Alert.alert(
        "Verification Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CHANGE PHONE NUMBER
     ===================================================== */

  const handleChangePhone = () => {
    setOtp("");
    setDevelopmentOtp("");
    setStep("phone");
  };

  /* =====================================================
     PHONE SCREEN
     ===================================================== */

  if (step === "phone") {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <View style={styles.content}>

            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>
                🌿
              </Text>
            </View>

            <Text style={styles.brand}>
              Next360
            </Text>

            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Login with your mobile number to
              continue shopping.
            </Text>

            <View style={styles.card}>

              <Text style={styles.label}>
                Mobile Number
              </Text>

              <View style={styles.phoneInputContainer}>

                <Text style={styles.countryCode}>
                  +91
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#98A39C"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(text) =>
                    setPhone(
                      text.replace(/\D/g, "")
                    )
                  }
                />

              </View>

              <Pressable
                style={[
                  styles.button,
                  loading &&
                    styles.buttonDisabled,
                ]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading
                    ? "Sending OTP..."
                    : "Send OTP"}
                </Text>
              </Pressable>

              <Text style={styles.securityText}>
                🔒 Your phone number is used
                securely for login.
              </Text>

            </View>

            <Text style={styles.footer}>
              Shop trusted organic products
              with Next360
            </Text>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* =====================================================
     OTP SCREEN
     ===================================================== */

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View style={styles.content}>

          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>
              🔐
            </Text>
          </View>

          <Text style={styles.brand}>
            Next360
          </Text>

          <Text style={styles.title}>
            Verify OTP
          </Text>

          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to
          </Text>

          <Text style={styles.phoneText}>
            +91 {phone}
          </Text>

          <View style={styles.card}>

            <Text style={styles.label}>
              Enter OTP
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#98A39C"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) =>
                setOtp(
                  text.replace(/\D/g, "")
                )
              }
            />

            {developmentOtp ? (
              <View style={styles.developmentBox}>
                <Text
                  style={
                    styles.developmentLabel
                  }
                >
                  Development OTP
                </Text>

                <Text
                  style={
                    styles.developmentOtp
                  }
                >
                  {developmentOtp}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.button,
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleChangePhone}
              disabled={loading}
            >
              <Text style={styles.changePhone}>
                ← Change phone number
              </Text>
            </Pressable>

          </View>

          <Text style={styles.footer}>
            Secure login powered by Next360
          </Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
   ===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8F5",
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5F4E9",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },

  logoIcon: {
    fontSize: 34,
  },

  brand: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "800",
    color: "#176B3A",
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17221B",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#66736C",
    textAlign: "center",
    marginBottom: 8,
  },

  phoneText: {
    textAlign: "center",
    color: "#176B3A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,

    shadowColor: "#173D26",
    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.08,
    shadowRadius: 16,

    elevation: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#26342B",
    marginBottom: 9,
  },

  phoneInputContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#D9E4DD",
    borderRadius: 11,

    backgroundColor: "#FAFCFB",

    marginBottom: 18,
  },

  countryCode: {
    fontSize: 15,
    fontWeight: "700",
    color: "#176B3A",

    paddingLeft: 15,
    paddingRight: 10,

    borderRightWidth: 1,
    borderRightColor: "#D9E4DD",
  },

  input: {
    flex: 1,
    height: "100%",

    paddingHorizontal: 12,

    fontSize: 16,
    color: "#17221B",
  },

  otpInput: {
    height: 58,

    borderWidth: 1,
    borderColor: "#D9E4DD",
    borderRadius: 11,

    backgroundColor: "#FAFCFB",

    textAlign: "center",

    letterSpacing: 8,

    fontSize: 24,
    fontWeight: "800",

    color: "#17221B",

    marginBottom: 18,
  },

  button: {
    height: 54,

    borderRadius: 11,

    backgroundColor: "#176B3A",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 16,
    fontWeight: "800",
  },

  securityText: {
    textAlign: "center",

    color: "#7A877F",

    fontSize: 12,

    lineHeight: 18,
  },

  developmentBox: {
    padding: 12,

    marginBottom: 16,

    borderRadius: 10,

    backgroundColor: "#FFF7E5",

    borderWidth: 1,
    borderColor: "#F0D99A",

    alignItems: "center",
  },

  developmentLabel: {
    color: "#8A6500",

    fontSize: 11,

    fontWeight: "700",

    marginBottom: 3,
  },

  developmentOtp: {
    color: "#7A5700",

    fontSize: 22,

    fontWeight: "900",

    letterSpacing: 3,
  },

  changePhone: {
    textAlign: "center",

    color: "#176B3A",

    fontSize: 13,

    fontWeight: "700",

    paddingVertical: 6,
  },

  footer: {
    textAlign: "center",

    marginTop: 28,

    color: "#7A877F",

    fontSize: 12,
  },
});