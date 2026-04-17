import User from '../../models/User.js';
import Content from '../../models/Content.model.js';

const DIFFICULTY_CAPS = { 'beginner': 5, 'intermediate': 10, 'advanced': 20 };
const PERFORMANCE_SCORES = {
  'accepted': 1.0,
  'wrong-answer': -0.3,
  'time-limit-exceeded': -0.3,
  'runtime-error': -0.3
};

const PREREQ_THRESHOLD = 40;
const SKILL_GRAPH = {
  'dp': ['recursion'],
  'graphs': ['trees', 'matrices'],
  'trees': ['linked-list'],
  'backtracking': ['recursion'],
  'binary-search': ['arrays'],
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const updateSkillMastery = async (userId, problemId, status) => {
  const user = await User.findById(userId);
  const problem = await Content.findById(problemId);

  if (!user || !problem || !problem.tags) return;

  const perfScore = PERFORMANCE_SCORES[status] || -0.1;
  const difficulty = problem.difficulty?.toLowerCase() || 'beginner';
  const maxGain = DIFFICULTY_CAPS[difficulty] || 5;

  const baseScore = perfScore * maxGain;
  const delta = clamp(baseScore, -5, maxGain);

  // Initialize Maps if they don't exist yet
  if (!user.skills) user.skills = new Map();
  if (!user.lastPracticed) user.lastPracticed = new Map();

  problem.tags.forEach(tag => {
    const currentMastery = user.skills.get(tag) || 0;
    const newMastery = clamp(currentMastery + delta, 0, 100);
    user.skills.set(tag, newMastery);
    user.lastPracticed.set(tag, new Date());
  });

  if (status === 'accepted') {
    // Use solvedProblems array (new field) for the engine's deduplication
    if (!user.solvedProblems) user.solvedProblems = [];

    const alreadySolved = user.solvedProblems.some(
      id => id.toString() === problem._id.toString()
    );

    if (!alreadySolved) {
      user.solvedProblems.push(problem._id);

      // ✅ Correct field name: statistics.problemsSolved (not totalSolved)
      if (!user.statistics) user.statistics = {};
      user.statistics.problemsSolved = (user.statistics.problemsSolved || 0) + 1;

      // Also push to learningProgress.completedChallenges (already in schema)
      if (!user.learningProgress) user.learningProgress = {};
      if (!user.learningProgress.completedChallenges) {
        user.learningProgress.completedChallenges = [];
      }
      const notAlreadyInProgress = !user.learningProgress.completedChallenges.some(
        id => id.toString() === problem._id.toString()
      );
      if (notAlreadyInProgress) {
        user.learningProgress.completedChallenges.push(problem._id);
      }
    }
  }

  await user.save();
};

export const getRecommendedProblem = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // ✅ Use solvedProblems (new field), with fallback to completedChallenges
  const solvedProblemIds = user.solvedProblems?.length
    ? user.solvedProblems
    : (user.learningProgress?.completedChallenges || []);

  // ── PHASE 1: COLD START ──
  // ✅ Correct field name: statistics.problemsSolved
  if (!user.statistics?.problemsSolved || user.statistics.problemsSolved < 3) {
    return await Content.findOne({
      contentType: 'challenge',
      difficulty: 'beginner',
      isPublished: true,
      _id: { $nin: solvedProblemIds },
      tags: { $in: ['arrays', 'strings', 'hash-table'] }
    });
  }

  // ── PHASE 2: APPLY TIME DECAY ──
  const now = new Date();
  const userSkills = user.skills ? Object.fromEntries(user.skills) : {};
  const lastPracticed = user.lastPracticed ? Object.fromEntries(user.lastPracticed) : {};

  for (const tag in userSkills) {
    const lastDate = lastPracticed[tag];
    if (!lastDate) continue;
    const daysSince = (now - new Date(lastDate)) / (1000 * 60 * 60 * 24);
    if (daysSince > 10) {
      userSkills[tag] = Math.max(userSkills[tag] - 2, 0);
    }
  }

  // ── PHASE 3: SORT SKILLS (weakest first) ──
  const sortedSkills = Object.entries(userSkills).sort((a, b) => a[1] - b[1]);

  // ── PHASE 4: PREREQUISITE CHECK + FIND PROBLEM ──
  for (let [targetSkill, mastery] of sortedSkills) {
    const prereqs = SKILL_GRAPH[targetSkill] || [];
    for (const req of prereqs) {
      const reqMastery = userSkills[req] || 0;
      if (reqMastery < PREREQ_THRESHOLD) {
        console.log(`[Engine] Prerequisite gap: ${targetSkill} needs ${req} (mastery: ${reqMastery}). Targeting ${req} instead.`);
        targetSkill = req;
        mastery = reqMastery;
        break;
      }
    }

    let targetDifficulty = 'beginner';
    if (mastery >= 30 && mastery < 70) targetDifficulty = 'intermediate';
    if (mastery >= 70) targetDifficulty = 'advanced';

    let recommendedProblem = await Content.findOne({
      contentType: 'challenge',
      isPublished: true,
      tags: targetSkill,
      difficulty: targetDifficulty,
      _id: { $nin: solvedProblemIds }
    });

    // Fallback: try an easier problem in the same skill
    if (!recommendedProblem && targetDifficulty !== 'beginner') {
      recommendedProblem = await Content.findOne({
        contentType: 'challenge',
        isPublished: true,
        tags: targetSkill,
        difficulty: 'beginner',
        _id: { $nin: solvedProblemIds }
      });
    }

    if (recommendedProblem) return recommendedProblem;
  }

  // ── PHASE 5: SAFETY FALLBACK ──
  return await Content.findOne({
    contentType: 'challenge',
    isPublished: true,
    _id: { $nin: solvedProblemIds }
  });
};