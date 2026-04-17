import mongoose from "mongoose";
import User from "../../models/User.js";
import Submission from "../../models/submission.model.js";
export const getMySubmission = async (req, res) => {
  try {

    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const submissions = await Submission.find({ user: userId }).populate("content", "title slug");

    res.status(200).json(submissions);
  } catch (error) {
    console.error("GET MY SUBMISSIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    
    const userId = req.user.userId;
    const { avatar, bio, github, linkedin } = req.body;

    // Find the user and update their fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: avatar || "",
          bio: bio || "",
          "socialLinks.github": github || "",
          "socialLinks.linkedin": linkedin || ""
        }
      },
      { new: true, runValidators: true }
    ).select('-password'); // Don't return the password!

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    const submissions = await Submission.find({ user: userId })
      .populate('content', 'title slug difficulty tags')
      .sort({ createdAt: 1 }); // oldest first for charts

    // ── 1. BASIC COUNTS ──
    const totalSubmissions = submissions.length;
    const accepted = submissions.filter(s => s.status === 'accepted');
    const failed = submissions.filter(s => s.status !== 'accepted');
    const acceptanceRate = totalSubmissions > 0
      ? ((accepted.length / totalSubmissions) * 100).toFixed(1)
      : 0;

    // ── 2. DIFFICULTY BREAKDOWN ──
    const uniqueSolved = new Map();
    accepted.forEach(s => {
      if (s.content && !uniqueSolved.has(s.content._id.toString())) {
        uniqueSolved.set(s.content._id.toString(), s.content);
      }
    });

    const solvedByDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };
    uniqueSolved.forEach(problem => {
      const d = problem.difficulty?.toLowerCase();
      if (solvedByDifficulty[d] !== undefined) solvedByDifficulty[d]++;
    });

    // ── 3. CUMULATIVE SOLVED OVER TIME (journey chart) ──
    const solvedSet = new Set();
    const cumulativeJourney = [];
    submissions.forEach(s => {
      if (s.status === 'accepted' && s.content) {
        const id = s.content._id.toString();
        if (!solvedSet.has(id)) {
          solvedSet.add(id);
          cumulativeJourney.push({
            date: s.createdAt,
            count: solvedSet.size,
            problem: s.content.title
          });
        }
      }
    });

    // ── 4. WEEKLY VELOCITY (last 8 weeks) ──
    const weeklyVelocity = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const solved = submissions.filter(s =>
        s.status === 'accepted' &&
        new Date(s.createdAt) >= weekStart &&
        new Date(s.createdAt) < weekEnd
      ).length;

      weeklyVelocity.push({
        week: `W${8 - i}`,
        solved,
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    // ── 5. LANGUAGE BREAKDOWN ──
    const langCounts = {};
    submissions.forEach(s => {
      const lang = s.codeSubmission?.language || 'unknown';
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });

    // ── 6. SKILL MASTERY (from user.skills Map) ──
    const skillMastery = user.skills
      ? Object.entries(Object.fromEntries(user.skills))
          .sort((a, b) => b[1] - a[1])
      : [];

    // ── 7. SKILLS CLOSE TO UNLOCK (60-79 mastery) ──
    const nearUnlock = skillMastery.filter(([, v]) => v >= 60 && v < 80);

    // ── 8. FAILURE PROFILE ──
    const failureProfile = user.failureProfile
      ? Object.fromEntries(user.failureProfile)
      : {};

    // ── 9. HARDEST PROBLEM SOLVED ──
    const difficultyRank = { advanced: 3, intermediate: 2, beginner: 1 };
    let hardestSolved = null;
    let hardestRank = 0;
    uniqueSolved.forEach(problem => {
      const rank = difficultyRank[problem.difficulty?.toLowerCase()] || 0;
      if (rank > hardestRank) {
        hardestRank = rank;
        hardestSolved = problem;
      }
    });

    // ── 10. ACTIVE DAYS LAST 30 ──
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeDaysSet = new Set(
      submissions
        .filter(s => new Date(s.createdAt) >= thirtyDaysAgo)
        .map(s => new Date(s.createdAt).toISOString().split('T')[0])
    );
    const activeDaysLast30 = activeDaysSet.size;

    // ── 11. RECOMMENDATION ──
    // Dynamically import to avoid circular deps
    const { getRecommendedProblem } = await import(
      '../../services/recommendation/recommendation.service.js'
    );
    let recommendation = null;
    try {
      recommendation = await getRecommendedProblem(userId);
    } catch (e) {
      console.error('[Analytics] Recommendation failed:', e.message);
    }

    // ── 12. SKILL GRAPH (prerequisite map for unlock viz) ──
    const SKILL_GRAPH = {
      'dp': ['recursion'],
      'graphs': ['trees', 'matrices'],
      'trees': ['linked-list'],
      'backtracking': ['recursion'],
      'binary-search': ['arrays'],
    };

    res.status(200).json({
      success: true,
      data: {
        // User info
        username: user.username,
        rank: user.statistics?.rank || 'Beginner',
        totalScore: user.statistics?.totalScore || 0,
        currentStreak: user.statistics?.currentStreak || 0,
        longestStreak: user.statistics?.longestStreak || 0,

        // Submission stats
        totalSubmissions,
        totalAccepted: accepted.length,
        totalFailed: failed.length,
        acceptanceRate: parseFloat(acceptanceRate),
        totalSolved: uniqueSolved.size,

        // Difficulty
        solvedByDifficulty,

        // Charts
        cumulativeJourney,
        weeklyVelocity,

        // Skills
        skillMastery,
        nearUnlock,
        skillGraph: SKILL_GRAPH,

        // Failure analysis
        failureProfile,

        // Extras
        languageBreakdown: langCounts,
        hardestSolved,
        activeDaysLast30,

        // Recommendation
        recommendation
      }
    });
  } catch (error) {
    console.error('GET ANALYTICS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getMySubmission,
  updateProfile,
  getAnalytics
};
