import Content from '../../models/Content.model.js';
import TestCase from '../../models/testCase.model.js';

export const createProblem = async (req, res) => {

  try {
    const problem = await Content.create({
      ...req.body,
      contentType: 'challenge',
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
export const addTestCases = async (req, res) => {
  try {
    const { id } = req.params;
    const testCases = req.body.testCases;

    const problem = await Content.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const formatted = testCases.map(tc => ({
      problem: id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden ?? true,
      points: tc.points ?? 10
    }));

    await TestCase.insertMany(formatted);

    res.status(201).json({
      success: true,
      message: 'Test cases added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
export const publishProblem = async (req, res) => {
  try {
    const problem = await Content.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    problem.isPublished = !problem.isPublished;
    problem.publishedAt = problem.isPublished ? new Date() : null;
    await problem.save();

    res.json({
      success: true,
      message: `Problem ${problem.isPublished ? 'published' : 'unpublished'}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export default {
  createProblem,
  addTestCases,
  publishProblem
};  