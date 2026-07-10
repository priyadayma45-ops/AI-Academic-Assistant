package com.academicassistant.service;

import com.academicassistant.dto.DashboardStatsResponse;
import com.academicassistant.dto.DocumentResponse;
import com.academicassistant.entity.Document;
import com.academicassistant.entity.User;
import com.academicassistant.exception.BadRequestException;
import com.academicassistant.exception.ResourceNotFoundException;
import com.academicassistant.exception.UnauthorizedException;
import com.academicassistant.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class handling logic for academic document uploads, pagination, dashboard statistics, and async analysis tasks.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    // Supported formats list
    private static final List<String> SUPPORTED_EXTENSIONS = List.of(
            "pdf", "docx", "doc", "txt", "png", "jpg", "jpeg"
    );

    /**
     * Handles file validations, uploads to disk storage, and registers a PENDING document entity in database.
     */
    @Transactional
    public DocumentResponse uploadDocument(User user, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Filename cannot be resolved.");
        }

        // Validate file extension
        String extension = getFileExtension(originalFilename);
        if (!SUPPORTED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Unsupported file type: ." + extension + ". Only PDF, DOCX, DOC, TXT, and Images are supported.");
        }

        try {
            // Save file in Storage Layer
            String storedPath = storageService.store(file);

            // Register entity in DB
            Document document = Document.builder()
                    .user(user)
                    .filename(originalFilename)
                    .filePath(storedPath)
                    .fileSize(file.getSize())
                    .status("PENDING")
                    .build();

            Document savedDocument = documentRepository.save(document);
            log.info("Document successfully uploaded and saved with ID: {} for user: {}", savedDocument.getId(), user.getEmail());

            return DocumentResponse.fromEntity(savedDocument);

        } catch (IOException e) {
            log.error("Failed to store file payload on disk.", e);
            throw new RuntimeException("Could not store file. Please try again.", e);
        }
    }

    /**
     * Asynchronously processes document parsing and grades/scores the assignment.
     */
    @Async
    @Transactional
    public void asyncAnalyzeDocument(Long documentId) {
        log.info("Starting asynchronous grading analysis for document ID: {}", documentId);
        
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            log.error("Async analysis error: Document not found with ID: {}", documentId);
            return;
        }

        Document document = docOpt.get();
        document.setStatus("PROCESSING");
        documentRepository.saveAndFlush(document);

        try {
            // Simulate deep document scan and OCR parsing delay
            Thread.sleep(4000);

            // Grade assignment (Mock evaluation range between 68 and 98)
            int score = (int) (Math.random() * 31) + 68;

            document.setStatus("COMPLETED");
            document.setScore(score);
            documentRepository.save(document);
            log.info("Asynchronous grading analysis completed successfully for document ID: {} with score: {}", documentId, score);

        } catch (InterruptedException e) {
            log.error("Asynchronous processing was interrupted for document ID: {}", documentId, e);
            document.setStatus("FAILED");
            documentRepository.save(document);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Unexpected error in async grading for document ID: {}", documentId, e);
            document.setStatus("FAILED");
            documentRepository.save(document);
        }
    }

    /**
     * Lists documents uploaded by the user with pagination support.
     */
    @Transactional(readOnly = true)
    public Page<DocumentResponse> listDocuments(User user, Pageable pageable) {
        return documentRepository.findByUser(user, pageable)
                .map(DocumentResponse::fromEntity);
    }

    /**
     * Retrieves specific document metadata verifying user ownership.
     */
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentDetails(Long id, User user) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

        // Enforce ownership or check role authority
        if (!document.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_TEACHER") && !user.getRole().name().equals("ROLE_ADMIN")) {
            throw new UnauthorizedException("You are not authorized to view this document.");
        }

        return DocumentResponse.fromEntity(document);
    }

    /**
     * Loads the raw file resource for streaming downloads.
     */
    @Transactional(readOnly = true)
    public Resource getDocumentFileResource(Long id, User user) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

        if (!document.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_TEACHER") && !user.getRole().name().equals("ROLE_ADMIN")) {
            throw new UnauthorizedException("You are not authorized to download this file.");
        }

        return storageService.loadAsResource(document.getFilePath());
    }

    /**
     * Aggregates dashboard analytics statistics for the student.
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(User user) {
        long total = documentRepository.countByUser(user);
        long pending = documentRepository.countByUserAndStatus(user, "PENDING") +
                       documentRepository.countByUserAndStatus(user, "PROCESSING");
        long completed = documentRepository.countByUserAndStatus(user, "COMPLETED");

        Double avgScoreVal = documentRepository.getAverageScoreByUserId(user.getId());
        double avgScore = avgScoreVal != null ? Math.round(avgScoreVal * 10.0) / 10.0 : 0.0;

        // Fetch top 5 recent uploads
        Pageable topFive = PageRequest.of(0, 5);
        List<DocumentResponse> recentDocs = documentRepository.findByUserOrderByCreatedAtDesc(user, topFive)
                .stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalAssignments(total)
                .averageScore(avgScore)
                .pendingAssignments(pending)
                .completedAssignments(completed)
                .recentDocuments(recentDocs)
                .build();
    }

    // Helper to resolve extensions
    private String getFileExtension(String filename) {
        int dotIdx = filename.lastIndexOf('.');
        if (dotIdx == -1 || dotIdx == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIdx + 1);
    }
}
