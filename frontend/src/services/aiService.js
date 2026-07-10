import api from './api';

const aiService = {
  /**
   * Performs spelling and grammar analysis on text.
   *
   * @param {string} text original text to check
   */
  checkGrammar: async (text) => {
    const response = await api.post('/api/v1/ai/grammar', { text });
    return response.data;
  },

  /**
   * Rephrases text body with requested tone constraints.
   *
   * @param {string} text original text to rewrite
   * @param {string} tone target tone (e.g. ACADEMIC, PROFESSIONAL, CREATIVE, SIMPLIFIED)
   */
  rewriteText: async (text, tone) => {
    const response = await api.post('/api/v1/ai/rewrite', { text, tone });
    return response.data;
  },

  /**
   * Generates taking point summaries of assignment documents text.
   *
   * @param {string} text original text to summarize
   * @param {string} length length constraint (e.g. SHORT, MEDIUM, BULLET_POINTS)
   */
  summarizeText: async (text, length) => {
    const response = await api.post('/api/v1/ai/summarize', { text, length });
    return response.data;
  },
};

export default aiService;
