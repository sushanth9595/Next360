const userModel = require("../models/userModel");
const generateToken = require("../utils/jwt");

// Temporary OTP storage
const otpStore = {};

const login = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                message: "Phone number is required"
            });
        }

        // Generate temporary 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Store OTP
        otpStore[phone] = otp;

        console.log(`OTP for ${phone}: ${otp}`);

        res.json({
            message: "OTP generated successfully",
            phone: phone,
            developmentOtp: otp
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                message: "Phone and OTP are required"
            });
        }

        if (Number(otp) !== otpStore[phone]) {
            return res.status(401).json({
                message: "Invalid OTP"
            });
        }

        let user = await userModel.findUserByPhone(phone);

        if (!user) {
            user = await userModel.createUser(phone);
        }

        delete otpStore[phone];

         // Generate JWT token
        const token = generateToken(user);

          res.json({
          message: "OTP verified successfully",
          token: token,
          user: user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "OTP verification failed"
        });
    }
};

module.exports = {
    login,
    verifyOtp
};