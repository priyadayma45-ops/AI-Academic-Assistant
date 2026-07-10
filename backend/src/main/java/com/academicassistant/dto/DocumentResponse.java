package com.academicassistant.dto;

import com.academicassistant.entity.Document;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Data Transfer Object representing response payload details for documents.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {

    private Long id;
    private String filename;
    private Long fileSize;
    private String status;
    private Integer score;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Factory mapping method translating a Document entity into a clean response representation.
     *
     * @param document the document entity
     * @return the document response DTO
     */
    public static DocumentResponse fromEntity(Document document) {
        if (document == null) return null;
        return DocumentResponse.builder()
                .id(document.getId())
                .filename(document.getFilename())
                .fileSize(document.getFileSize())
                .status(document.getStatus())
                .score(document.getScore())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
