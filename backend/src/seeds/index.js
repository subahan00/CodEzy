// backend/src/seeds/index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { seedUsers } from "./users.seed.js";
import { seedTutorials } from "./tutorials.seed.js";
import { seedQuizzes } from "./quizzes.seed.js";
import { seedChallenges } from "./challenges.seed.js";
import { seedSubmissions } from "./submissions.seed.js";

import Duel from "../models/Duel.js";
import Notification from "../models/Notification.js";
import Leaderboard from "../models/Leaderboard.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import Submission from "../models/Submission.js";

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1/CodEzy";
    console.log("Connecting to:", uri);

    await mongoose.connect(uri);
    console.log("📦 Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Content.deleteMany({}),
      Submission.deleteMany({}),
      Duel.deleteMany({}),
      Notification.deleteMany({}),
      Leaderboard.deleteMany({}),
    ]);

    console.log("🗑️  Cleared existing data");

    // Run seeds in order
    await seedUsers();
    await seedTutorials();
    await seedQuizzes();
    await seedChallenges();
    await seedSubmissions();

    console.log("🎉 Database seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run directly via `node src/seeds/index.js`
if (process.argv[1].includes("index.js")) {
  seedDatabase();
}

export default seedDatabase;
