import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const registerUser = async (req, res) => {
  const { fullName, username, email, skillLevel, password } = req.body;

  try {
    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      fullName,
      username,
      email,
      skillLevel,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        skillLevel: user.skillLevel,
      },
      message: "User registered successfully",
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user_exist = await User.findOne({ email }).select("+password");

    if (!user_exist) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user_exist.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user_exist._id,
        role: user_exist.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      user: {
        id: user_exist._id,
        username: user_exist.username,
        email: user_exist.email,
        role: user_exist.role,
        skillLevel: user_exist.skillLevel,
      },
      token,
      message: "Login successful",
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getName = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.username);

  } catch (err) {
    console.error("GetName error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
const getUserData = async (req , res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).select("username email skillLevel");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch (err) {
    console.error("GetName error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export default {
  registerUser,
  loginUser,
  getName,
  getUserData,  
};
