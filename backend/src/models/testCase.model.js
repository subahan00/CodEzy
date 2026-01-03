import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
      index: true
    },
    input: {
      type: String,
      required: true
    },
    expectedOutput: {
      type: String,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: true
    },
    points: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
);

const TestCase = mongoose.model('TestCase', testCaseSchema);
export default TestCase;
