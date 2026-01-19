-- Create course_clo_attainment_summary table
-- Summarizes CLO attainment at the course offering level

CREATE TABLE course_clo_attainment_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_offering_id BIGINT NOT NULL,
    course_learning_outcome_id BIGINT NOT NULL,
    total_students INT NOT NULL DEFAULT 0,
    students_attained INT NOT NULL DEFAULT 0,
    average_attainment_percentage DOUBLE NOT NULL DEFAULT 0.0,
    attainment_rate DOUBLE NOT NULL DEFAULT 0.0 COMMENT 'Percentage of students who attained',
    target_attainment DOUBLE NOT NULL DEFAULT 60.0,
    is_target_met BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id) ON DELETE CASCADE,
    
    INDEX idx_course_clo_summary_offering (course_offering_id),
    INDEX idx_course_clo_summary_clo (course_learning_outcome_id),
    INDEX idx_course_clo_summary_target_met (is_target_met),
    UNIQUE KEY unique_offering_clo_summary (course_offering_id, course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
