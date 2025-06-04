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

        const response = await client.path("/mistral/completions").post({
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
        console.error("Mistral API Error:", err);
        res.status(500).json({ error: 'Error communicating with Mistral model.' });
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
