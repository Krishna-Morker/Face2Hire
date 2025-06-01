import connectDB from '../db/connect';

export async function GET() {
  await connectDB();
  return new Response(JSON.stringify({ message: 'DB connected ✅' }), {
    status: 200,
  });
}
