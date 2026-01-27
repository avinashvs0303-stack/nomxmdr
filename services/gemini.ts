
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  generateSAR: async (context: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a xMDR Security Analysis Report (SAR) for the following context: ${context}. 
        Format as a professional executive summary with Vulnerabilities, Impact, and Recommendations.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Failed to generate report. Please check API configuration.";
    }
  },

  fetchSecurityNews: async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "List 5 current high-priority cybersecurity news events from this week. Format as JSON array of objects with title, date, summary, and severity (low, medium, high, critical).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                summary: { type: Type.STRING },
                severity: { type: Type.STRING }
              },
              required: ["title", "date", "summary", "severity"]
            }
          }
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("News Generation Error:", error);
      return [];
    }
  }
};
