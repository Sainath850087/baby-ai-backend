const http = require("http");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

const server = http.createServer(async (req, res) => {

    // Allow your Baby AI website to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // AI endpoint
    if (req.method === "POST" && req.url === "/ask") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                const data = JSON.parse(body);
                const question = String(data.question || "").trim();

                if (!question) {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "Question is required"
                    }));

                    return;
                }

                if (!API_KEY) {
                    res.writeHead(500, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "OPENAI_API_KEY is not configured on the server"
                    }));

                    return;
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
                    throw new Error(
                        result.error?.message || "OpenAI API error"
                    );
                }

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    answer: result.output_text || "I couldn't generate an answer."
                }));

            } catch (error) {

                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: error.message
                }));
            }
        });

        return;
    }

    res.writeHead(404, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        error: "Not found"
    }));
});

server.listen(PORT, () => {
    console.log(`Baby AI server running on port ${PORT}`);
});