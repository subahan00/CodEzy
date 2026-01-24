import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import LoginRoutes from "./routes/LoginRoutes.js"
import aiRoutes from "./routes/aiRoutes.js";
import problemROUTES from "./routes/problem.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import userRoutes from "./routes/UserRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";  
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api",LoginRoutes);
app.use("/api/ai", aiRoutes);
app.get("/", (req, res) => {
  res.send("Backend API is Running 🚀");
});
app.use("/api/problems", problemROUTES);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);  
app.use("/api/leaderboard", leaderboardRoutes); 
export default app;
