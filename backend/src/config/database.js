import mongoose from "mongoose";

const dbURI = process.env.MONGODB_URI;
console.log("Database URI:", dbURI);
const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

export default connectDB;
