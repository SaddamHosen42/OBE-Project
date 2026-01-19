-- Migration: Create clo_co_mapping table
-- Description: Maps Course Learning Outcomes (CLOs) to Course Objectives (COs)
-- Dependencies: course_learning_outcomes, course_objectives tables

-- Drop table if exists
DROP TABLE IF EXISTS clo_co_mapping;

-- Create clo_co_mapping table
CREATE TABLE clo_co_mapping (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_learning_outcome_id BIGINT NOT NULL COMMENT 'Reference to course learning outcome',
    course_objective_id BIGINT NOT NULL COMMENT 'Reference to course objective',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_clo_co_clo
        FOREIGN KEY (course_learning_outcome_id) 
        REFERENCES course_learning_outcomes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_clo_co_co
        FOREIGN KEY (course_objective_id) 
        REFERENCES course_objectives(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraints (prevent duplicate mappings)
    UNIQUE KEY unique_clo_co (course_learning_outcome_id, course_objective_id),
    
    -- Indexes for performance
    INDEX idx_clo_id (course_learning_outcome_id),
    INDEX idx_co_id (course_objective_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mapping between Course Learning Outcomes and Course Objectives showing alignment between outcomes and objectives';
