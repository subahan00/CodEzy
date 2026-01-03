// backend/src/seeds/challenges.seed.js
import User from "../models/User.js";
import Content from "../models/Content.js";

export const seedChallenges = async () => {
  const adminUser = await User.findOne({ role: "admin" });

  if (!adminUser) {
    console.warn("⚠️ No admin user found. Run seedUsers first.");
    return;
  }

  const challenges = [
    {
      title: "Two Sum Problem",
      slug: "two-sum-problem",
      description: "Find two numbers in an array that add up to a target value.",
      contentType: "challenge",
      topic: "arrays",
      difficulty: "beginner",
      tags: ["arrays", "hash-map", "easy"],
      challengeDetails: {
        problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        inputFormat:
          "First line: array of integers\nSecond line: target integer",
        outputFormat: "Two indices separated by space",
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists",
        ],
        examples: [
          {
            input: "[2,7,11,15]\n9",
            output: "0 1",
            explanation:
              "Because nums[0] + nums[1] == 9, we return [0, 1].",
          },
          {
            input: "[3,2,4]\n6",
            output: "1 2",
            explanation: "nums[1] + nums[2] == 6",
          },
        ],
        testCases: [
          {
            input: "[2,7,11,15]\n9",
            expectedOutput: "0 1",
            isHidden: false,
            points: 25,
          },
          {
            input: "[3,2,4]\n6",
            expectedOutput: "1 2",
            isHidden: false,
            points: 25,
          },
          {
            input: "[3,3]\n6",
            expectedOutput: "0 1",
            isHidden: true,
            points: 25,
          },
          {
            input: "[-1,-2,-3,-4,-5]\n-8",
            expectedOutput: "2 4",
            isHidden: true,
            points: 25,
          },
        ],
        starterCode: [
          {
            language: "javascript",
            code: "function twoSum(nums, target) {\n    // Your code here\n}",
          },
          {
            language: "python",
            code: "def twoSum(nums, target):\n    # Your code here\n    pass",
          },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
      },
      points: 100,
      estimatedTime: 20,
      createdBy: adminUser._id,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Reverse a String",
      slug: "reverse-a-string",
      description: "Write a function to reverse a string.",
      contentType: "challenge",
      topic: "strings",
      difficulty: "beginner",
      tags: ["strings", "basics", "easy"],
      challengeDetails: {
        problemStatement:
          "Write a function that reverses a string. The input string is given as an array of characters.",
        inputFormat: "A string",
        outputFormat: "The reversed string",
        constraints: [
          "1 <= s.length <= 10^5",
          "s consists of printable ASCII characters",
        ],
        examples: [
          {
            input: "hello",
            output: "olleh",
            explanation:
              'The string "hello" becomes "olleh" when reversed.',
          },
        ],
        testCases: [
          {
            input: "hello",
            expectedOutput: "olleh",
            isHidden: false,
            points: 50,
          },
          {
            input: "CodEzy",
            expectedOutput: "yzEdoC",
            isHidden: true,
            points: 50,
          },
        ],
        starterCode: [
          {
            language: "javascript",
            code: "function reverseString(s) {\n    // Your code here\n}",
          },
        ],
        timeLimit: 1000,
        memoryLimit: 128,
      },
      points: 50,
      estimatedTime: 10,
      createdBy: adminUser._id,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Binary Search Implementation",
      description: "Implement binary search algorithm on a sorted array.",
      contentType: "challenge",
      topic: "searching",
      difficulty: "intermediate",
      tags: ["binary-search", "algorithms", "searching"],
      challengeDetails: {
        problemStatement:
          "Given a sorted array of integers and a target value, return the index if the target is found. If not, return -1.",
        inputFormat:
          "First line: sorted array\nSecond line: target value",
        outputFormat: "Index of target or -1",
        constraints: [
          "1 <= nums.length <= 10^4",
          "-10^4 < nums[i], target < 10^4",
          "All integers in nums are unique",
          "nums is sorted in ascending order",
        ],
        examples: [
          {
            input: "[-1,0,3,5,9,12]\n9",
            output: "4",
            explanation: "9 exists in nums and its index is 4",
          },
        ],
        testCases: [
          {
            input: "[-1,0,3,5,9,12]\n9",
            expectedOutput: "4",
            isHidden: false,
            points: 33,
          },
          {
            input: "[-1,0,3,5,9,12]\n2",
            expectedOutput: "-1",
            isHidden: false,
            points: 33,
          },
          {
            input: "[5]\n5",
            expectedOutput: "0",
            isHidden: true,
            points: 34,
          },
        ],
        starterCode: [
          {
            language: "javascript",
            code: "function binarySearch(nums, target) {\n    // Your code here\n}",
          },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
      },
      points: 150,
      estimatedTime: 25,
      createdBy: adminUser._id,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  await Content.insertMany(challenges);
  console.log("✅ Challenges seeded successfully");
};
