const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai'); // ✅ Import OpenAI SDK

const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(__dirname));

// 🔐 GitHub-hosted GPT-4o Model Setup
const token = process.env.GITHUB_MODEL_TOKEN; // your GitHub PAT
const client = new OpenAI({
    baseURL: "https://models.github.ai/inference", // 👈 Use GitHub Inference API
    apiKey: token
});

// 🚀 Chat endpoint using GPT-4o
app.post('/gpt4o', async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log("GPT-4o User message:", userMessage);

        const response = await client.chat.completions.create({
            model: "openai/gpt-4o",
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
            top_p: 1,
            max_tokens: 1024
        });

        const reply = response.choices[0].message.content;
        res.json({ reply });

    } catch (err) {
        console.error("GPT-4o API Error:", err);
        res.status(500).json({
            error: 'Error communicating with GPT-4o model.',
            details: err?.message || err?.toString() || 'Unknown error'
        });
    }
});

// 🌐 Firebase config route (unchanged)
app.get('/firebaseconfig', (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
    });
});

app.listen(port, () => {
    console.log(`✅ Server listening at http://localhost:${port}`);
});
