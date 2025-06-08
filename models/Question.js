import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
}, { _id: false });

const HintSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  unlockTime: {
    type: Number,
    required: true,
  },
  scoreDeduction: {
    type: Number,
    required: true,
    default: 0, // Default score deduction for unlocking the hint
  }
}, { _id: false });

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    language: {
      type: [String],
      default: ['js'],
    },
    inputFormat: {
      type: String,
      default: '',
    },
    outputFormat: {
      type: String,
      default: '',
    },
    constraints: {
      type: [String],
      default: [],
    },
    publicTestCases: {
      type: [TestCaseSchema],
      default: [],
    },
    hiddenTestCases: {
      type: [TestCaseSchema],
      default: [],
    },
    totalTime: {
      type: Number,
      required: true,
    },
    hints: {
      type: [HintSchema],
      default: [],
    },
    totalScore: {
      type: Number,
      required: true,
      default: 100, // Default total score for the question
    },
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);