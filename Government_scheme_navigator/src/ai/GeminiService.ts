import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenerativeAI(API_KEY);

export async function getGeminiResponse(prompt: string) {
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    return "API Key not configured. Please add your VITE_GEMINI_API_KEY to the .env file.";
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
}

export async function chatWithGemini(messages: { role: string; content: string }[], language: string = 'en') {
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    return "API Key not configured. Please add your VITE_GEMINI_API_KEY to the .env file.";
  }

  try {
    const langMap: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi',
      'ta': 'Tamil'
    };
    const targetLang = langMap[language] || 'English';

    // Convert messages to the SDK format
    const contents = messages.map(msg => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are GovAssist AI, a helpful, empathetic, and professional government scheme assistant. 
Your goal is to help users navigate government welfare schemes and clear all their "doubts."

CRITICAL RULES:
1. Language: You MUST respond ONLY in ${targetLang}.
2. Personality: Be friendly, warm, and supportive. Use phrases like "I understand," or "That's a great question!"
3. Doubts Handling: If a user asks a question about a scheme, eligibility, or why you need specific data (like income or age), provide a clear, concise, and helpful explanation.
4. Onboarding Context: If you know the user is in the middle of a profile setup, answer their question first, then gently encourage them to provide the missing information to proceed.
5. Formatting: Use bullet points for lists and bold important terms for readability.
6. Tone: Professional yet accessible. Avoid overly technical jargon unless explaining a legal term.`
    });

    const result = await model.generateContent({
      contents: contents,
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error Details:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `I'm having trouble connecting to my brain right now. (Error: ${errorMessage}). Please try again later.`;
  }
}
