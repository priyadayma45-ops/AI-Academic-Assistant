package com.academicassistant.repository;

import com.academicassistant.entity.Document;
import com.academicassistant.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring JPA Repository for Document database entities.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    /**
     * Lists documents uploaded by a specific user with pagination support.
     *
     * @param user     the user
     * @param pageable pagination parameters
     * @return a page of user documents
     */
    Page<Document> findByUser(User user, Pageable pageable);

    /**
     * Counts the total number of documents uploaded by a user.
     *
     * @param user the user
     * @return the count of documents
     */
    long countByUser(User user);

    /**
     * Finds recent documents uploaded by a user.
     *
     * @param user     the user
     * @param pageable pagination parameters
     * @return a list of recent documents
     */
    List<Document> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Calculates the average score of all completed assignments for a user.
     *
     * @param userId the user ID
     * @return the average score, or null if no scores are present
     */
    @Query("SELECT AVG(d.score) FROM Document d WHERE d.user.id = :userId AND d.status = 'COMPLETED' AND d.score IS NOT NULL")
    Double getAverageScoreByUserId(@Param("userId") Long userId);

    /**
     * Counts documents by status for a user.
     *
     * @param user   the user
     * @param status the status string
     * @return count of documents
     */
    long countByUserAndStatus(User user, String status);
}
