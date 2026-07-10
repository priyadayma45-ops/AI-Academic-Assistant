package com.academicassistant.service;

import com.academicassistant.dto.GrammarCheckResponse;
import com.academicassistant.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service orchestrating grammar checks, context rewrites, and summaries while recording activity audits.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiAnalysisService {

    private final AiProvider aiProvider;
    private final ActivityLogService activityLogService;

    /**
     * Conducts grammar check audit and logs student transaction.
     */
    @Transactional
    public GrammarCheckResponse checkGrammar(User user, String text, String ipAddress) {
        log.info("Auditing grammar check request for user: {}", user.getEmail());
        
        GrammarCheckResponse result = aiProvider.analyzeGrammar(text);
        
        // Save audit log
        String logDetails = String.format("Analyzed text block of length %d. Found %d errors.", 
                text.length(), result.getErrors().size());
        activityLogService.logActivity(user, "AI_GRAMMAR_CHECK", logDetails, ipAddress);
        
        return result;
    }

    /**
     * Rephrases text body with requested tone constraints and logs teacher/student transaction.
     */
    @Transactional
    public String rewriteText(User user, String text, String tone, String ipAddress) {
        log.info("Auditing text rewrite request for user: {} with tone: {}", user.getEmail(), tone);
        
        String result = aiProvider.rewrite(text, tone);
        
        // Save audit log
        String logDetails = String.format("Rewrote text block of length %d to match tone %s.", 
                text.length(), tone);
        activityLogService.logActivity(user, "AI_REWRITE", logDetails, ipAddress);
        
        return result;
    }

    /**
     * Generates summaries matching requested lengths and logs transaction details.
     */
    @Transactional
    public String summarizeText(User user, String text, String length, String ipAddress) {
        log.info("Auditing text summary request for user: {} with format: {}", user.getEmail(), length);
        
        String result = aiProvider.summarize(text, length);
        
        // Save audit log
        String logDetails = String.format("Summarized text block of length %d with format constraint %s.", 
                text.length(), length);
        activityLogService.logActivity(user, "AI_SUMMARIZE", logDetails, ipAddress);
        
        return result;
    }
}
