import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI;
    console.log("Database URI:", dbURI);
    
    if (!dbURI) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }

    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

export default connectDB;
