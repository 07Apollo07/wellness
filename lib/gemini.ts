import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudentProfile, JournalEntry, JournalAnalysis } from './storage';

// Initialize the Gemini API client safely
const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('your_gemini_api_key_here') || key.trim() === '') {
    return null;
  }
  return key;
};

// Check if we are in simulated/mock mode
export const isMockMode = () => {
  return getApiKey() === null;
};

// Helper to get Gemini client
const getGeminiClient = () => {
  const key = getApiKey();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

// Helper for simulated delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated Journal Analysis generator
export async function simulateJournalAnalysis(
  text: string,
  mood: number,
  stress: number,
  profile: StudentProfile
): Promise<JournalAnalysis> {
  await delay(1200); // Simulate API latency

  const exam = profile.examType.toUpperCase();
  const stressLevelWord = stress > 7 ? 'critical' : stress > 4 ? 'moderate' : 'low';

  // Custom mock response tailored to their input text and profile details
  const triggers: string[] = [];
  if (text.toLowerCase().includes('chemistry') || text.toLowerCase().includes('chem')) {
    triggers.push('Organic Chemistry reactions backlog');
  }
  if (text.toLowerCase().includes('math') || text.toLowerCase().includes('physics')) {
    triggers.push('Numerical solving speed & difficulty');
  }
  if (text.toLowerCase().includes('syllabus') || text.toLowerCase().includes('backlog')) {
    triggers.push('Syllabus backlog anxiety');
  }
  if (text.toLowerCase().includes('mock') || text.toLowerCase().includes('test') || text.toLowerCase().includes('exam')) {
    triggers.push('Mock test score volatility');
  }
  if (text.toLowerCase().includes('sleep') || text.toLowerCase().includes('tired')) {
    triggers.push('Irregular sleep cycles and burnout fatigue');
  }
  if (triggers.length === 0) {
    triggers.push('Fear of not meeting family expectations');
    triggers.push('Long sitting hours fatigue');
  }

  // Create customized strategies
  const copingStrategies = [
    `Break the next 24 hours into 45-minute study intervals followed by 10-minute active breaks to avoid mental exhaustion.`,
    `Focus purely on revision notes for high-yield topics today rather than solving full-length mock tests to rebuild confidence.`,
    `Spend 10 minutes talking to a peer or family member without discussing ${exam} preparation.`
  ];

  let emotionalTone = 'Reflective & slightly anxious';
  if (mood > 7) emotionalTone = 'Optimistic & focused';
  else if (mood < 4) emotionalTone = 'Overwhelmed & fatigued';

  const burnoutRiskScore = Math.min(100, Math.max(10, stress * 9 + (10 - mood) * 4));

  return {
    emotionalTone,
    hiddenTriggers: triggers,
    burnoutRiskScore,
    insightsSummary: `You are showing signs of ${stressLevelWord} academic stress related to your ${exam} prep. The upcoming countdown might be adding subconscious pressure. Let's redirect focus from syllabus volume to consistent quality sessions.`,
    copingStrategies,
    mindfulnessExercise: {
      title: "The 4-7-8 Deep Focus Breathing",
      description: "Inhale for 4 seconds, hold your breath for 7 seconds, and exhale slowly for 8 seconds. Repeat 4 times to down-regulate the nervous system.",
      type: "breathing"
    }
  };
}

// Generate real analysis using Gemini API
export async function analyzeJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'timestamp' | 'analysis'>,
  profile: StudentProfile
): Promise<JournalAnalysis> {
  const genAI = getGeminiClient();

  if (!genAI) {
    return simulateJournalAnalysis(entry.journalText, entry.mood, entry.stressLevel, profile);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert student psychologist and mental wellness coach helping a student preparing for the ${profile.examType} exam (target year ${profile.targetYear}).
      
      Here is the student's profile:
      - Name: ${profile.name}
      - Preparing for: ${profile.examType}
      - Target Year: ${profile.targetYear}
      - Overall baseline stress level: ${profile.currentStressLevel}/10
      
      Today's journal entry and logged metrics:
      - Today's logged Mood: ${entry.mood}/10 (1 is lowest, 10 is happiest)
      - Today's logged Stress: ${entry.stressLevel}/10
      - Today's Sleep Quality: ${entry.sleepQuality}/10
      - Today's Focus Quality: ${entry.focusQuality}/10
      
      Journal text:
      """
      ${entry.journalText}
      """
      
      Perform a deep psychological analysis. Detect emotional tone, hidden stress triggers specific to competitive exam prep in India (e.g. peer pressure, syllabus backlogs, mock test scores, physical strain, sleep deprivation, fear of failure), and current burnout risk.
      
      Respond STRICTLY in JSON format with the following keys:
      {
        "emotionalTone": "A short, descriptive emotional tone (e.g., 'Anxious yet determined', 'Calm and optimistic')",
        "hiddenTriggers": ["Array of 2-3 specific triggers uncovered in text (e.g., 'Organic Chemistry backlog', 'Fear of relative performance in mock tests')"],
        "burnoutRiskScore": number between 1 and 100,
        "insightsSummary": "A highly empathetic, 2-3 sentence analysis of their current mental state, validating their effort and offering a warm perspective.",
        "copingStrategies": [
          "Strategy 1: 1-sentence highly actionable prep adjustment or mental micro-rest technique specific to their target exam and stress points.",
          "Strategy 2: Another specific 1-sentence actionable technique.",
          "Strategy 3: A third specific 1-sentence actionable technique."
        ],
        "mindfulnessExercise": {
          "title": "A short engaging name for a customized exercise",
          "description": "Step-by-step 2-sentence description of the micro-exercise they can do right now (breathing, grounding, sensory, etc.)",
          "type": "breathing" or "grounding" or "sensory"
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse) as JournalAnalysis;
  } catch (error) {
    console.error("Gemini API error, falling back to simulation:", error);
    return simulateJournalAnalysis(entry.journalText, entry.mood, entry.stressLevel, profile);
  }
}

// Generate Chat Response from Serenity AI
export async function getChatResponse(
  message: string,
  history: { role: 'user' | 'model'; content: string }[],
  profile: StudentProfile,
  recentEntries: JournalEntry[]
): Promise<string> {
  const genAI = getGeminiClient();

  if (!genAI) {
    // Simulated friendly chatbot responses
    await delay(1000);
    const msgLower = message.toLowerCase();
    const exam = profile.examType.toUpperCase();

    if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
      return `Hello ${profile.name}! I'm Serenity. How are you holding up today with your ${exam} preparation? Remember, you're more than just a roll number or percentile. What's on your mind?`;
    }
    if (msgLower.includes('stress') || msgLower.includes('anxious') || msgLower.includes('scared') || msgLower.includes('worry')) {
      return `It is completely natural to feel overwhelmed, ${profile.name}. The competition for ${exam} is intense, and that weight can feel heavy. Let's focus only on what we can control today. Have you tried dividing your syllabus backlogs into micro-topics of 30 minutes each? Let's take a slow breath.`;
    }
    if (msgLower.includes('backlog') || msgLower.includes(' syllabus') || msgLower.includes('study') || msgLower.includes('revision')) {
      return `Backlogs are the number one source of stress for ${exam} aspirants. Try setting aside just one 'Revision Hour' early in the morning before starting your daily schedule. This prevents backlog anxiety from consuming your entire day. Which topic is giving you trouble right now?`;
    }
    if (msgLower.includes('chemistry') || msgLower.includes('physics') || msgLower.includes('math') || msgLower.includes('bio') || msgLower.includes('upsc') || msgLower.includes('gate') || msgLower.includes('mock')) {
      return `Ah, that subject can be tricky. When studying tough concepts, try the 'Feynman Technique': explain the concept out loud as if you're teaching a 10-year-old. It highlights gaps in your understanding instantly! How can I help you tackle this topic today?`;
    }

    return `I hear you, ${profile.name}. Preparing for ${exam} is as much a mental marathon as an academic one. Be proud of the effort you've put in today. How about we design a micro-schedule or run through a quick 2-minute grounding exercise to clear your head?`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    // Format recent journals for context
    const recentJournalSummary = recentEntries.slice(0, 3).map(e =>
      `Date: ${new Date(e.timestamp).toLocaleDateString()}, Mood: ${e.mood}/10, Stress: ${e.stressLevel}/10, Text: "${e.journalText}"`
    ).join('\n');

    const chatContext = `
      You are "Serenity", a warm, deeply empathetic AI wellness companion for students preparing for highly competitive exams.
      You are speaking with ${profile.name}, who is preparing for the ${profile.examType} exam in ${profile.targetYear}.
      The current baseline stress they logged is ${profile.currentStressLevel}/10.
      
      Here is the summary of their recent journal logs to help you stay context-aware:
      ${recentJournalSummary || 'No journal entries logged yet.'}
      
      Rules:
      1. Be warm, supportive, and use gentle language. Act like a wise mentor who cares about their mental health, not just scores.
      2. Frame recommendations around exam-specific stress triggers (e.g. syllabus backlogs, negative mock test feedback, fatigue from sitting all day, parental pressure, self-doubt).
      3. Keep responses conversational and concise (2-4 sentences max per response so it feels like a real chat).
      4. Avoid sounding generic. Mention their target exam (${profile.examType}) and name (${profile.name}) naturally.
      5. Never diagnose clinical conditions; if they seem extremely distressed, encourage them to talk to parents, a professional counsellor, or a teacher.
    `;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: chatContext }] },
        { role: 'model', parts: [{ text: `Understood. I am Serenity, ${profile.name}'s mental wellness companion. I will support them through their ${profile.examType} journey with empathy and actionable advice.` }] },
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Chat API error, falling back to mock response:", error);
    // Return a simple simulated fallback
    return `I'm here for you, ${profile.name}. Competitive prep is tough, but your mental health is always priority number one. What specific topic or thought is causing you stress right now? Let's break it down together.`;
  }
}
