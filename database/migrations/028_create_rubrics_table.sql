-- Migration: Create rubrics table
-- Description: Stores rubric definitions for assessments
-- Dependencies: course_learning_outcomes, users

CREATE TABLE IF NOT EXISTS rubrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Name of the rubric',
    description TEXT NULL COMMENT 'Detailed description of the rubric',
    course_learning_outcome_id BIGINT NULL COMMENT 'Optional reference to specific CLO',
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'User who created the rubric',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_rubrics_clo
        FOREIGN KEY (course_learning_outcome_id)
        REFERENCES course_learning_outcomes(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_rubrics_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_rubrics_clo (course_learning_outcome_id),
    INDEX idx_rubrics_creator (created_by),
    INDEX idx_rubrics_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rubric definitions for assessments';
