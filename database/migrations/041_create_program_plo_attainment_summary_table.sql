-- Create program_plo_attainment_summary table
-- Summarizes PLO attainment at the program/degree level

CREATE TABLE program_plo_attainment_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    program_learning_outcome_id BIGINT NOT NULL,
    academic_session_id BIGINT NOT NULL,
    batch_year INT NOT NULL,
    total_students INT NOT NULL DEFAULT 0,
    students_attained INT NOT NULL DEFAULT 0,
    average_attainment_percentage DOUBLE NOT NULL DEFAULT 0.0,
    attainment_rate DOUBLE NOT NULL DEFAULT 0.0 COMMENT 'Percentage of students who attained',
    target_attainment DOUBLE NOT NULL DEFAULT 60.0,
    is_target_met BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE CASCADE,
    FOREIGN KEY (program_learning_outcome_id) REFERENCES program_learning_outcomes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id) ON DELETE CASCADE,
    
    INDEX idx_program_plo_summary_degree (degree_id),
    INDEX idx_program_plo_summary_plo (program_learning_outcome_id),
    INDEX idx_program_plo_summary_session (academic_session_id),
    INDEX idx_program_plo_summary_batch (batch_year),
    INDEX idx_program_plo_summary_target_met (is_target_met),
    UNIQUE KEY unique_degree_plo_session_batch (degree_id, program_learning_outcome_id, academic_session_id, batch_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
