const express = require('express');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// In-memory rate limiting to protect public API endpoints from abuse
const ipHits = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 25; // max 25 visualizations per window per IP

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = ipHits.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    ipHits.set(ip, record);
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  ipHits.set(ip, record);
  return true;
};

// Helper to strip markdown json fences if present
const parseGeminiJson = (text) => {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  try {
    return JSON.parse(clean);
  } catch (err) {
    // Attempt to extract between the first { and the last }
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
    }
    throw err;
  }
};

// ==========================================
// PUBLIC ROUTE: POST /api/ai/visualize
// Analyzes psychological meaning & generates image prompt + image URL
// ==========================================
router.post('/visualize', async (req, res) => {
  const { dreamContent, artStyle, mood } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Rate limit reached. Please wait a few minutes before submitting another dream.' });
  }

  if (!dreamContent || !dreamContent.trim()) {
    return res.status(400).json({ error: 'Please describe your dream.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured.' });
  }

  const selectedStyle = artStyle || 'Surrealism (Salvador Dalí)';
  const selectedMood = mood || 'Mysterious';

  try {
    const systemPrompt = `
You are an expert Depth Psychologist, Jungian Dream Analyst, and visionary AI Art Prompt Engineer.
Analyze the user's dream narrative thoroughly.

The user chose the following preferences:
- Desired Art Style: "${selectedStyle}"
- Emotional Tone: "${selectedMood}"

You MUST respond strictly with a valid JSON object (NO extra text or markdown outside the JSON block).
The JSON object must follow this exact schema:

{
  "psychologicalAnalysis": {
    "overview": "A rich 2-3 sentence psychological summary of what subconscious thoughts or waking life conflicts this dream represents.",
    "archetypes": [
      { "name": "Name of archetype (e.g. The Shadow, The Threshold, The Anima, The Journey)", "explanation": "Brief explanation of its role in this dream." }
    ],
    "keySymbols": [
      { "symbol": "Symbol name (e.g. Ocean, Falling, Locked Door)", "meaning": "Subconscious psychological meaning in context." }
    ],
    "journalPrompts": [
      "Deep self-reflection question 1 for the user to journal about",
      "Deep self-reflection question 2",
      "Deep self-reflection question 3"
    ],
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"]
  },
  "visualizer": {
    "imagePrompt": "A masterfully descriptive, highly visual prompt for modern text-to-image AI generators. Describe the exact scene, subject, focal point, lighting (e.g. volumetric, chiaroscuro, bioluminescent), texture, atmosphere, color grading, and framing in the style of ${selectedStyle}. Avoid abstract words like 'scary' or 'deep' - use purely visual sensory descriptions.",
    "artStyle": "${selectedStyle}",
    "negativePrompt": "blurry, low quality, deformed, text, watermark, bad anatomy, noisy, cropped"
  }
}

Dream Narrative:
"${dreamContent.trim()}"
`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      }
    };

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok || data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({ error: data.error?.message || 'Failed to analyze dream with Gemini.' });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ error: 'No interpretation returned by Gemini.' });
    }

    let parsed;
    try {
      parsed = parseGeminiJson(rawText);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON output:", rawText);
      parsed = {
        psychologicalAnalysis: {
          overview: rawText.slice(0, 300),
          archetypes: [{ name: "The Subconscious", explanation: "Representing unexpressed thoughts." }],
          keySymbols: [{ symbol: "Dreamscape", meaning: "Internal psychological landscape." }],
          journalPrompts: ["What felt most vivid when you woke up?"],
          colorPalette: ["#1a1a2e", "#4facfe", "#00f2fe"]
        },
        visualizer: {
          imagePrompt: `${selectedStyle} style surreal visualization of ${dreamContent.slice(0, 150)}, cinematic lighting, 8k wallpaper`,
          artStyle: selectedStyle,
          negativePrompt: "text, watermark, blurry"
        }
      };
    }

    const baseVisualPrompt = parsed.visualizer?.imagePrompt || `${selectedStyle} representation of ${dreamContent}`;
    const cleanPromptEncoded = encodeURIComponent(baseVisualPrompt.slice(0, 320));
    const seed = Math.floor(Math.random() * 9999999);
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${cleanPromptEncoded}?width=768&height=768&seed=${seed}&nologo=true`;

    res.status(200).json({
      success: true,
      psychology: parsed.psychologicalAnalysis,
      visualizer: {
        ...parsed.visualizer,
        imageUrl: generatedImageUrl
      }
    });

  } catch (error) {
    console.error("Error in /api/ai/visualize:", error);
    res.status(500).json({ error: 'Server error during dream visualization.' });
  }
});

// ==========================================
// PROTECTED ROUTE: POST /api/ai/interpret
// Modal interpretation for logged-in users
// ==========================================
router.post('/interpret', requireAuth, async (req, res) => {
  const { dreamContent } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!dreamContent || !apiKey) {
    return res.status(400).json({ error: 'API Key or dream content is missing.' });
  }

  try {
    const prompt = `
      Act as a professional dream analyst. Analyze the following dream content.
      Provide a concise 1-paragraph psychological overview, 3-4 bulleted symbols with meanings, and 2 actionable journal prompts.

      Dream Content: "${dreamContent}"
    `;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    };

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await apiResponse.json();
    const rawInterpretation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!apiResponse.ok || data.error || !rawInterpretation) {
      const err = data.error?.message || "AI failed to generate interpretation.";
      return res.status(500).json({ error: err });
    }

    res.status(200).json({ interpretation: rawInterpretation.trim() });

  } catch (error) {
    console.error("Server-side Error during fetch:", error);
    res.status(500).json({ error: 'Internal server error while processing AI request.' });
  }
});

module.exports = router;
