import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenerativeAI(API_KEY);

export async function getGeminiResponse(prompt: string) {
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    return "API Key not configured. Please add your VITE_GEMINI_API_KEY to the .env file.";
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
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
      model: "gemini-2.0-flash",
      systemInstruction: `You are a helpful government scheme assistant. You MUST respond ONLY in ${targetLang}. Keep your responses concise and helpful. If the user asks in another language, still respond in ${targetLang}.`
    });

    const result = await model.generateContent({
      contents: contents,
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
}
