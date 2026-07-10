package com.academicassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload containing text to be checked for spelling and grammar audits.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarCheckRequest {

    @NotBlank(message = "Text cannot be blank")
    @Size(max = 10000, message = "Text length cannot exceed 10,000 characters")
    private String text;
}
