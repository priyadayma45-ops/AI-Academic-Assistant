package com.academicassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload containing text and target tone constraints for rephrasing operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewriteRequest {

    @NotBlank(message = "Text cannot be blank")
    @Size(max = 5000, message = "Text length cannot exceed 5,000 characters")
    private String text;

    @NotBlank(message = "Tone cannot be blank")
    private String tone; // ACADEMIC, PROFESSIONAL, CREATIVE, SIMPLIFIED
}
