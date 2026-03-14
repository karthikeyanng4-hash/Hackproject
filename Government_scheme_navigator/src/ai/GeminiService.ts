import { GoogleGenerativeAI } from "@google/generative-ai";
import schemesData from "../data/schemes.json";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are "Agentic AI" (formerly GovAssist AI), an exclusive and highly specialized government scheme assistant. 
Your SOLE purpose is to help users navigate government welfare schemes, clear their doubts about these schemes, and assist them step-by-step in filling out and applying for these schemes.

CRITICAL RULES:
1. STRICT BOUNDARIES: You MUST talk about this project, the government schemes provided, assisting users with their applications, and you MUST answer questions regarding the user's personal details correctly if asked.
2. PERSONAL DETAILS: If a user asks for personal details like their Aadhaar number or DOB, use ONLY the "Profile Details" provided below. Make sure to respond cheerfully!
3. FORMATTING ON EVERY RESPONSE: You MUST ALWAYS start your response with exactly this heading:
<h2 style="color: white; font-weight: bold; text-align: left;">Agentic AI</h2>
4. AVOID ASTERISKS: You MUST NOT use the asterisk (*) character at all in your responses. 
5. HTML FORMATTING: Use basic HTML tags (<b>, <ul>, <li>, <br>) for formatting instead of Markdown. 
6. RESPONSE LENGTH: Your answers must be medium length—neither very long nor very short. Be concise and precise.
7. TONE & OFF-TOPIC REJECTION: Be warm, friendly, and helpful. If a user asks about anything completely unrelated to this platform (like math or coding), politely decline by saying: "I am specifically designed to assist with government schemes and welfare programs. I cannot answer other questions."
8. Application Help: Actively and cheerfully guide users through filling their government forms based on the required fields and conditions.

AVAILABLE SCHEMES DATA FOR REFERENCE:
${JSON.stringify(schemesData, null, 2)}`;

export async function getGeminiResponse(prompt: string) {
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    return "API Key not configured. Please add your VITE_GEMINI_API_KEY to the .env file.";
  }

  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });
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

    const localizedPrompt = SYSTEM_PROMPT.replace("the user's preferred language", targetLang);

    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: localizedPrompt
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

export async function analyzeDocumentWithGemini(file: File, language: string = 'en') {
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

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (base64String) {
          resolve(base64String.split(',')[1]);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const docPrompt = `Analyze this document and extract the following details if present:
- Full Name
- Age / Date of Birth
- Gender
- Address
- State / District / Village
- Occupation
- Annual Income
- Land Ownership
- Category (SC/ST/OBC/General)
- Any government ID numbers

Return the extracted information in clean JSON format. Based on this, suggest major Indian government schemes the citizen may be eligible for (e.g. PM-KISAN, Ayushman Bharat, PM Awas Yojana). Provide a simple, easy-to-understand reason for eligibility.

Format the output EXACTLY in these three sections, using HTML for styling and your mandatory header:

<h2 style="color: white; font-weight: bold; text-align: left;">Agentic AI</h2>
<b>Extracted Citizen Details</b><br/>
<pre>
{
  "name": "...",
  "age": "...",
  "gender": "...",
  "state": "...",
  "district": "...",
  "occupation": "...",
  "annual_income": "...",
  "land_owned": "...",
  "category": "..."
}
</pre><br/><br/>
<b>Recommended Government Schemes</b><br/>
<ul>
<li>...</li>
</ul><br/>
<b>Reason for Eligibility</b><br/>
<ul>
<li>...</li>
</ul>

Reply in ${targetLang}.`;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      docPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Document Analysis Error:", error);
    return "Sorry, I encountered an error while analyzing the document.";
  }
}
