const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import the Azure-style client package
const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");
const { isUnexpected } = require("@azure-rest/ai-inference");

const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(__dirname));

// 🧠 Mistral Model Setup
const endpoint = "https://models.github.ai/inference";
const model = "mistral-ai/mistral-medium-2505";
const token = process.env.GITHUB_MODEL_TOKEN;

const client = ModelClient(endpoint, new AzureKeyCredential(token));

// 🚀 Chat endpoint (replaces Gemini)
app.post('/mistral', async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log("Sending request to Mistral with token present:", !!token);
        console.log("Model:", model);
        console.log("User message:", userMessage);

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    {
                        role: "system",
                        content: "You are Umeed, a helpful assistant for refugees. You provide guidance about food, shelter, legal aid, emotional help, and jobs. Politely decline any unrelated queries."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                temperature: 0.8,
                top_p: 0.9,
                max_tokens: 1024,
                model: model
            }
        });

        if (isUnexpected(response)) {
            throw response.body.error;
        }

        const reply = response.body.choices[0].message.content;
        res.json({ reply });

    } catch (err) {
        console.error("Mistral API Error (full):", err);

        if (err && err.response && err.response.body) {
            console.error("Mistral API Error (body):", JSON.stringify(err.response.body, null, 2));
        }

        res.status(500).json({
            error: 'Error communicating with Mistral model.',
            details: err?.message || err?.toString() || 'Unknown error'
        });
    }
}); // ✅ This closing brace was missing
