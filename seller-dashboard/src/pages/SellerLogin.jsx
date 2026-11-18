import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SellerLogin() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const maskedPhone =
        phone.length === 10
            ? `******${phone.slice(-4)}`
            : phone;

    const generateOtp = async () => {
        const response = await api.post(
            "/auth/login",
            { phone }
        );

        const generatedOtp =
            response.data.developmentOtp;

        if (generatedOtp) {
            alert(
                `OTP sent. Development OTP: ${generatedOtp}`
            );
        }

        setOtp("");
    };

    const sendOtp = async (e) => {
        e.preventDefault();

        if (!phone) {
            setMessage("Please enter your phone number");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            setMessage(
                "Please enter a valid 10-digit phone number"
            );
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            await generateOtp();

            setStep(2);

        } catch (error) {
            console.error(
                "Failed to generate OTP:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to send OTP"
            );

        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        try {
            setResending(true);
            setMessage("");

            await generateOtp();

            setMessage("A new OTP has been generated.");

        } catch (error) {
            console.error(
                "Failed to resend OTP:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to resend OTP"
            );

        } finally {
            setResending(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();

        if (!otp) {
            setMessage("Please enter the OTP");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setMessage(
                "Please enter a valid 6-digit OTP"
            );
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await api.post(
                "/auth/verify-otp",
                {
                    phone,
                    otp
                }
            );

            const token = response.data.token;

            if (!token) {
                setMessage(
                    "Login failed: token not received"
                );
                return;
            }

            localStorage.setItem(
                "next360-token",
                token
            );

            navigate("/dashboard");

        } catch (error) {
            console.error(
                "OTP verification failed:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Invalid OTP"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-login-page">

            <div className="seller-login-card">

                <h1>Next360</h1>

                <h2>Seller Login</h2>

                {step === 1 ? (

                    <form onSubmit={sendOtp}>

                        <label>
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength="10"
                            placeholder="Enter 10-digit phone number"
                            value={phone}
                            onChange={(e) =>
                                setPhone(
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Generating..."
                                : "Generate OTP"}
                        </button>

                    </form>

                ) : (

                    <form onSubmit={verifyOtp}>

                        <div className="otp-sent-info">
                            <span>OTP sent to</span>

                            <strong>
                                {maskedPhone}
                            </strong>
                        </div>

                        <label>
                            Enter OTP
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) =>
                                setOtp(
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify OTP"}
                        </button>

                        <div className="resend-otp">
                            <span>
                                Didn't receive the OTP?
                            </span>

                            <button
                                type="button"
                                className="resend-otp-button"
                                onClick={resendOtp}
                                disabled={resending}
                            >
                                {resending
                                    ? "Resending..."
                                    : "Resend OTP"}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setOtp("");
                                setMessage("");
                            }}
                        >
                            Change Phone Number
                        </button>

                    </form>

                )}

                {message && (
                    <p className="login-message">
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

export default SellerLogin;