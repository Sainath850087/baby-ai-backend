export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions:
            "You are Baby, a friendly AI assistant. Give clear, simple and helpful answers. Help with English learning, studying, quizzes, UPSC preparation and general questions.",
          input: question
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: result.error?.message || "OpenAI API error"
      });
    }

    return res.status(200).json({
      answer: result.output_text || "I couldn't generate an answer."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}