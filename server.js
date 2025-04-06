const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;


app.use(cors({ origin: '*' })); 
app.use(express.json());
app.use(express.static(__dirname));


app.get('/gemini-api-key', (req, res) => {
    res.json({ apiKey: process.env.GEMINI_API_KEY });
});


app.post('/gemini', async (req, res) => {
    try {
        const conversationHistory = req.body.conversationHistory;
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { contents: conversationHistory },
            { headers: { 'Content-Type': 'application/json' } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Gemini API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error communicating with Gemini API.' });
    }
});

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
    console.log(`Server listening at http://localhost:${port}`);
});