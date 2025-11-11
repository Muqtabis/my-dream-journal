const express = require('express');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Protect this route
router.use(requireAuth);

// POST /api/ai/interpret
router.post('/interpret', async (req, res) => {
  const { dreamContent } = req.body;

  if (!dreamContent || !GEMINI_API_KEY) {
    return res.status(400).json({ error: 'API Key or dream content is missing.' });
  }

  try {
    // 1. Construct the enhanced prompt
    const prompt = `
      Act as a professional and insightful dream analyst. Analyze the following dream content. 
      Your response must be highly structured and useful for journaling.

      **Instructions for Output:**
      1. **OVERVIEW:** Provide a concise, high-level summary of the dream's meaning in one paragraph.
      2. **SYMBOLS:** Create a bulleted list of 3-5 major symbols identified. For each symbol, provide a brief, professional interpretation related to the dream.
      3. **ACTIONABLE JOURNAL PROMPTS:** Provide three specific questions that the user should answer in their journal to gain closure or deeper insight.

      ---
      Dream Content to Analyze: "${dreamContent}"
      ---
    `;

    // 2. Define the request body
    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    // 3. Make the direct API call using native fetch
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await apiResponse.json();

    // 4. ROBUST ERROR CHECK & EXTRACTION
    const rawInterpretation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!apiResponse.ok || data.error || !data.candidates || data.candidates.length === 0 || !rawInterpretation) {
      let errorMessage = "AI service failed to generate interpretation.";
      if (data.error && data.error.message) {
          errorMessage = `API Error: ${data.error.message}`;
      } else if (!rawInterpretation && data.candidates?.length > 0) {
          errorMessage = "Interpretation blocked due to safety policy or missing output.";
      }
      console.error("Gemini API Failure Details:", data);
      return res.status(500).json({ error: errorMessage });
    }

    // 5. If successful, extract and send the text
    const interpretation = rawInterpretation.trim();
    res.status(200).json({ interpretation });

  } catch (error) {
    console.error("Server-side Error during fetch:", error);
    res.status(500).json({ error: 'Internal server error while processing AI request.' });
  }
});

module.exports = router;