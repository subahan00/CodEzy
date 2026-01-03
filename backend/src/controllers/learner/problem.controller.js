import Content from '../../models/Content.model.js';    
import mongoose from 'mongoose';


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
export default {
  getAllProblems,
    getProblemBySlug
};