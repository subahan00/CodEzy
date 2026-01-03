// backend/src/seeds/quizzes.seed.js
import User from "../models/User.js";
import Content from "../models/Content.js";

export const seedQuizzes = async () => {
  const adminUser = await User.findOne({ role: "admin" });

  if (!adminUser) {
    console.warn("⚠️ No admin user found. Run seedUsers first.");
    return;
  }

  const quizzes = [
    {
      title: "Arrays Fundamentals Quiz",
      slug: "arrays-fundamentals-quiz",
      description: "Test your knowledge of array basics",
      contentType: "quiz",
      topic: "arrays",
      difficulty: "beginner",
      tags: ["quiz", "arrays", "basics"],
      quizQuestions: [
        {
          question:
            "What is the time complexity of accessing an element in an array by index?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
          correctAnswer: 0,
          explanation:
            "Array access by index is constant time O(1) because elements are stored contiguously.",
          points: 10,
        },
        {
          question: "Which of the following is true about arrays?",
          options: [
            "Arrays can store elements of different types",
            "Array size cannot be changed after creation in most languages",
            "Arrays provide O(1) insertion at any position",
            "Arrays are slower than linked lists for all operations",
          ],
          correctAnswer: 1,
          explanation:
            "In most languages, arrays have fixed size and require reallocation to resize.",
          points: 10,
        },
        {
          question:
            "What is the space complexity of an array storing n elements?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctAnswer: 2,
          explanation: "An array requires O(n) space to store n elements.",
          points: 10,
        },
      ],
      points: 30,
      estimatedTime: 10,
      createdBy: adminUser._id,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  await Content.insertMany(quizzes);
  console.log("✅ Quizzes seeded successfully");
};
