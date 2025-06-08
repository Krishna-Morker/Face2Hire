import connectDB from '../db/connect';
import Question from '@/models/Question';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      title,
      description,
      difficulty,
      inputFormat,
      outputFormat,
      constraints,
      publicTestCases,
      hiddenTestCases,
      totalTime,
      hints,
      totalScore,
    } = body;

    // Basic validation
    if (
      !title ||
      !description ||
      !Array.isArray(publicTestCases) ||
      !Array.isArray(hiddenTestCases) ||
      !Number.isInteger(totalTime) ||
      !Array.isArray(hints) ||
      !Number.isInteger(totalScore)
    ) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields or invalid data types: title, description, publicTestCases, hiddenTestCases, totalTime, hints, totalScore',
        }),
        { status: 400 }
      );
    }

    const question = await Question.create({
      title,
      description,
      difficulty,
      inputFormat,
      outputFormat,
      constraints,
      publicTestCases,
      hiddenTestCases,
      totalTime,
      hints,
      totalScore,
    });

    return new Response(
      JSON.stringify({ message: 'Question created', question }),
      { status: 201 }
    );
  } catch (err) {
    console.error('POST Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to create question' }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const questions = await Question.find();
    return new Response(JSON.stringify(questions), { status: 200 });
  } catch (err) {
    console.error('GET Error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch questions' }),
      { status: 500 }
    );
  }
}