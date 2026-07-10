package com.academicassistant.dto;

import lombok.*;
import java.util.List;

/**
 * Data Transfer Object representing academic dashboard analytics metrics.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalAssignments;
    private double averageScore;
    private long pendingAssignments;
    private long completedAssignments;
    private List<DocumentResponse> recentDocuments;
}
