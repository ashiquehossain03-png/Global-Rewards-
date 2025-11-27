import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAdContent = async (): Promise<{ title: string; content: string; region: string; network: string }> => {
  try {
    // Generate a random industry to make ads diverse
    const industries = ['Tech', 'Fashion', 'Travel', 'Crypto', 'Automotive', 'Health', 'Food & Beverage'];
    const randomIndustry = industries[Math.floor(Math.random() * industries.length)];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a realistic advertisement for a REAL major global or indian brand in the ${randomIndustry} industry. 
      Return a JSON object with four fields: 
      1. "title" (Brand Name and Product, e.g., "Nike Air Max", "Zomato Gold"), 
      2. "content" (max 30 words, promotional blurb), 
      3. "region" (Target country e.g., USA, India, UK, Germany),
      4. "network" (The ad network serving this. Randomly pick one from: "Google Ad Exchange", "Meta Audience Network", "AppLovin MAX", "Unity Ads", "InMobi", "Amazon Publisher Services").
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.`,
    });

    const text = response.text || '';
    
    // Simple cleanup to ensure we can parse it
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(jsonStr);
    
    return {
      title: data.title || `Premium ${randomIndustry} Partner`,
      content: data.content || "Experience the future of innovation with our latest global products tailored for you.",
      region: data.region || "Global",
      network: data.network || "Google Ad Exchange"
    };
  } catch (error) {
    console.error("Gemini Ad Gen Error:", error);
    // Fallback if API fails or quota exceeded
    return {
      title: "Global Tech Solutions",
      content: "Discover the latest innovations from our premium partners in Silicon Valley. Watch to earn.",
      region: "USA",
      network: "Google Ad Exchange"
    };
  }
};