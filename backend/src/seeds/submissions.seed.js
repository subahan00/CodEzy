// backend/src/seeds/submissions.seed.js
import User from "../models/User.js";
import Content from "../models/Content.js";
import Submission from "../models/Submission.js";

export const seedSubmissions = async () => {
  const user = await User.findOne({ username: "johndoe" });
  const challenge = await Content.findOne({ title: "Two Sum Problem" });

  if (!user || !challenge) {
    console.warn(
      "⚠️ Missing user or challenge. Make sure users and challenges are seeded first."
    );
    return;
  }

  const submissions = [
    {
      user: user._id,
      content: challenge._id,
      submissionType: "challenge",
      codeSubmission: {
        language: "javascript",
        sourceCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
          return [map.get(complement), i];
      }
      map.set(nums[i], i);
  }
}`,
        executionTime: 45,
        memoryUsed: 12.5,
      },
      status: "accepted",
      // Note: testCaseId assumes your testCases subdocs get _id from Mongoose
      testResults: [
        {
          testCaseId: challenge.challengeDetails.testCases[0]._id,
          passed: true,
          executionTime: 10,
        },
        {
          testCaseId: challenge.challengeDetails.testCases[1]._id,
          passed: true,
          executionTime: 12,
        },
      ],
      score: 100,
      maxScore: 100,
      aiFeedback: {
        correctness: {
          score: 10,
          comments: "Solution is correct and handles all edge cases.",
        },
        efficiency: {
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          score: 9,
          comments: "Excellent use of hash map for O(n) solution.",
        },
        codeQuality: {
          readability: 9,
          maintainability: 8,
          bestPractices: 9,
          comments: "Clean code with good variable naming.",
        },
        suggestions: [
          "Consider adding input validation",
          "Could add comments for clarity",
        ],
        overallRating: 9,
        generatedAt: new Date(),
      },
      attemptNumber: 1,
      isFirstSuccessfulSubmission: true,
    },
  ];

  await Submission.insertMany(submissions);
  console.log("✅ Submissions seeded successfully");
};
