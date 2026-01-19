-- Migration: Create rubric_levels table
-- Description: Stores performance levels for each rubric criterion
-- Dependencies: rubric_criteria

CREATE TABLE IF NOT EXISTS rubric_levels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rubric_criteria_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to rubric criterion',
    level_name VARCHAR(255) NOT NULL COMMENT 'e.g., Excellent, Good, Average, Poor, Unsatisfactory',
    level_score DOUBLE NOT NULL DEFAULT 0 COMMENT 'Score for this level',
    description TEXT NULL COMMENT 'Description of this performance level',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_rubric_levels_criteria
        FOREIGN KEY (rubric_criteria_id)
        REFERENCES rubric_criteria(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_rubric_levels_criteria (rubric_criteria_id),
    INDEX idx_rubric_levels_score (level_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Performance levels for rubric criteria';
