-- Migration: Create course_learning_outcome_program_learning_outcome table
-- Description: Maps Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs)
-- Dependencies: course_learning_outcomes, program_learning_outcomes tables

-- Drop table if exists
DROP TABLE IF EXISTS course_learning_outcome_program_learning_outcome;

-- Create course_learning_outcome_program_learning_outcome table
CREATE TABLE course_learning_outcome_program_learning_outcome (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_learning_outcome_id BIGINT NOT NULL COMMENT 'Reference to course learning outcome',
    program_learning_outcome_id BIGINT NOT NULL COMMENT 'Reference to program learning outcome',
    mapping_level INT DEFAULT 2 COMMENT 'Mapping strength: 1=Low, 2=Medium, 3=High',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_clo_plo_clo
        FOREIGN KEY (course_learning_outcome_id) 
        REFERENCES course_learning_outcomes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_clo_plo_plo
        FOREIGN KEY (program_learning_outcome_id) 
        REFERENCES program_learning_outcomes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraints (prevent duplicate mappings)
    UNIQUE KEY unique_clo_plo (course_learning_outcome_id, program_learning_outcome_id),
    
    -- Indexes for performance
    INDEX idx_clo_id (course_learning_outcome_id),
    INDEX idx_plo_id (program_learning_outcome_id),
    INDEX idx_mapping_level (mapping_level),
    
    -- Validation checks
    CHECK (mapping_level BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mapping between Course Learning Outcomes and Program Learning Outcomes showing how courses contribute to program outcomes';
