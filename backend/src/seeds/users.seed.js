// backend/src/seeds/users.seed.js
import User from "../models/User.js";

export const seedUsers = async () => {
  const users = [
    {
      email: "admin@codezy.com",
      password: "Admin@123",
      username: "admin",
      fullName: "Admin User",
      role: "admin",
      skillLevel: "advanced",
      isEmailVerified: true,
    },
    {
      email: "john.doe@example.com",
      password: "User@123",
      username: "johndoe",
      fullName: "John Doe",
      role: "learner",
      skillLevel: "beginner",
      isEmailVerified: true,
      statistics: {
        totalScore: 450,
        problemsSolved: 15,
        duelsWon: 3,
        duelsLost: 2,
        eloRating: 1250,
      },
    },
    {
      email: "jane.smith@example.com",
      password: "User@123",
      username: "janesmith",
      fullName: "Jane Smith",
      role: "learner",
      skillLevel: "intermediate",
      isEmailVerified: true,
      statistics: {
        totalScore: 850,
        problemsSolved: 35,
        duelsWon: 12,
        duelsLost: 5,
        eloRating: 1450,
      },
    },
    {
      email: "alex.wong@example.com",
      password: "User@123",
      username: "alexwong",
      fullName: "Alex Wong",
      role: "learner",
      skillLevel: "advanced",
      isEmailVerified: true,
      statistics: {
        totalScore: 1650,
        problemsSolved: 78,
        duelsWon: 45,
        duelsLost: 12,
        eloRating: 1750,
      },
    },
  ];

  await User.insertMany(users);
  console.log("✅ Users seeded successfully");
};
