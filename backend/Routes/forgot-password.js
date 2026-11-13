import nodemailer from "nodemailer";
import dotEnv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";

const router = express.Router();
dotEnv.config();

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    let account = await User.findOne({ email });
    if (!account) {
      account = await Doctor.findOne({ email });
    }
    if (!account) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.APP_PASS,
      },
    });

    const clientUrl = process.env.CLIENT_SITE_URL || "http://localhost:5173";
    const mailOptions = {
      from: {
        name: "AI-PathLab",
        address: process.env.USER,
      },
      to: account.email,
      subject: "AI-PathLab Password Reset Link",
      text: `Click the link below to reset your password:\n${clientUrl}/reset-password/${account._id}/${token}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send password reset email." });
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "New password is required." });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let updated = await User.findByIdAndUpdate(id, { password: hash }, { new: true });
    if (!updated) {
      updated = await Doctor.findByIdAndUpdate(id, { password: hash }, { new: true });
    }
    if (!updated) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ message: "Invalid or expired reset link." });
  }
});

export default router;
