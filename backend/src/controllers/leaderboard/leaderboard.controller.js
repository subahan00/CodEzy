import Submission from '../../models/submission.model.js';
import User from '../../models/User.js'; // Adjust path to your User model

export const getLeaderboard = async (req, res) => {
  try {
    // 1. Aggregate Accepted Submissions
    const leaderboard = await Submission.aggregate([
      // A. Only look at accepted submissions
      { $match: { status: 'accepted' } }, 
      
      // B. Group by User + Problem (Remove duplicate solves for same problem)
      { 
        $group: { 
          _id: { user: "$user", content: "$content" },
          lastSolvedAt: { $min: "$createdAt" } // Keep track of time for tie-breaking later
        } 
      },

      // C. Group by User again to count UNIQUE solved problems
      {
        $group: {
          _id: "$_id.user",
          solvedCount: { $sum: 1 },
          lastActivity: { $max: "$lastSolvedAt" }
        }
      },

      // D. Sort: More solved = Higher rank
      { $sort: { solvedCount: -1, lastActivity: 1 } },

      // E. Limit to Top 50 (Performance)
      { $limit: 50 },

      // F. Join with User table to get Username/Email
      {
        $lookup: {
          from: "users", // NOTE: Check your MongoDB collection name (usually 'users')
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },

      // G. Clean up the output
      {
        $project: {
          username: { $arrayElemAt: ["$userInfo.username", 0] },
          email: { $arrayElemAt: ["$userInfo.email", 0] },
          solvedCount: 1
        }
      }
    ]);

    res.json({ success: true, data: leaderboard });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};