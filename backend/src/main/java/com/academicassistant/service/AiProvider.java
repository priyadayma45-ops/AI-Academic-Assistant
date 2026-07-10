package com.academicassistant.service;

import com.academicassistant.dto.GrammarCheckResponse;

/**
 * Abstraction interface for AI Operations (Grammar checks, Context rewrites, Summaries).
 * Decouples code from specific vendor APIs like Google Gemini, OpenAI, or Anthropic.
 */
public interface AiProvider {

    /**
     * Conducts a detailed spelling, syntax, and grammar audit on a text body.
     * Returns structured corrections and rule explanations.
     *
     * @param text the text body to check
     * @return structured grammar checker response
     */
    GrammarCheckResponse analyzeGrammar(String text);

    /**
     * Rewrites a text block to match a specific academic or professional tone.
     *
     * @param text the original text
     * @param tone the target tone (e.g. ACADEMIC, PROFESSIONAL, CREATIVE, SIMPLIFIED)
     * @return the rewritten text
     */
    String rewrite(String text, String tone);

    /**
     * Generates a summary of a text block matching requested lengths.
     *
     * @param text   the original text
     * @param length the target length style (e.g. SHORT, MEDIUM, BULLET_POINTS)
     * @return the summarized text
     */
    String summarize(String text, String length);
}
