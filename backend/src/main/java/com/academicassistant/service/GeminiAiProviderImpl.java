package com.academicassistant.service;

import com.academicassistant.dto.GrammarCheckResponse;
import com.academicassistant.dto.GrammarError;
import com.academicassistant.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of {@link AiProvider} connecting to Google Gemini 1.5 Flash Developer API.
 * Configures structured response MimeTypes and validates JSON response structures.
 */
@Service
@Profile("!test")
@Slf4j
public class GeminiAiProviderImpl implements AiProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String geminiUrl;

    public GeminiAiProviderImpl(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}") String geminiUrl) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.geminiUrl = geminiUrl;
    }

    @Override
    public GrammarCheckResponse analyzeGrammar(String text) {
        if (text == null || text.trim().isEmpty()) {
            return GrammarCheckResponse.builder()
                    .errors(new ArrayList<>())
                    .fullyCorrectedText("")
                    .build();
        }

        String prompt = "You are a professional academic grammar checker and English writing coach.\n" +
                "Analyze the following text for spelling, punctuation, syntax, styling, and grammar errors.\n" +
                "Return your response ONLY as a JSON object matching this schema:\n" +
                "{\n" +
                "  \"errors\": [\n" +
                "    {\n" +
                "      \"originalText\": \"incorrect string segment from original text\",\n" +
                "      \"correctedText\": \"corrected replacement string suggestion\",\n" +
                "      \"explanation\": \"the detailed explanation of the rule violated and why the correction is needed\",\n" +
                "      \"offset\": 0,\n" +
                "      \"length\": 5\n" +
                "    }\n" +
                "  ],\n" +
                "  \"fullyCorrectedText\": \"the complete original text with all errors fixed\"\n" +
                "}\n" +
                "Rules:\n" +
                "1. If there are no errors, return the errors array empty and the fullyCorrectedText as the exact original text.\n" +
                "2. Provide clear, supportive reasons for corrections (act as a writing coach).\n" +
                "3. Ensure offsets are accurate 0-based character indices in the original text.\n" +
                "Text to analyze:\n" +
                "\"" + text + "\"";

        try {
            String rawJsonResult = callGeminiApi(prompt, true);
            log.debug("Gemini raw grammar response: {}", rawJsonResult);

            // Validate and parse the response JSON structure
            GrammarCheckResponse response = objectMapper.readValue(rawJsonResult, GrammarCheckResponse.class);
            
            // Check for potential schema malformations (null properties)
            if (response.getErrors() == null) {
                response.setErrors(new ArrayList<>());
            }
            if (response.getFullyCorrectedText() == null) {
                response.setFullyCorrectedText(text);
            }
            
            return response;

        } catch (Exception e) {
            log.error("Failed to parse or validate Gemini grammar response JSON.", e);
            // Fallback response: return original text with a warning notification block
            GrammarError error = GrammarError.builder()
                    .originalText("")
                    .correctedText("")
                    .explanation("Failed to parse structural AI suggestions. Please verify formatting syntax.")
                    .offset(0)
                    .length(0)
                    .build();

            return GrammarCheckResponse.builder()
                    .errors(List.of(error))
                    .fullyCorrectedText(text)
                    .build();
        }
    }

    @Override
    public String rewrite(String text, String tone) {
        String prompt = "Rewrite the following text to match a " + tone.toLowerCase() + " style or tone while preserving its original meaning:\n" +
                "\"" + text + "\"";
        try {
            return callGeminiApi(prompt, false);
        } catch (Exception e) {
            log.error("Failed to call Gemini rewrite API", e);
            return "[Error: Rewrite failed. Original text preserved]\n" + text;
        }
    }

    @Override
    public String summarize(String text, String length) {
        String formatInstruction = "short paragraph summary";
        if ("MEDIUM".equalsIgnoreCase(length)) {
            formatInstruction = "medium paragraph summary (3-5 sentences)";
        } else if ("BULLET_POINTS".equalsIgnoreCase(length)) {
            formatInstruction = "list of key takeaway bullet points";
        }

        String prompt = "Summarize the following text as a " + formatInstruction + ":\n" +
                "\"" + text + "\"";
        try {
            return callGeminiApi(prompt, false);
        } catch (Exception e) {
            log.error("Failed to call Gemini summary API", e);
            return "[Error: Summarize failed. Original text preserved]\n" + text;
        }
    }

    /**
     * Executes post requests against Google Gemini API endpoints.
     */
    private String callGeminiApi(String prompt, boolean requireJson) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new BadRequestException("Google Gemini API Key is missing. Configure app.gemini.api-key inside local properties.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build Payload
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partsContainer = new HashMap<>();
        partsContainer.put("parts", List.of(textPart));

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(partsContainer));

        if (requireJson) {
            Map<String, Object> mimeConfig = new HashMap<>();
            mimeConfig.put("responseMimeType", "application/json");
            payload.put("generationConfig", mimeConfig);
        }

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        String url = geminiUrl + "?key=" + apiKey;

        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode candidate = rootNode.path("candidates").get(0);
            if (candidate == null) {
                throw new RuntimeException("Gemini returned empty response candidates list.");
            }
            return candidate.path("content").path("parts").get(0).path("text").asText();
        } else {
            throw new RuntimeException("Gemini HTTP request returned error code: " + response.getStatusCode());
        }
    }
}
