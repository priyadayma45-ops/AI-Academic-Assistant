package com.academicassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload containing text and length formats for summarization operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SummaryRequest {

    @NotBlank(message = "Text cannot be blank")
    @Size(max = 15000, message = "Text length cannot exceed 15,000 characters")
    private String text;

    @NotBlank(message = "Length constraint cannot be blank")
    private String length; // SHORT, MEDIUM, BULLET_POINTS
}
