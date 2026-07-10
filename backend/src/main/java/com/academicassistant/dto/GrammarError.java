package com.academicassistant.dto;

import lombok.*;

/**
 * Data Transfer Object representing an individual grammar, spelling, or styling error.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarError {

    private String originalText;
    private String correctedText;
    private String explanation; // High-level coach explanation (reason for correction)
    private Integer offset;     // Starting index of the error
    private Integer length;     // Character length of the incorrect phrase
}
