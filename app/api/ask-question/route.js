// app/api/ask-question/route.js

import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { question } = await request.json();
  console.log("Received question:", question);
 

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBBwwG514vBnWzhB1Xpd5coXa0hnLshLD0`,
      {
        contents: [
          {
            parts: [
              {
                text: question,
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
    console.log("AI response:", answer);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error fetching AI question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
