-- Migration: Create assessment_clo_mapping table
-- Description: Maps assessment components to course learning outcomes
-- Dependencies: assessment_components, course_learning_outcomes

CREATE TABLE IF NOT EXISTS assessment_clo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assessment_component_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to assessment component',
    course_learning_outcome_id BIGINT NOT NULL COMMENT 'Reference to CLO',
    marks_allocated DOUBLE NOT NULL DEFAULT 0 COMMENT 'Marks allocated to this CLO in assessment',
    weight_percentage DOUBLE NOT NULL DEFAULT 0 COMMENT 'Weight percentage for this CLO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_assessment_clo_assessment
        FOREIGN KEY (assessment_component_id)
        REFERENCES assessment_components(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_assessment_clo_clo
        FOREIGN KEY (course_learning_outcome_id)
        REFERENCES course_learning_outcomes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraint to prevent duplicate mappings
    UNIQUE KEY uk_assessment_clo_mapping (assessment_component_id, course_learning_outcome_id),
    
    -- Indexes
    INDEX idx_assessment_clo_mapping_assessment (assessment_component_id),
    INDEX idx_assessment_clo_mapping_clo (course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps assessment components to course learning outcomes';
