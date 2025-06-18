import axios from "axios";
import { NextResponse } from "next/server";



export async function POST(request) {
  try {
    const { topic, previousQuestions = [], previousConcepts = [] } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Invalid request. 'topic' must be a non-empty string." },
        { status: 400 }
      );
    }

    const avoidQuestions = previousQuestions.length
      ? `Avoid the following questions: "${previousQuestions.join('", "')}".`
      : '';

    const avoidConcepts = previousConcepts.length
      ? `Avoid the following concepts: "${previousConcepts.join('", "')}".`
      : '';

    const prompt = `
You are an AI interviewer. 
Generate ONLY ONE clear, specific, concise **theory question** for the topic: "${topic}".

${avoidQuestions}
${avoidConcepts}

- Return ONLY the question and the core concept it relates to.
- Do NOT include answers.
- Do NOT repeat or rephrase previous questions or concepts.
- Do NOT ask multiple things in one question.
- Format the response strictly as:
Question: <question>
Concept: <concept>
`;

    const response = await axios.post(
      process.env.NEXT_AI_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!raw) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const questionMatch = raw.match(/Question:\s*(.+)/i);
    const conceptMatch = raw.match(/Concept:\s*(.+)/i);

    const question = questionMatch?.[1]?.trim() || "Could not extract question.";
    const concept = conceptMatch?.[1]?.trim() || "general";

    //console.log("Generated:", { question, concept });

    return NextResponse.json({ question, concept });
  } catch (error) {
    console.error("Error in /api/ask-question:", error?.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to generate interview question. Please try again." },
      { status: 500 }
    );
  }
}
