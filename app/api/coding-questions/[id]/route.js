// app/api/questions/[id]/route.js
import connectDB from '@/app/api/db/connect';
import Question from '@/models/Question';

export async function GET(req, { params }) {
  const { id } =await  params;

  try {
    await connectDB();

    const question = await Question.findById(id);

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(question), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
