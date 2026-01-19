-- Migration: Create rubric_criteria table
-- Description: Stores criteria/dimensions for rubrics
-- Dependencies: rubrics

CREATE TABLE IF NOT EXISTS rubric_criteria (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rubric_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to rubric',
    criterion_name VARCHAR(255) NOT NULL COMMENT 'Name of the criterion',
    description TEXT NULL COMMENT 'Description of what is being evaluated',
    max_score DOUBLE NOT NULL DEFAULT 0 COMMENT 'Maximum score for this criterion',
    weight_percentage DOUBLE NOT NULL DEFAULT 0 COMMENT 'Weight in overall rubric score',
    `order` INT NOT NULL DEFAULT 0 COMMENT 'Display order',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_rubric_criteria_rubric
        FOREIGN KEY (rubric_id)
        REFERENCES rubrics(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_rubric_criteria_rubric (rubric_id),
    INDEX idx_rubric_criteria_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Criteria/dimensions for rubrics';
