import express from "express";
import { resetPassword, sendOtp, verifyOtp } from "./otp.controller.js";
const otpRouter = express.Router();

otpRouter.route("/send").post(sendOtp);
otpRouter.route("/verify").post(verifyOtp);
otpRouter.route("/reset-password").post(resetPassword);

export default otpRouter;
