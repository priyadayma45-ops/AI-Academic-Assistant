package com.academicassistant.service;

import com.academicassistant.dto.GrammarCheckResponse;
import com.academicassistant.dto.GrammarError;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Mock implementation of {@link AiProvider} used exclusively in the 'test' profile.
 * Prevents active HTTP integration testing queries from triggering external LLM APIs.
 */
@Service
@Profile("test")
public class MockAiProviderImpl implements AiProvider {

    @Override
    public GrammarCheckResponse analyzeGrammar(String text) {
        // Return a mock result
        GrammarError error1 = GrammarError.builder()
                .originalText("teh")
                .correctedText("the")
                .explanation("Spelling mistake. Correct spelling is 'the'.")
                .offset(text.indexOf("teh") != -1 ? text.indexOf("teh") : 0)
                .length(3)
                .build();

        GrammarError error2 = GrammarError.builder()
                .originalText("recieve")
                .correctedText("receive")
                .explanation("Spelling mistake. Remember the rule: 'i' before 'e', except after 'c'.")
                .offset(text.indexOf("recieve") != -1 ? text.indexOf("recieve") : 10)
                .length(7)
                .build();

        String fullyCorrected = text.replace("teh", "the").replace("recieve", "receive");

        return GrammarCheckResponse.builder()
                .errors(List.of(error1, error2))
                .fullyCorrectedText(fullyCorrected)
                .build();
    }

    @Override
    public String rewrite(String text, String tone) {
        return "[Mocked Rewritten Text - Tone: " + tone + "]\n" + text + " (Rephrased professionally for academic integrity)";
    }

    @Override
    public String summarize(String text, String length) {
        if ("BULLET_POINTS".equalsIgnoreCase(length)) {
            return "- [Mocked Bullet 1]: Primary thesis summarizing text.\n- [Mocked Bullet 2]: Secondary analytical argument.";
        }
        return "[Mocked Summary - Length: " + length + "]\nThis is a brief summary of: " + text.substring(0, Math.min(text.length(), 50)) + "...";
    }
}
