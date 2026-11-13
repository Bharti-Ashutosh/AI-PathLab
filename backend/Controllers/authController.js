import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15d",
    }
  );
};

export const register = async (req, res) => {
  const { email, password, name, role = "patient", photo, gender } = req.body;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email, and password are required" });
    }

    if (!["patient", "doctor", "assistant"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Please select a valid role (Patient, Doctor, or Lab Assistant)" });
    }

    // Check duplicate email across both User and Doctor collections
    const existingUser = await User.findOne({ email });
    const existingDoctor = await Doctor.findOne({ email });

    if (existingUser || existingDoctor) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const validGender = ["male", "female", "other"].includes(gender)
      ? gender
      : "other";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    let newAccount = null;
    if (role === "doctor") {
      newAccount = new Doctor({
        name,
        email,
        password: hashPassword,
        photo,
        gender: validGender,
        role: "doctor",
        isApproved: "approved",
      });
    } else {
      // Both "patient" and "assistant" (Lab Assistant) live in UserSchema
      newAccount = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender: validGender,
        role,
      });
    }

    await newAccount.save();
    res
      .status(200)
      .json({ success: true, message: "User successfully created" });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Internal server error, Try again" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;

    const regularUser = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });
    const admin = await User.findOne({ email, role: "admin" });

    if (regularUser) {
      user = regularUser;
    }
    if (doctor) {
      user = doctor;
    }
    if (admin) {
      user = admin;
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid Credentials, try again" });
    }

    const token = generateToken(user);
    const { password: userPassword, role, appointments, ...rest } = user._doc;
    res.status(200).json({
      status: true,
      message: "Successfully login",
      token,
      data: { ...rest },
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to login" });
  }
};
