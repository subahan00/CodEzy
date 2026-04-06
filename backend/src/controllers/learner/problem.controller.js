import Content from '../../models/Content.model.js';    
import mongoose, { get } from 'mongoose';


export const getAllProblems = async (req, res) => {
  try {
    const problems = await Content.find({
      contentType: 'challenge',
      isPublished: true,
      isActive: true
    })
      .select(
        'title slug difficulty tags stats'
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: problems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Content.findOne({
      slug: req.params.slug,
      isPublished: true,
      isActive: true
    }).select(
      `
      title
      description
      difficulty
      tags
      problemStatement
      inputFormat
      outputFormat
      constraints
      examples
      starterCode
      timeLimit
      memoryLimit
      `
    );

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ Reusable function — callable from socket handler too
export const fetchRandomProblem = async () => {
  const problems = await Content.find({
    contentType: 'challenge',
    isPublished: true,
    isActive: true
  }).select(
    'title slug difficulty tags problemStatement constraints examples starterCode'
  );

  if (!problems.length) throw new Error('No problems available');
  return problems[Math.floor(Math.random() * problems.length)];
};

// Express route handler — just wraps the reusable function
export const getRandomProblem = async (req, res) => {
  try {
    const randomProblem = await fetchRandomProblem();
    res.json({ success: true, data: randomProblem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export default {
  getAllProblems,
    getProblemBySlug,
    getRandomProblem
};