-- Migration: Create assessment_components table
-- Description: Stores specific assessment instances for course offerings (e.g., "Quiz 1", "Midterm Exam")
-- Dependencies: course_offerings, assessment_types

CREATE TABLE IF NOT EXISTS assessment_components (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_offering_id BIGINT NOT NULL COMMENT 'Reference to course offering',
    assessment_type_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to assessment type',
    name VARCHAR(255) NOT NULL COMMENT 'e.g., Quiz 1, Midterm Exam, Assignment 2',
    total_marks DOUBLE NOT NULL DEFAULT 0 COMMENT 'Total marks for this assessment',
    weight_percentage DOUBLE NOT NULL DEFAULT 0 COMMENT 'Weight in final grade calculation',
    scheduled_date DATE NULL COMMENT 'Date when assessment is scheduled',
    duration_minutes INT NULL COMMENT 'Duration in minutes for timed assessments',
    instructions TEXT NULL COMMENT 'Instructions for students',
    is_published BOOLEAN DEFAULT FALSE COMMENT 'Whether results are published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_assessment_components_course_offering
        FOREIGN KEY (course_offering_id)
        REFERENCES course_offerings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_assessment_components_type
        FOREIGN KEY (assessment_type_id)
        REFERENCES assessment_types(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_assessment_components_offering (course_offering_id),
    INDEX idx_assessment_components_type (assessment_type_id),
    INDEX idx_assessment_components_date (scheduled_date),
    INDEX idx_assessment_components_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Specific assessment instances for course offerings';
