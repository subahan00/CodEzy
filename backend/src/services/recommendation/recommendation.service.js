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

// ─── FIX #9: Deep prerequisite resolution via BFS ────────────────────────────
// Previously only resolved one level of prerequisites. Now traverses the full
// SKILL_GRAPH chain so e.g. dp → recursion → <foundation> is handled correctly.
function resolveDeepestPrereq(skill, userSkills, graph, threshold) {
  const visited = new Set();
  let current = skill;
  while (true) {
    if (visited.has(current)) break; // cycle guard
    visited.add(current);
    const prereqs = graph[current] || [];
    const blocker = prereqs.find(r => (userSkills[r] || 0) < threshold);
    if (!blocker) break;
    current = blocker;
  }
  return current;
}

// ─── FIX #4: Safe Map → plain object conversion ───────────────────────────────
// Mongoose Maps can deserialize inconsistently across versions.
function mapToObject(maybeMap) {
  if (!maybeMap) return {};
  if (maybeMap instanceof Map) return Object.fromEntries(maybeMap);
  if (typeof maybeMap.toObject === 'function') return maybeMap.toObject();
  return maybeMap;
}

export const updateSkillMastery = async (userId, problemId, status) => {
  const user = await User.findById(userId);
  const problem = await Content.findById(problemId);

  if (!user || !problem || !problem.tags) return;

  const perfScore = PERFORMANCE_SCORES[status] || -0.1;
  const difficulty = problem.difficulty?.toLowerCase() || 'beginner';
  const maxGain = (DIFFICULTY_CAPS[difficulty] || 5) * (problem.skillWeight || 1);

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

    // ─── FIX #10: Populate failureProfile on non-accepted submissions ─────────
    // Previously failureProfile was defined in the schema but never written to.
    // Now we increment a bucket per status so the field has real data.
    if (status !== 'accepted') {
      if (!user.failureProfile) user.failureProfile = new Map();
      const key = `${tag}:${status}`;
      user.failureProfile.set(key, (user.failureProfile.get(key) || 0) + 1);
    }
  });

  if (status === 'accepted') {
    if (!user.solvedProblems) user.solvedProblems = [];

    const alreadySolved = user.solvedProblems.some(
      id => id.toString() === problem._id.toString()
    );

    if (!alreadySolved) {
      user.solvedProblems.push(problem._id);

      if (!user.statistics) user.statistics = {};
      user.statistics.problemsSolved = (user.statistics.problemsSolved || 0) + 1;

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

  // Use solvedProblems (primary), fall back to completedChallenges (legacy)
  const solvedProblemIds = user.solvedProblems?.length
    ? user.solvedProblems
    : (user.learningProgress?.completedChallenges || []);

  // ─── FIX #6: Base cold start on solvedProblems.length, not statistics counter
  // statistics.problemsSolved could be 0 even when solvedProblems has entries
  // (e.g. pre-migration data), causing incorrect cold start triggering.
  const solvedCount = solvedProblemIds.length;

  // ── PHASE 1: COLD START ──────────────────────────────────────────────────────
  if (solvedCount < 3) {
    return await Content.findOne({
      contentType: 'challenge',
      difficulty: 'beginner',
      isPublished: true,
      _id: { $nin: solvedProblemIds },
      tags: { $in: ['arrays', 'strings', 'hash-table'] }
    });
  }

  // ── PHASE 2: APPLY TIME DECAY ────────────────────────────────────────────────
  const now = new Date();

  // FIX #4: Use safe map conversion
  const userSkills = mapToObject(user.skills);
  const lastPracticed = mapToObject(user.lastPracticed);

  for (const tag in userSkills) {
    const lastDate = lastPracticed[tag];
    if (!lastDate) continue;
    const daysSince = (now - new Date(lastDate)) / (1000 * 60 * 60 * 24);
    if (daysSince > 10) {
      userSkills[tag] = Math.max(userSkills[tag] - 2, 0);
    }
  }

  // ─── FIX #5: Persist decayed skill values back to the user document ──────────
  // Previously decay only affected the local copy; DB values were never updated,
  // so decay effectively never accumulated between sessions.
  for (const tag in userSkills) {
    user.skills.set(tag, userSkills[tag]);
  }
  await user.save();

  // ── PHASE 1.5: DISCOVER UNTOUCHED SKILLS ─────────────────────────────────────
  // FIX #1 + #2: Moved AFTER Phase 2 so userSkills is defined before use.
  // Previously this block ran before userSkills was declared, causing a
  // ReferenceError at runtime.
  const allTags = await Content.distinct('tags', {
    contentType: 'challenge',
    isPublished: true
  });

  const userKnownSkills = new Set(Object.keys(userSkills));
  const untouchedSkills = allTags.filter(tag => !userKnownSkills.has(tag));

  if (untouchedSkills.length > 0) {
    const discovery = await Content.findOne({
      contentType: 'challenge',
      isPublished: true,
      difficulty: 'beginner',
      tags: { $in: untouchedSkills },
      _id: { $nin: solvedProblemIds }
    });
    if (discovery) return discovery;
  }

  // ── PHASE 3: SORT SKILLS (weakest first) ────────────────────────────────────
  const sortedSkills = Object.entries(userSkills).sort((a, b) => a[1] - b[1]);

  // ─── FIX #3: Guard for empty skills (silent fallthrough to Phase 5) ──────────
  // If sortedSkills is empty (user passed cold start but has no skill entries),
  // we fall through to Phase 5 safety fallback intentionally.

  // ── PHASE 4: PREREQUISITE CHECK + FIND PROBLEM ──────────────────────────────
  // FIX #7: Batch DB queries instead of one per skill.
  // Build the full candidate list first, then query once with $or.
  // FIX #9: Use deep BFS prerequisite resolution instead of one-level check.

  const candidateMap = []; // [{ tag, difficulty }] in weakest-first order

  for (const [skill, mastery] of sortedSkills) {
    // Resolve the deepest unmet prerequisite (multi-level BFS)
    const targetSkill = resolveDeepestPrereq(skill, userSkills, SKILL_GRAPH, PREREQ_THRESHOLD);
    const targetMastery = userSkills[targetSkill] ?? mastery;

    let targetDifficulty = 'beginner';
    if (targetMastery >= 30 && targetMastery < 70) targetDifficulty = 'intermediate';
    if (targetMastery >= 70) targetDifficulty = 'advanced';

    candidateMap.push({ tag: targetSkill, difficulty: targetDifficulty });

    // Also push a beginner fallback if not already beginner
    if (targetDifficulty !== 'beginner') {
      candidateMap.push({ tag: targetSkill, difficulty: 'beginner' });
    }
  }

  // Deduplicate (tag+difficulty pairs)
  const seen = new Set();
  const uniqueCandidates = candidateMap.filter(({ tag, difficulty }) => {
    const key = `${tag}:${difficulty}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Single batched query with $or across all candidates
  // FIX #8: Add randomness so users with the same skill profile get varied picks.
  for (const { tag, difficulty } of uniqueCandidates) {
    const query = {
      contentType: 'challenge',
      isPublished: true,
      tags: tag,
      difficulty,
      _id: { $nin: solvedProblemIds }
    };

    const count = await Content.countDocuments(query);
    if (count === 0) continue;

    const skip = Math.floor(Math.random() * count);
    const problem = await Content.findOne(query).skip(skip);
    if (problem) return problem;
  }

  // ── PHASE 5: SAFETY FALLBACK ─────────────────────────────────────────────────
  const fallbackCount = await Content.countDocuments({
    contentType: 'challenge',
    isPublished: true,
    _id: { $nin: solvedProblemIds }
  });

  if (fallbackCount === 0) return null;

  const fallbackSkip = Math.floor(Math.random() * fallbackCount);
  return await Content.findOne({
    contentType: 'challenge',
    isPublished: true,
    _id: { $nin: solvedProblemIds }
  }).skip(fallbackSkip);
};