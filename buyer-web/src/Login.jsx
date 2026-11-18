import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import api from "./services/api";

function Login({
    cartItems,
    isLoggedIn,
    setIsLoggedIn
}) {
    const navigate = useNavigate();

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [message, setMessage] = useState("");

    const maskedPhone =
        phone.length === 10
            ? `******${phone.slice(-4)}`
            : phone;

    const generateOtp = async () => {
        const response = await api.post(
            "/auth/login",
            {
                phone
            }
        );

        console.log(
            "OTP response:",
            response.data
        );

        if (response.data.developmentOtp) {
            alert(
                `OTP sent. Development OTP: ${response.data.developmentOtp}`
            );
        }

        setOtp("");
    };

    const handleSendOtp = async () => {
        if (!/^[6-9]\d{9}$/.test(phone)) {
            alert(
                "Please enter a valid 10-digit Indian mobile number."
            );
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            await generateOtp();

            setOtpSent(true);

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to send OTP."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setResending(true);
            setMessage("");

            await generateOtp();

            setMessage(
                "A new OTP has been generated."
            );

        } catch (error) {
            console.error(
                "Resend OTP error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to resend OTP."
            );

        } finally {
            setResending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Please enter the OTP.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            alert(
                "Please enter a valid 6-digit OTP."
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

            if (!response.data.token) {
                alert(
                    "Login failed: token not received."
                );
                return;
            }

            localStorage.setItem(
                "next360-token",
                response.data.token
            );

            setIsLoggedIn(true);

            alert("Login successful!");

            navigate("/");

        } catch (error) {
            console.error(
                "OTP verification error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Invalid OTP."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleChangePhone = () => {
        setPhone("");
        setOtp("");
        setOtpSent(false);
        setMessage("");
    };

    return (
        <>
            <Header
                cartItems={cartItems}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main className="login-page">

                <div className="login-card">

                    <h1>
                        Login to Next360
                    </h1>

                    <p>
                        Login with your mobile number
                    </p>

                    {!otpSent ? (

                        <>
                            <input
                                type="tel"
                                inputMode="numeric"
                                placeholder="Enter mobile number"
                                value={phone}
                                onChange={(e) =>
                                    setPhone(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                                maxLength="10"
                            />

                            <button
                                onClick={handleSendOtp}
                                disabled={loading}
                            >
                                {loading
                                    ? "Sending..."
                                    : "Send OTP"}
                            </button>
                        </>

                    ) : (

                        <>

                            <div className="otp-sent-info">

                                <span>
                                    OTP sent to
                                </span>

                                <strong>
                                    {maskedPhone}
                                </strong>

                            </div>

                            <input
                                type="text"
                                inputMode="numeric"
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
                                maxLength="6"
                            />

                            <button
                                onClick={
                                    handleVerifyOtp
                                }
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
                                    onClick={
                                        handleResendOtp
                                    }
                                    disabled={resending}
                                >
                                    {resending
                                        ? "Resending..."
                                        : "Resend OTP"}
                                </button>

                            </div>

                            <button
                                type="button"
                                className="change-phone-button"
                                onClick={
                                    handleChangePhone
                                }
                            >
                                Change Phone Number
                            </button>

                        </>
                    )}

                    {message && (
                        <p className="login-message">
                            {message}
                        </p>
                    )}

                </div>

            </main>
        </>
    );
}

export default Login;