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

// Simulated Journal Analysis generator supporting optional image attachment details
export async function simulateJournalAnalysis(
  text: string,
  mood: number,
  stress: number,
  profile: StudentProfile,
  image?: { data: string; mimeType: string }
): Promise<JournalAnalysis> {
  await delay(1500); // Simulate API latency

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

  if (image) {
    triggers.push('Image source trigger: revision logs / syllabus checklist analysis');
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

  const burnoutRiskScore = Math.min(100, Math.max(10, stress * 9 + (10 - mood) * 4 + (image ? 10 : 0)));

  let insightsSummary = `You are showing signs of ${stressLevelWord} academic stress related to your ${exam} prep. The upcoming countdown might be adding subconscious pressure. Let's redirect focus from syllabus volume to consistent quality sessions.`;
  if (image) {
    insightsSummary = `[SIMULATION Mode: Analyzed attached ${image.mimeType} image document] your uploaded schedule indicates high workload density. Combined with logged stress levels, your burnout indicators suggest immediate scheduling adjustments.`;
  }

  return {
    emotionalTone,
    hiddenTriggers: triggers,
    burnoutRiskScore,
    insightsSummary,
    copingStrategies,
    mindfulnessExercise: {
      title: "The 4-7-8 Deep Focus Breathing",
      description: "Inhale for 4 seconds, hold your breath for 7 seconds, and exhale slowly for 8 seconds. Repeat 4 times to down-regulate the nervous system.",
      type: "breathing"
    }
  };
}

// Generate real analysis using Gemini API (supports Multimodal Image Input)
export async function analyzeJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'timestamp' | 'analysis'>,
  profile: StudentProfile
): Promise<JournalAnalysis> {
  const genAI = getGeminiClient();

  if (!genAI) {
    return simulateJournalAnalysis(entry.journalText, entry.mood, entry.stressLevel, profile, entry.image);
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
      
      If an image is attached, inspect the image (mock test logs, checklist schedules, or notes screenshot) for indicators of academic load or errors that might be stress triggers.
      
      Perform a deep psychological and visual analysis. Detect emotional tone, hidden stress triggers specific to competitive exam prep in India (e.g. peer pressure, syllabus backlogs, mock test scores, physical strain, sleep deprivation, fear of failure), and current burnout risk.
      
      Respond STRICTLY in JSON format with the following keys:
      {
        "emotionalTone": "A short, descriptive emotional tone (e.g., 'Anxious yet determined', 'Calm and optimistic')",
        "hiddenTriggers": ["Array of 2-3 specific triggers uncovered in text/image (e.g., 'Organic Chemistry backlog', 'Fear of relative performance in mock tests')"],
        "burnoutRiskScore": number between 1 and 100,
        "insightsSummary": "A highly empathetic, 2-3 sentence analysis of their current mental state, validating their effort, and referencing any findings from their uploaded image if relevant.",
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

    // Construct content parts for multimodal request
    const contentParts: any[] = [prompt];

    if (entry.image) {
      contentParts.push({
        inlineData: {
          data: entry.image.data,
          mimeType: entry.image.mimeType
        }
      });
    }

    const result = await model.generateContent(contentParts);
    const textResponse = result.response.text();
    return JSON.parse(textResponse) as JournalAnalysis;
  } catch (error) {
    console.error("Gemini API error, falling back to simulation:", error);
    return simulateJournalAnalysis(entry.journalText, entry.mood, entry.stressLevel, profile, entry.image);
  }
}

// Keyword-routing mock chat response — exported so tests can call it directly
// without triggering a real API call even when an API key is present.
export async function simulateChatResponse(
  message: string,
  profile: StudentProfile,
  image?: { data: string; mimeType: string }
): Promise<string> {
  await delay(50); // minimal delay in test mode
  const msgLower = message.toLowerCase();
  const exam = profile.examType.toUpperCase();

  if (image) {
    return `[SIMULATION Mode: Analyzed attached ${image.mimeType} image] I see the details in this document, ${profile.name}. It looks like there's a heavy academic workload or mock test scores sheet. Don't let these single numbers define your self-worth. Let's break down this revision checklist topic-by-topic.`;
  }
  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
    return `Hello ${profile.name}! I'm Serenity. How are you holding up today with your ${exam} preparation? Remember, you're more than just a roll number or percentile. What's on your mind?`;
  }
  if (msgLower.includes('stress') || msgLower.includes('anxious') || msgLower.includes('scared') || msgLower.includes('worry')) {
    return `It is completely natural to feel overwhelmed, ${profile.name}. The competition for ${exam} is intense, and that weight can feel heavy. Let's focus only on what we can control today. Have you tried dividing your syllabus backlogs into micro-topics of 30 minutes each? Let's take a slow breath.`;
  }
  if (msgLower.includes('backlog') || msgLower.includes('syllabus') || msgLower.includes('study') || msgLower.includes('revision')) {
    return `Backlogs are the number one source of stress for ${exam} aspirants. Try setting aside just one 'Revision Hour' early in the morning before starting your daily schedule. This prevents backlog anxiety from consuming your entire day. Which topic is giving you trouble right now?`;
  }
  if (msgLower.includes('sleep') || msgLower.includes('tired') || msgLower.includes('exhausted')) {
    return `Sleep is non-negotiable for memory consolidation, ${profile.name}. Even a short 20-minute nap can restore cognitive clarity better than another hour of exhausted reading. Tonight, aim to wind down 30 minutes before bed — your ${exam} prep will thank you for it.`;
  }
  if (msgLower.includes('mock') || msgLower.includes('test') || msgLower.includes('score') || msgLower.includes('result')) {
    return `One mock score is a data point, not your destiny, ${profile.name}. Review where marks were lost, pick the top two weak areas, and dedicate focused time to those this week. Consistent small improvements compound into ${exam} readiness.`;
  }
  return `I hear you, ${profile.name}. Preparing for ${exam} is as much a mental marathon as an academic one. Be proud of the effort you've put in today. How about we design a micro-schedule or run through a quick 2-minute grounding exercise to clear your head?`;
}

// Generate Chat Response from Serenity AI (supports Multimodal image attachments)
export async function getChatResponse(
  message: string,
  history: { role: 'user' | 'model'; content: string }[],
  profile: StudentProfile,
  recentEntries: JournalEntry[],
  image?: { data: string; mimeType: string }
): Promise<string> {
  const genAI = getGeminiClient();

  if (!genAI) {
    // Delegate to the standalone mock function (1 s delay for realistic feel)
    await delay(950);
    return simulateChatResponse(message, profile, image);
  }

  try {
    // gemini-3.1-flash-lite supports generateContent + startChat (unlike the Live audio model)
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    // Format recent journals for context
    const recentJournalSummary = recentEntries.slice(0, 3).map(e =>
      `Date: ${new Date(e.timestamp).toLocaleDateString()}, Mood: ${e.mood}/10, Stress: ${e.stressLevel}/10, Text: "${e.journalText}"`
    ).join('\n');

    const systemPrompt = `You are "Serenity", a warm, deeply empathetic AI wellness companion for students preparing for highly competitive exams.
You are speaking with ${profile.name}, who is preparing for the ${profile.examType} exam in ${profile.targetYear}.
The current baseline stress they logged is ${profile.currentStressLevel}/10.

Here is the summary of their recent journal logs to help you stay context-aware:
${recentJournalSummary || 'No journal entries logged yet.'}

Rules:
1. Be warm, supportive, and use gentle language. Act like a wise mentor who cares about their mental health, not just scores.
2. Frame recommendations around exam-specific stress triggers (e.g. syllabus backlogs, negative mock test feedback, fatigue from sitting all day, parental pressure, self-doubt).
3. Keep responses conversational and concise (2-4 sentences max per response so it feels like a real chat).
4. Avoid sounding generic — vary your responses based on the student's exact words. Never give the same response twice.
5. Mention their target exam (${profile.examType}) and name (${profile.name}) naturally within your reply.
6. If an image is attached, describe what you observe and give specific empathetic feedback on it.
7. Never diagnose clinical conditions; if they seem extremely distressed, gently encourage professional support.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        {
          role: 'model',
          parts: [{ text: `Understood. I am Serenity, ready to support ${profile.name} through their ${profile.examType} journey with genuine empathy and personalised advice.` }]
        },
        ...history.map(h => ({
          role: h.role as 'user' | 'model',
          parts: [{ text: h.content }]
        }))
      ]
    });

    const userParts: any[] = [{ text: message }];
    if (image) {
      userParts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    const result = await chat.sendMessage(userParts);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Chat API error, falling back to contextual mock response:", error);
    // Vary the fallback based on actual message content so it never feels identical
    const msgLower = message.toLowerCase();
    const exam = profile.examType.toUpperCase();
    if (msgLower.includes('stress') || msgLower.includes('anxious') || msgLower.includes('worried')) {
      return `Feeling that pressure is natural, ${profile.name} — ${exam} is one of the most demanding exams out there. Try breaking today into just two or three focused 45-minute blocks and let go of the rest for now. You're doing more than you realise.`;
    }
    if (msgLower.includes('sleep') || msgLower.includes('tired') || msgLower.includes('exhausted')) {
      return `Sleep deprivation is one of the silent killers of exam performance, ${profile.name}. Even a 20-minute power nap can restore focus better than another hour of tired reading. Prioritise rest tonight — your brain consolidates learning while you sleep.`;
    }
    if (msgLower.includes('backlog') || msgLower.includes('syllabus') || msgLower.includes('behind')) {
      return `Backlogs can feel like a mountain, but they're really just a series of small hills, ${profile.name}. Pick the single highest-yield topic in your ${exam} syllabus and spend just 30 focused minutes on it today. Progress beats perfection every time.`;
    }
    if (msgLower.includes('mock') || msgLower.includes('test') || msgLower.includes('score')) {
      return `One mock score doesn't define your ${exam} outcome, ${profile.name}. Treat it as a diagnostic tool — identify the top three weak areas and spend targeted time there this week. Consistent improvement is the real goal.`;
    }
    if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
      return `Hello ${profile.name}! I'm Serenity, your wellness companion for the ${exam} journey. How are you feeling today — are you in a study groove, or is something weighing on your mind?`;
    }
    return `I hear you, ${profile.name}. Whatever you're going through with your ${exam} prep, remember that your mental health comes first. Tell me more about what's on your mind — I'm here to help you find a path forward.`;
  }
}

// Generate spoken audio instructions during meditation sessions using gemini-3.5-live
export async function getMeditationSpeech(
  profile: StudentProfile,
  stressLevel: number,
  phase: 'In' | 'Hold' | 'Out'
): Promise<string> {
  const genAI = getGeminiClient();
  const exam = profile.examType.toUpperCase();

  if (!genAI) {
    await delay(300);
    const mockGuides = {
      In: [
        `Inhale peace, ${profile.name}. Feel the air filling your lungs, releasing the ${exam} backlog.`,
        `Breathe in clean focus, ${profile.name}. Let go of study expectations.`,
        `Slowly draw in strength. You are more than any single mock exam score.`
      ],
      Hold: [
        `Hold and stabilize your thoughts. Let your mind settle in absolute quiet.`,
        `Keep still, ${profile.name}. Find the quiet gap between your revision sessions.`,
        `Hold the breath. Feel the stillness. There is no academic urgency in this moment.`
      ],
      Out: [
        `Exhale completely. Release all tension from your shoulders, ${profile.name}.`,
        `Let the ${exam} pressure flow out with your breath. Empty your mind.`,
        `Exhale and relax. Your effort today is enough. You are doing well.`
      ]
    }[phase];
    return mockGuides[Math.floor(Math.random() * mockGuides.length)];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const prompt = `You are "Serenity", an empathetic student wellness meditation coach.
Create exactly one short, soothing, and relaxing sentence (maximum 12 words) guiding ${profile.name} who is preparing for the ${profile.examType} competitive exam (current stress: ${stressLevel}/10).
The student is in the breathing phase: "${phase}" (Inhale, Hold, or Exhale).
Keep it personal, use their name ${profile.name} and address academic stress or exam tension naturally. Do not include quotes or extra formatting — just the sentence itself.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Meditation Speech error:", error);
    return `Gently focus on your breathing, ${profile.name}. Release the academic tension.`;
  }
}
