import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import UserModel from "../models/User.js";
import generateTokenAndSetCookies from "../utils/generateTokenAndSetCookies.js";
import { generateOTP } from "../utils/verifiacitonCode.js";
import { sendVerificationEmail, sendResetPasswordEmail, sendPasswordChangeSuccessEmail } from "../utils/Email.js";
import crypto from "crypto";

const router = express.Router();

// Test routes
router.get("/", (req, res) => {
  res.send("This is the auth");
});

router.get("/signup", (req, res) => {
  res.send("this is signup");
});

// ====================== SIGNUP =======================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // DB Down Fallback for Signup
    if (mongoose.connection.readyState !== 1) {
      console.log("[DB] MongoDB unreachable during signup. Granting temporary access.");
      const demoId = new mongoose.Types.ObjectId().toString();
      const token = generateTokenAndSetCookies(res, demoId, email, name);
      return res.status(201).json({
        id: demoId,
        name: name || "Demo User",
        email: email,
        message: "Demo Mode: Verification bypassed due to DB status",
        token: token,
      });
    }

    // Check user exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User Already Exists With This Email" });
    }

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateOTP();

    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      notificationsInbox: [
        {
          id: `welcome_${Date.now()}_1`,
          title: 'Welcome to AISA!',
          desc: 'Start your journey with your Artificial Intelligence Super Assistant. Need help? Ask us anything!',
          type: 'promo',
          time: new Date()
        },
        {
          id: `welcome_${Date.now()}_2`,
          title: 'AISA v2.4.0 is here!',
          desc: 'New features: Dynamic Accent Colors and improved Voice Synthesis are now live. Check them out in General settings.',
          type: 'update',
          time: new Date(Date.now() - 7200000)
        },
        {
          id: `welcome_${Date.now()}_3`,
          title: 'Plan Expiring Soon',
          desc: 'Your "Pro" plan will end in 3 days. Renew now to keep enjoying unlimited AI access.',
          type: 'alert',
          time: new Date(Date.now() - 3600000)
        },
      ]
    });

    // Generate token cookie
    const token = generateTokenAndSetCookies(res, newUser._id, newUser.email, newUser.name);


    // Send OTP email
    await sendVerificationEmail(newUser.email, newUser.name, newUser.verificationCode);

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      message: "Verification code sent successfully",
      token: token,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ====================== LOGIN =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // DB Down Fallback for Login
    if (mongoose.connection.readyState !== 1) {
      console.log("[DB] MongoDB unreachable during login. Granting temporary access.");
      const demoId = new mongoose.Types.ObjectId().toString();
      const token = generateTokenAndSetCookies(res, demoId, email, "Demo User");
      return res.status(201).json({
        id: demoId,
        name: "Demo User",
        email: email,
        message: "LogIn Successfully (Demo Mode)",
        token: token,
        role: "user"
      });
    }

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Account not found with this email" });
    }

    // Compare hashed password
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate token
    const token = generateTokenAndSetCookies(res, user._id, user.email, user.name);

    // Add welcome notifications if inbox is empty
    if (!user.notificationsInbox || user.notificationsInbox.length === 0) {
      user.notificationsInbox = [
        {
          id: `welcome_${Date.now()}_1`,
          title: 'Welcome to AISA!',
          desc: 'Start your journey with your Artificial Intelligence Super Assistant. Need help? Ask us anything!',
          type: 'promo',
          time: new Date()
        },
        {
          id: `welcome_${Date.now()}_2`,
          title: 'AISA v2.4.0 is here!',
          desc: 'New features: Dynamic Accent Colors and improved Voice Synthesis are now live. Check them out in General settings.',
          type: 'update',
          time: new Date(Date.now() - 7200000)
        },
        {
          id: `welcome_${Date.now()}_3`,
          title: 'Plan Expiring Soon',
          desc: 'Your "Pro" plan will end in 3 days. Renew now to keep enjoying unlimited AI access.',
          type: 'alert',
          time: new Date(Date.now() - 3600000)
        },
      ];
    }

    // Add "New Login" notification
    user.notificationsInbox.unshift({
      id: `login_${Date.now()}`,
      title: 'New Login Detected',
      desc: `Successfully logged in at ${new Date().toLocaleTimeString()}`,
      type: 'alert', // efficient check icon
      time: new Date(),
      isRead: false
    });

    // Limit inbox size
    if (user.notificationsInbox.length > 50) {
      user.notificationsInbox = user.notificationsInbox.slice(0, 50);
    }

    await user.save();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      message: "LogIn Successfully",
      token: token,
      role: user.role,
      notifications: user.notificationsInbox
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});


// ====================== FORGOT PASSWORD =======================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire time (1 hour)
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // Create reset URL
    // Assuming frontend runs on same domain or configure via env
    // For development, assuming localhost:5173 or similar.Ideally use env var for FRONTEND_URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendResetPasswordEmail(user.email, user.name, resetUrl);
      res.status(200).json({ message: "Email Sent Successfully" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ error: "Email could not be sent" });
    }

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error during forgot password" });
  }
});

// ====================== CHANGE PASSWORD (LOGGED IN) =======================
router.post("/reset-password-email", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    // Send notification email
    await sendPasswordChangeSuccessEmail(user.email, user.name);

    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ error: "Server error during password update" });
  }
});

// ====================== RESET PASSWORD =======================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if passwords match (optional, can be done in frontend too but good to verify)
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }


    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password Updated Successfully" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error during reset password" });
  }
});

// ====================== RESEND VERIFICATION CODE =======================
router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const verificationCode = generateOTP();
    user.verificationCode = verificationCode;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationCode);

    res.status(200).json({ message: "Verification code resent successfully" });

  } catch (err) {
    console.error("Resend Code Error:", err);
    res.status(500).json({ error: "Server error during resend code" });
  }
});

export default router;
