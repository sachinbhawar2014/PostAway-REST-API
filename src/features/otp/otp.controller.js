import nodemailer from "nodemailer";
import dotenv from "dotenv";

import { hashPassword } from "../../utils/hashedpassword.js";
import { userModel } from "../users/users.schema.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// reset password this takes old password and new password.
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found", data: null });
    }
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    user.otpExpiry = Date.now() + 60000;

    await user.save();
    // Send the OTP via email
    const mailOptions = {
      from: `"PostAway" ${process.env.EMAIL_USERNAME}`,
      to: email,
      subject: "PostAway App Password Reset OTP",
      text: `Your OTP is: ${otp}. Valid for 60 seconds.`,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, msg: "OTP sent successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to send OTP", data: null });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    if (user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ success: false, msg: "Invalid OTP or OPT expired", data: null });
    }
    user.otp = null;
    user.otpVerified = true;
    await user.save();

    res.status(200).json({ success: true, msg: "Otp verified successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Error verifying otp", data: null });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    if (!user.otpVerified) {
      return res.status(400).json({ success: false, msg: "Invalid OTP or expired", data: null });
    }
    user.password = hashPassword(newPassword);
    user.otpVerified = false;
    await user.save();

    res.status(200).json({ success: true, msg: "Password updated successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Error updating password", data: null });
  }
};
