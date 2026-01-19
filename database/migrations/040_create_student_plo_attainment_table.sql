-- Create student_plo_attainment table
-- Tracks individual student's attainment of Program Learning Outcomes

CREATE TABLE student_plo_attainment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    program_learning_outcome_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    cumulative_attainment_percentage DOUBLE NOT NULL DEFAULT 0.0,
    attainment_level VARCHAR(50) NOT NULL COMMENT 'Exceeded/Met/Approaching/Not Met',
    is_attained BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (program_learning_outcome_id) REFERENCES program_learning_outcomes(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    
    INDEX idx_student_plo_attainment_student (student_id),
    INDEX idx_student_plo_attainment_plo (program_learning_outcome_id),
    INDEX idx_student_plo_attainment_semester (semester_id),
    INDEX idx_student_plo_attainment_level (attainment_level),
    UNIQUE KEY unique_student_plo_semester (student_id, program_learning_outcome_id, semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
