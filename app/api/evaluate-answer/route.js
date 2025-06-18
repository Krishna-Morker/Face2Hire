import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question, userAnswer, topic } = await request.json();

    if (!question || !userAnswer || typeof question !== "string" || typeof userAnswer !== "string") {
      return NextResponse.json(
        { error: "Invalid input. 'question' and 'userAnswer' are required as strings." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert technical interviewer for ${topic}.
Evaluate the user's response to the following question:
Question: ${question}
User Answer: ${userAnswer}

Give a single integer score from 0 to 10 based on correctness, completeness, and relevance. Do not explain. Just return the score only.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBBwwG514vBnWzhB1Xpd5coXa0hnLshLD0`,
      {
        contents: [
          {
            parts: [{ text: prompt.trim() }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let rawAnswer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    console.log("Raw AI score:", rawAnswer);

    // Extract integer score (0–10) from rawAnswer
    const scoreMatch = rawAnswer.match(/\b([0-9]|10)\b/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    if (score === null || isNaN(score)) {
      return NextResponse.json(
        { error: "Could not extract a valid score from AI response." },
        { status: 500 }
      );
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error evaluating answer:", error?.response?.data || error.message);
    return NextResponse.json(
      { error: "Internal Server Error during evaluation." },
      { status: 500 }
    );
  }
}
