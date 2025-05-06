import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { question, userAnswer } = await request.json();
  // Updated prompt to instruct the AI to provide a single integer evaluation out of 10
//   console.log("hiiiiii");
  const st = `Question: ${question}\nUser Answer: ${userAnswer}\nPlease provide a single integer score out of 10 evaluating the user's answer. Do not include any additional text.`;
  ///console.log("AI prompt:", st);
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBBwwG514vBnWzhB1Xpd5coXa0hnLshLD0`,
      {
        contents: [
          {
            parts: [
              {
                text: st,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer received";
    //onsole.log("answer",answer)
   console.log("AI response:", answer);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error fetching AI question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}