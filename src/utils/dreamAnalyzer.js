/**
 * Client-Side Dream Analyzer & Visualizer Engine
 * Handles optional user-supplied Gemini API keys and provides an intelligent
 * Jungian Depth Psychology & Pollinations.ai Art Prompt fallback for static hosting.
 */

const USER_GEMINI_KEY_STORAGE = 'dream_journal_custom_gemini_key';

export function getSavedUserGeminiKey() {
  try {
    return localStorage.getItem(USER_GEMINI_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setSavedUserGeminiKey(key) {
  try {
    const trimmed = (key || '').trim();
    if (trimmed) {
      localStorage.setItem(USER_GEMINI_KEY_STORAGE, trimmed);
    } else {
      localStorage.removeItem(USER_GEMINI_KEY_STORAGE);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

const STYLE_VISUAL_MODIFIERS = {
  'Surrealism (Dalí)': 'surrealist dreamscape painting in the style of Salvador Dali and Rene Magritte, impossible geometry, crisp ethereal lighting, museum fine art',
  'Ethereal Watercolor': 'delicate ethereal watercolor painting on cold-press textured paper, luminous washes, translucent pigment bleeds, poetic atmosphere',
  'Cyberpunk Neon': 'cinematic cyberpunk neon dreamscape, atmospheric volumetric fog, iridescent reflections, electric cyan and magenta chiaroscuro',
  'Studio Ghibli': 'hand-painted Studio Ghibli anime scenic art, lush atmospheric clouds, warm golden sunlight, whimsical painterly detail',
  'Dark Gothic Fantasy': 'dark gothic fantasy oil painting, dramatic chiaroscuro shadows, silver moonlight through mist, ornate moody architecture',
  'Vintage Oil Painting': 'classical baroque oil painting, rich textured impasto brushstrokes, warm golden hour glow, chiaroscuro depth',
  'Cosmic Psychedelic': 'cosmic visionary artwork, swirling nebulae, sacred geometric light patterns, bioluminescent stars, astral depth'
};

const COLOR_PALETTES = {
  'Surrealism (Dalí)': ['#c97a3e', '#3d5a80', '#e0fbfc', '#293241'],
  'Ethereal Watercolor': ['#a8dadc', '#f1faee', '#e63946', '#457b9d'],
  'Cyberpunk Neon': ['#ff007f', '#00f0ff', '#7b2cbf', '#0f0e17'],
  'Studio Ghibli': ['#588157', '#a3b18a', '#dad7cd', '#344e41'],
  'Dark Gothic Fantasy': ['#1b1b1e', '#870058', '#495057', '#e9ecef'],
  'Vintage Oil Painting': ['#d4af37', '#800020', '#2b1d0c', '#f4ebd0'],
  'Cosmic Psychedelic': ['#6f2dbd', '#a663cc', '#b298dc', '#b8d0eb']
};

const SYMBOL_DICTIONARY = [
  {
    keywords: ['water', 'sea', 'ocean', 'wave', 'swim', 'drown', 'river', 'lake', 'rain'],
    symbol: 'Waters of the Unconscious',
    meaning: 'In Jungian symbolism, open water mirrors emotional depth, intuition, and currents beneath conscious awareness.'
  },
  {
    keywords: ['fly', 'flying', 'float', 'floating', 'wings', 'soar', 'sky', 'cloud'],
    symbol: 'Ascent & Flight',
    meaning: 'Rising above gravity reflects a desire for autonomy, perspective, and liberation from waking constraints.'
  },
  {
    keywords: ['fall', 'falling', 'cliff', 'drop', 'abyss'],
    symbol: 'The Descent',
    meaning: 'Falling highlights moments of transition where familiar structures give way and the psyche learns to surrender control.'
  },
  {
    keywords: ['door', 'gate', 'portal', 'key', 'lock', 'threshold', 'stair', 'bridge'],
    symbol: 'The Threshold',
    meaning: 'Doors, bridges, and portals mark psychological passages between a known chapter of identity and emerging possibilities.'
  },
  {
    keywords: ['mirror', 'reflection', 'glass', 'double', 'twin'],
    symbol: 'Mirror & Self-Reflection',
    meaning: 'Reflections confront how your outer persona relates to inner authenticity and unrecognized facets of selfhood.'
  },
  {
    keywords: ['forest', 'tree', 'woods', 'jungle', 'garden', 'moss'],
    symbol: 'The Living Labyrinth',
    meaning: 'Forest imagery embodies untamed instinct, organic growth, and quiet introspection away from social expectations.'
  },
  {
    keywords: ['clock', 'time', 'watch', 'hour', 'late', 'melting'],
    symbol: 'Temporal Pressure',
    meaning: 'Clocks and distorted time reflect internal urgency, evolving priorities, or a longing to step outside rigid schedules.'
  },
  {
    keywords: ['book', 'library', 'page', 'whisper', 'letter', 'write', 'memory'],
    symbol: 'The Inner Archive',
    meaning: 'Books and libraries symbolize accumulated memory, unspoken stories, and wisdom waiting to be consciously integrated.'
  },
  {
    keywords: ['chase', 'running', 'monster', 'shadow', 'dark', 'pursued', 'hide'],
    symbol: 'Pursuit & Confrontation',
    meaning: 'Being pursued often dramatizes an unresolved feeling, ambition, or shadow trait asking to be turned toward and understood.'
  },
  {
    keywords: ['moon', 'star', 'sun', 'cosmos', 'planet', 'night', 'aurora'],
    symbol: 'Celestial Luminaries',
    meaning: 'Moons and stars represent guiding intuition during uncertainty—lights illuminating the unknown territory of the night.'
  },
  {
    keywords: ['train', 'car', 'road', 'ship', 'journey', 'desert', 'travel'],
    symbol: 'Vehicle of Direction',
    meaning: 'Vehicles and landscapes reflect momentum, life trajectory, and whether you feel aligned with the pace of change.'
  },
  {
    keywords: ['house', 'room', 'attic', 'basement', 'city', 'tower'],
    symbol: 'Architecture of the Psyche',
    meaning: 'Rooms and buildings map the structure of memory and consciousness—hidden floors often signify untapped potential.'
  },
  {
    keywords: ['bird', 'wolf', 'snake', 'cat', 'horse', 'animal', 'butterfly'],
    symbol: 'Instinctual Guide',
    meaning: 'Animals frequently carry instinctual intelligence, transformation, and vitality operating beneath analytical thought.'
  },
  {
    keywords: ['fire', 'flame', 'light', 'lantern', 'glow', 'bioluminescent'],
    symbol: 'Transformative Light',
    meaning: 'Inner fire or luminescence signals creative awakening, purification, and clarity emerging within mystery.'
  }
];

function buildPollinationsImageUrl(imagePrompt) {
  const cleanPrompt = imagePrompt
    .slice(0, 400)
    .replace(/[^\w\s,.-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const seed = Math.floor(Math.random() * 999999);
  return {
    cleanPrompt,
    seed,
    imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`
  };
}

/**
 * Analyze a dream directly in the browser.
 * Uses user-provided Gemini key if saved locally; otherwise executes the
 * built-in Depth Psychology analyzer + Pollinations image synthesizer.
 */
export async function analyzeDreamDirectly(dreamContent, artStyle, mood, explicitApiKey = '') {
  const selectedStyle = artStyle || 'Surrealism (Dalí)';
  const selectedMood = mood || 'Mysterious';
  const apiKey = (explicitApiKey || getSavedUserGeminiKey()).trim();

  if (apiKey) {
    try {
      const systemPrompt = `
You are an expert Depth Psychologist, Jungian Dream Analyst, and visionary AI Art Prompt Engineer.
Analyze the user's dream narrative thoroughly.

Preferences:
- Desired Art Style: "${selectedStyle}"
- Emotional Tone: "${selectedMood}"

Respond strictly with valid JSON matching this schema (no markdown fences):
{
  "psychologicalAnalysis": {
    "overview": "2-3 sentence psychological summary.",
    "archetypes": [{ "name": "Archetype", "explanation": "Brief role in dream." }],
    "keySymbols": [{ "symbol": "Symbol", "meaning": "Meaning in context." }],
    "journalPrompts": ["Question 1", "Question 2", "Question 3"],
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"]
  },
  "visualizer": {
    "imagePrompt": "Rich visual scene prompt in style of ${selectedStyle}.",
    "artStyle": "${selectedStyle}",
    "negativePrompt": "blurry, low quality, deformed, text, watermark, bad anatomy, noisy, cropped"
  }
}

Dream Narrative:
"${dreamContent.trim()}"
`;

      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
          })
        }
      );

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          const imagePrompt = parsed.visualizer?.imagePrompt || `${dreamContent.slice(0, 160)}, ${selectedStyle}`;
          const { cleanPrompt, seed, imageUrl } = buildPollinationsImageUrl(imagePrompt);

          return {
            success: true,
            source: 'gemini-personal-key',
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
    } catch (err) {
      console.warn('Personal Gemini API request bypassed, using built-in Depth Psychology analyzer:', err);
    }
  }

  return generatePsychologicalFallback(dreamContent, selectedStyle, selectedMood);
}

/**
 * Generates an insightful Jungian interpretation and rich text-to-image prompt
 * directly from the dream narrative without requiring external credentials.
 */
export function generatePsychologicalFallback(dreamContent, artStyle, mood) {
  const lower = dreamContent.toLowerCase();
  const keySymbols = [];

  for (const entry of SYMBOL_DICTIONARY) {
    if (entry.keywords.some((kw) => new RegExp(`\\b${kw}`, 'i').test(lower))) {
      keySymbols.push({ symbol: entry.symbol, meaning: entry.meaning });
      if (keySymbols.length >= 4) break;
    }
  }

  if (keySymbols.length === 0) {
    keySymbols.push(
      {
        symbol: 'The Unfolding Motif',
        meaning: 'A symbolic scenario staged by the psyche to process nuanced waking emotions in visual form.'
      },
      {
        symbol: 'Atmospheric Shift',
        meaning: 'Highlights how your emotional compass responds when familiar routines dissolve into unfamiliar terrain.'
      }
    );
  }

  const archetypes = [];
  const lowerMood = mood.toLowerCase();

  if (lowerMood.includes('nightmare') || /chase|dark|shadow|fear|trap|fall/.test(lower)) {
    archetypes.push({
      name: 'The Shadow',
      explanation: 'Confrontation with unexamined tension, suppressed instincts, or hidden creative strength seeking acknowledgment.'
    });
  } else if (lowerMood.includes('lucid') || /fly|light|sky|star|create/.test(lower)) {
    archetypes.push({
      name: 'The Transcendent Function',
      explanation: 'Active dialogue between conscious willpower and intuitive imagination, opening lucid clarity.'
    });
  } else {
    archetypes.push({
      name: 'The Self (Individuation)',
      explanation: 'The organizing center of the psyche integrating diverse feelings and memories into a coherent inner compass.'
    });
  }

  if (/door|bridge|ocean|path|train|labyrinth|mirror/.test(lower)) {
    archetypes.push({
      name: 'The Threshold',
      explanation: 'Signals a liminal turning point between what is familiar and an emerging personal shift.'
    });
  } else {
    archetypes.push({
      name: 'The Anima / Animus (Inner Guide)',
      explanation: 'The relational bridge connecting outer daily roles with authentic emotional intuition.'
    });
  }

  const primarySymbolNames = keySymbols.map((s) => s.symbol.toLowerCase()).slice(0, 2).join(' and ');
  const overview = `Viewed through a ${mood.toLowerCase()} emotional lens, this dream weaves ${primarySymbolNames} into an inner dialogue about transition and awareness. Rather than predicting external events, the narrative invites you to notice where waking habits meet unspoken feelings seeking space and expression.`;

  const styleModifier = STYLE_VISUAL_MODIFIERS[artStyle] || `${artStyle}, fine art masterpiece, atmospheric lighting`;
  const narrativeVisualCore = dreamContent
    .trim()
    .slice(0, 175)
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s,.'-]/g, '');

  const imagePrompt = `${narrativeVisualCore}. Scene bathed in a ${mood.toLowerCase()} atmosphere, rendered as ${styleModifier}, cinematic composition, volumetric light, rich depth, intricate sensory detail, 8k`;
  const { cleanPrompt, seed, imageUrl } = buildPollinationsImageUrl(imagePrompt);

  return {
    success: true,
    source: 'depth-psychology-engine',
    psychology: {
      overview,
      archetypes,
      keySymbols,
      journalPrompts: [
        `Where in your waking week have you felt a similar "${mood.toLowerCase()}" emotional undercurrent?`,
        `If "${keySymbols[0].symbol}" in this dream offered you one direct piece of advice, what would it say?`,
        'What small boundary or creative shift would help honor what surfaced during this dream?'
      ],
      colorPalette: COLOR_PALETTES[artStyle] || ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6']
    },
    visualizer: {
      imagePrompt,
      artStyle,
      negativePrompt: 'blurry, low quality, deformed, text, watermark, bad anatomy, noisy, cropped',
      imageUrl,
      cleanPrompt,
      seed
    }
  };
}
