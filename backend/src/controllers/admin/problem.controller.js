import Content from '../../models/Content.model.js';
import TestCase from '../../models/testCase.model.js';

export const createProblem = async (req, res) => {
  try {
    // 1. Extract testCases from the body, keep the rest as problemData
    const { testCases, ...problemData } = req.body;

    // 2. Create the Problem (Content)
    const problem = await Content.create({
      ...problemData,
      contentType: 'challenge',
      createdBy: req.user.userId, // Assumes you have authMiddleware running
      isPublished: true, 
      publishedAt: new Date()
    });

    // 3. If Test Cases were sent, format and save them
    if (testCases && Array.isArray(testCases) && testCases.length > 0) {
      
      const formattedTestCases = testCases.map(tc => ({
        problem: problem._id, // Link to the new problem
        input: tc.input,
        // Frontend sends 'output', but DB Model expects 'expectedOutput'
        expectedOutput: tc.output, 
        isHidden: true, // Default settings
        points: 10
      }));

      await TestCase.insertMany(formattedTestCases);
    }

    res.status(201).json({
      success: true,
      data: problem,
      message: "Problem and Test Cases created successfully!"
    });

  } catch (error) {
    // Handle Duplicate Slug Error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "A problem with this slug already exists. Please choose a unique title/slug." 
      });
    }

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
export const deleteProblem =async (req,res)=>{
  try {
    const { id } =req.params;
    const problem =await Content.findByIdAndDelete(id);
    if(!problem){
      return res.status(404).json({message:'Problem not found'});
    }
    res.json({
      success:true,
      message:'Problem deleted successfully'
    });
  } catch (error) {
    res.status(500).json({message:error.message});
  }
};
export const updateProblem =async (req,res)=>{
  try {
    const { id } =req.params;
    const updatedDate =req.body;
    const problem =await Content.findByIdAndUpdate(id,updatedDate,{new:true});
    if(!problem){
      return res.status(404).json({message:'Problem not found'});
    }
    res.json({
      success:true,
      data:problem
    });
  } catch (error) {
    res.status(500).json({message:error.message});
    
  }
};
export default {
  createProblem,
  addTestCases,
  publishProblem,
  deleteProblem,
  updateProblem
};  