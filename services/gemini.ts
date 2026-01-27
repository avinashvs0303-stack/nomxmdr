// services/gemini.ts
// Gemini is disabled - these functions return safe fallbacks

export const geminiService = {
  generateSAR: async (_context: string): Promise<string> => {
    return 'AI-powered report generation is not available. Please configure VITE_GEMINI_API_KEY to enable this feature.';
  },

  fetchSecurityNews: async (): Promise<any[]> => {
    return [];
  }
};
