package com.academicassistant.controller;

import com.academicassistant.dto.*;
import com.academicassistant.entity.User;
import com.academicassistant.exception.ResourceNotFoundException;
import com.academicassistant.repository.UserRepository;
import com.academicassistant.security.UserDetailsImpl;
import com.academicassistant.service.AiAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller exposing academic AI coach utilities (Grammar checks, context rephrasing, summarizations).
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Controller", description = "AI Coach assistant endpoints for grammar, rewriting, and summaries")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

    private final AiAnalysisService aiAnalysisService;
    private final UserRepository userRepository;

    /**
     * Inspects text for spelling and syntax issues, returning structured correction explanations.
     */
    @PostMapping("/grammar")
    @Operation(summary = "Analyze text grammar", description = "Inspects document text and provides highlighted recommendations with reasons.")
    public ResponseEntity<ApiResponse<GrammarCheckResponse>> checkGrammar(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody GrammarCheckRequest requestBody,
            HttpServletRequest request) {

        log.info("Received grammar check request from user: {}", userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        String ipAddress = getClientIp(request);

        GrammarCheckResponse response = aiAnalysisService.checkGrammar(user, requestBody.getText(), ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Grammar audit completed successfully.", response));
    }

    /**
     * Rewrites text to match selected academic/professional tones.
     */
    @PostMapping("/rewrite")
    @Operation(summary = "Rewrite text block", description = "Rephrases assignment text according to tone constraints.")
    public ResponseEntity<ApiResponse<String>> rewriteText(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody RewriteRequest requestBody,
            HttpServletRequest request) {

        log.info("Received rewrite request for tone: {} from user: {}", requestBody.getTone(), userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        String ipAddress = getClientIp(request);

        String response = aiAnalysisService.rewriteText(user, requestBody.getText(), requestBody.getTone(), ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Text rewritten successfully.", response));
    }

    /**
     * Generates summaries from a body of text.
     */
    @PostMapping("/summarize")
    @Operation(summary = "Summarize text body", description = "Generates taking point summaries of assignment documents.")
    public ResponseEntity<ApiResponse<String>> summarizeText(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody SummaryRequest requestBody,
            HttpServletRequest request) {

        log.info("Received summarize request for format: {} from user: {}", requestBody.getLength(), userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        String ipAddress = getClientIp(request);

        String response = aiAnalysisService.summarizeText(user, requestBody.getText(), requestBody.getLength(), ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Text summarized successfully.", response));
    }

    // Helper lookup resolver
    private User getUserFromPrincipal(UserDetailsImpl userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User session resolved to untracked entity: " + userDetails.getUsername()));
    }

    // Helper IP resolver
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
