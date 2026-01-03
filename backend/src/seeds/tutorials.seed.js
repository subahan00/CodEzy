// backend/src/seeds/tutorials.seed.js
import User from "../models/User.js";
import Content from "../models/Content.js";

export const seedTutorials = async () => {
  const adminUser = await User.findOne({ role: "admin" });

  if (!adminUser) {
    console.warn("⚠️ No admin user found. Run seedUsers first.");
    return;
  }

  const tutorials = [
    {
      title: "Introduction to Arrays",
      slug:"introduction-to-arrays",
      description:
        "Learn the basics of arrays, one of the most fundamental data structures.",
      contentType: "tutorial",
      topic: "arrays",
      difficulty: "beginner",
      tags: ["data-structures", "basics", "arrays"],
      tutorialContent: {
        markdown: `# Introduction to Arrays

Arrays are fundamental data structures that store elements in contiguous memory locations.

## Key Concepts:
- Fixed or dynamic size
- Index-based access
- O(1) access time

## Common Operations:
1. Access: O(1)
2. Search: O(n)
3. Insert: O(n)
4. Delete: O(n)`,
        keyPoints: [
          "Arrays store elements of the same type",
          "Zero-based indexing in most languages",
          "Constant time access by index",
          "Linear time for search operations",
        ],
      },
      points: 50,
      estimatedTime: 15,
      createdBy: adminUser._id,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Understanding Recursion",
      slug:"understanding-recursion",
      description: "Master the art of recursive problem-solving.",
      contentType: "tutorial",
      topic: "recursion",
      difficulty: "intermediate",
      tags: ["algorithms", "recursion", "problem-solving"],
      tutorialContent: {
        markdown: `# Understanding Recursion

Recursion is a technique where a function calls itself to solve smaller instances of the same problem.

## Base Case
Every recursive function needs a base case to stop recursion.

## Recursive Case
The function calls itself with modified parameters.`,
        keyPoints: [
          "Must have a base case",
          "Each recursive call should move toward base case",
          "Can be replaced with iteration",
          "Watch for stack overflow",
        ],
      },
      points: 75,
      estimatedTime: 30,
      createdBy: adminUser._id,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  await Content.insertMany(tutorials);
  console.log("✅ Tutorials seeded successfully");
};
