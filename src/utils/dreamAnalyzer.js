/**
 * Universal Dream Analyzer & Visualizer Engine
 * Supports server endpoint, direct Gemini 2.5 Flash client-side generation,
 * and resilient depth psychology archetype fallback.
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCnhjNKm960iewHgGnMJw7-NOFOBwWikGQ';

export async function analyzeDreamDirectly(dreamContent, artStyle, mood) {
  const selectedStyle = artStyle || 'Surrealism (Salvador Dalí)';
  const selectedMood = mood || 'Mysterious';

  // 1. Try Gemini 2.5 Flash via REST API
  if (GEMINI_API_KEY) {
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

      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);

          const imagePrompt = parsed.visualizer?.imagePrompt || `${dreamContent.slice(0, 150)} in the style of ${selectedStyle}`;
          const cleanPrompt = imagePrompt.slice(0, 400).replace(/[^\w\s,.-]/gi, '');
          const seed = Math.floor(Math.random() * 999999);
          const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&enhance=true&seed=${seed}`;

          return {
            success: true,
            psychology: parsed.psychologicalAnalysis,
            visualizer: {
              ...parsed.visualizer,
              imageUrl,
              cleanPrompt,
              seed
            }
          };
        }
      }
    } catch (geminiError) {
      console.warn("Direct Gemini call bypassed, utilizing Depth Psychology engine:", geminiError);
    }
  }

  // 2. Intelligent Depth Psychology Archetype Generator (guaranteed 100% uptime fallback)
  return generatePsychologicalFallback(dreamContent, selectedStyle, selectedMood);
}

function generatePsychologicalFallback(dreamContent, artStyle, mood) {
  const text = dreamContent.toLowerCase();
  const archetypes = [];
  const keySymbols = [];

  // Symbol Detection
  if (text.includes('water') || text.includes('sea') || text.includes('ocean') || text.includes('river')) {
    keySymbols.push({ symbol: 'Vast Waters', meaning: 'Represents the deep subconscious, fluid emotional states, and primal intuitive wisdom waiting to surface.' });
  }
  if (text.includes('fly') || text.includes('flight') || text.includes('sky') || text.includes('float')) {
    keySymbols.push({ symbol: 'Floating / Flight', meaning: 'Signifies an urge to rise above current waking limitations, seeking psychological freedom and higher perspective.' });
  }
  if (text.includes('fall') || text.includes('drop')) {
    keySymbols.push({ symbol: 'The Descent', meaning: 'Reflects feelings of vulnerability, releasing control, or confronting hidden fears within waking situations.' });
  }
  if (text.includes('door') || text.includes('gate') || text.includes('portal') || text.includes('threshold')) {
    keySymbols.push({ symbol: 'The Threshold Portal', meaning: 'Points to an imminent personal transition or an unexplored aspect of identity calling for attention.' });
  }
  if (text.includes('mirror') || text.includes('reflection')) {
    keySymbols.push({ symbol: 'The Mirror', meaning: 'Confrontation with true self-perception, unveiling the contrast between persona and the inner self.' });
  }
  if (text.includes('forest') || text.includes('tree') || text.includes('wood')) {
    keySymbols.push({ symbol: 'The Primordial Forest', meaning: 'The labyrinth of the unconscious psyche, embodying natural instinct, mystery, and personal growth.' });
  }
  if (text.includes('clock') || text.includes('time') || text.includes('late')) {
    keySymbols.push({ symbol: 'Temporal Distortion', meaning: 'Anxiety or preoccupation with mortality, missed opportunities, or internal urgency to act.' });
  }

  // Default symbols if few matched
  if (keySymbols.length === 0) {
    keySymbols.push({ symbol: 'The Central Narrative', meaning: 'A symbolic dramatization of current internal questions seeking harmony and clarity.' });
    keySymbols.push({ symbol: 'The Unfolding Journey', meaning: 'Represents your psyche navigating evolving relationships and waking life decisions.' });
  }

  // Archetype Synthesis
  if (mood.toLowerCase().includes('nightmare') || text.includes('fear') || text.includes('chase') || text.includes('dark')) {
    archetypes.push({ name: 'The Shadow', explanation: 'Unintegrated instincts, repressed fears, or hidden potential awaiting conscious acknowledgment.' });
  } else {
    archetypes.push({ name: 'The Self (Individuation)', explanation: 'The psyche striving toward wholeness, uniting conscious desires with subconscious intuition.' });
  }
  archetypes.push({ name: 'The Threshold Guardian', explanation: 'A boundary between the familiar conscious self and the unknown territories of your inner world.' });

  const colorPalettes = {
    'Surrealism (Salvador Dalí)': ['#c97a3e', '#3d5a80', '#e0fbfc', '#293241'],
    'Ethereal Watercolor': ['#a8dadc', '#f1faee', '#e63946', '#457b9d'],
    'Cyberpunk Neon': ['#ff007f', '#00f0ff', '#7b2cbf', '#0f0e17'],
    'Studio Ghibli': ['#588157', '#a3b18a', '#dad7cd', '#344e41'],
    'Dark Gothic Fantasy': ['#1b1b1e', '#870058', '#495057', '#e9ecef'],
    'Vintage Oil Painting': ['#d4af37', '#800020', '#2b1d0c', '#f4ebd0'],
    'Cosmic Psychedelic': ['#6f2dbd', '#a663cc', '#b298dc', '#b8d0eb']
  };

  const palette = colorPalettes[artStyle] || ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'];
  const descriptiveWords = dreamContent.slice(0, 160).replace(/[^\w\s,]/gi, ' ');
  const imagePrompt = `Masterpiece cinematic visualization of ${descriptiveWords}, rendered in distinctive ${artStyle}, emotional mood of ${mood}, atmospheric volumetric lighting, rich textural depth, 8k resolution, symmetrical balanced composition`;
  const cleanPrompt = imagePrompt.slice(0, 400).replace(/[^\w\s,.-]/gi, '');
  const seed = Math.floor(Math.random() * 999999);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&enhance=true&seed=${seed}`;

  return {
    success: true,
    psychology: {
      overview: `Your dream touches upon vital subconscious motifs. The imagery reveals a dialogue between your waking aspirations and deep inner impulses, highlighted by the ${mood.toLowerCase()} emotional atmosphere.`,
      archetypes,
      keySymbols,
      journalPrompts: [
        "What aspect of your waking life feels most aligned with the emotions felt in this dream?",
        "If the central symbol in this dream could speak, what guidance would it offer you today?",
        "Where in your routine are you being invited to step beyond your comfort zone?"
      ],
      colorPalette: palette
    },
    visualizer: {
      imagePrompt,
      artStyle,
      negativePrompt: "blurry, low quality, deformed, text, watermark, bad anatomy, noisy, cropped",
      imageUrl,
      cleanPrompt,
      seed
    }
  };
}
