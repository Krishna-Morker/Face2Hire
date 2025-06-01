// models/Question.js
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
});

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
      type: [String], // e.g., ['cpp', 'python', 'js']
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
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
