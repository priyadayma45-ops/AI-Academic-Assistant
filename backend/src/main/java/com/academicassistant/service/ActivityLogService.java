package com.academicassistant.service;

import com.academicassistant.entity.ActivityLog;
import com.academicassistant.entity.User;
import com.academicassistant.repository.ActivityLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Autowired
    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public void logActivity(User user, String action, String details, String ipAddress) {
        try {
            ActivityLog logEntry = ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            activityLogRepository.save(logEntry);
            log.info("Activity logged: {} for user: {} from IP: {}", action, (user != null ? user.getEmail() : "anonymous"), ipAddress);
        } catch (Exception e) {
            log.error("Failed to log activity: {}", e.getMessage());
        }
    }
}
