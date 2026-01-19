-- Create student_clo_attainment table
-- Tracks individual student's attainment of Course Learning Outcomes

CREATE TABLE student_clo_attainment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_offering_id BIGINT NOT NULL,
    course_learning_outcome_id BIGINT NOT NULL,
    total_marks_possible DOUBLE NOT NULL,
    marks_obtained DOUBLE NOT NULL,
    attainment_percentage DOUBLE NOT NULL,
    attainment_level VARCHAR(50) NOT NULL COMMENT 'Exceeded/Met/Approaching/Not Met',
    is_attained BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id) ON DELETE CASCADE,
    
    INDEX idx_student_clo_attainment_student (student_id),
    INDEX idx_student_clo_attainment_course_offering (course_offering_id),
    INDEX idx_student_clo_attainment_clo (course_learning_outcome_id),
    INDEX idx_student_clo_attainment_level (attainment_level),
    UNIQUE KEY unique_student_offering_clo (student_id, course_offering_id, course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
