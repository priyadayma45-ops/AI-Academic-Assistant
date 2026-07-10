package com.academicassistant.controller;

import com.academicassistant.dto.ApiResponse;
import com.academicassistant.dto.DashboardStatsResponse;
import com.academicassistant.dto.DocumentResponse;
import com.academicassistant.entity.User;
import com.academicassistant.exception.ResourceNotFoundException;
import com.academicassistant.repository.UserRepository;
import com.academicassistant.security.UserDetailsImpl;
import com.academicassistant.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller exposing document upload, paged search, download streaming, and analytics endpoints.
 */
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Document Controller", description = "Endpoints for document upload, analysis status, and dashboard stats")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    /**
     * Uploads academic document file and schedules asynchronous grading task.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload assignment file", description = "Saves file locally and schedules an asynchronous analysis check.")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("file") MultipartFile file) {

        log.info("Received upload file request from user: {}", userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        
        DocumentResponse response = documentService.uploadDocument(user, file);
        
        // Trigger Async grading analysis thread
        documentService.asyncAnalyzeDocument(response.getId());

        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully. Grading analysis is running in the background.", response));
    }

    /**
     * Lists documents uploaded by the authenticated user with pageable grids.
     */
    @GetMapping
    @Operation(summary = "List user uploaded assignments", description = "Retrieves paginated document lists uploaded by the student.")
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> listDocuments(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 10) Pageable pageable) {

        log.info("Listing documents for user: {} with page parameters", userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        Page<DocumentResponse> documents = documentService.listDocuments(user, pageable);

        return ResponseEntity.ok(ApiResponse.success("Retrieved user documents list successfully.", documents));
    }

    /**
     * Retrieves analytics totals and recent uploaded table lists in one request.
     */
    @GetMapping("/stats")
    @Operation(summary = "Get dashboard analytics statistics", description = "Returns total documents, average score, and recent lists.")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Generating dashboard statistics metrics for user: {}", userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        DashboardStatsResponse stats = documentService.getDashboardStats(user);

        return ResponseEntity.ok(ApiResponse.success("Generated dashboard statistics successfully.", stats));
    }

    /**
     * Fetches details and status of specific assignment file.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get specific assignment details", description = "Retrieves grading scores and parsing state by ID.")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentDetails(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {

        log.info("Fetching details for document ID: {} requested by: {}", id, userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        DocumentResponse details = documentService.getDocumentDetails(id, user);

        return ResponseEntity.ok(ApiResponse.success("Retrieved document details successfully.", details));
    }

    /**
     * Streams the uploaded document back to client browser.
     */
    @GetMapping("/{id}/download")
    @Operation(summary = "Download original document file", description = "Streams raw document resource as downloadable attachment.")
    public ResponseEntity<Resource> downloadDocumentFile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {

        log.info("Downloading file resource for document ID: {} requested by: {}", id, userDetails.getUsername());
        User user = getUserFromPrincipal(userDetails);
        
        Resource resource = documentService.getDocumentFileResource(id, user);
        DocumentResponse details = documentService.getDocumentDetails(id, user);

        String contentType = "application/octet-stream";
        if (details.getFilename().endsWith(".pdf")) {
            contentType = MediaType.APPLICATION_PDF_VALUE;
        } else if (details.getFilename().endsWith(".docx")) {
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (details.getFilename().endsWith(".txt")) {
            contentType = MediaType.TEXT_PLAIN_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + details.getFilename() + "\"")
                .body(resource);
    }

    // Helper lookup resolver
    private User getUserFromPrincipal(UserDetailsImpl userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User session resolved to untracked entity: " + userDetails.getUsername()));
    }
}
