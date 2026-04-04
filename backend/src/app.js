import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import LoginRoutes from "./routes/LoginRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import problemROUTES from "./routes/problem.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import userRoutes from "./routes/UserRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Routes
app.use("/api", LoginRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/problems", problemROUTES);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/", (req, res) => {
  res.send("Backend API is Running 🚀");
});

// ✅ Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ EXPORT BOTH
export { app, server };