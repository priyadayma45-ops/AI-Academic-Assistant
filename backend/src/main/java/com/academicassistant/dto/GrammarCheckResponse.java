package com.academicassistant.dto;

import lombok.*;
import java.util.List;

/**
 * Data Transfer Object representing the summary response of a grammar audit.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarCheckResponse {

    private List<GrammarError> errors;
    private String fullyCorrectedText;
}
