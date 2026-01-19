-- Migration: Create program_learning_outcomes table
-- Description: Stores Program Learning Outcomes (PLOs) - what students should know and be able to do by graduation
-- Dependencies: degrees, bloom_taxonomy_levels tables

-- Drop table if exists
DROP TABLE IF EXISTS program_learning_outcomes;

-- Create program_learning_outcomes table
CREATE TABLE program_learning_outcomes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    degree_id BIGINT NOT NULL COMMENT 'Reference to degree/program',
    programName VARCHAR(255) COMMENT 'Program name for reference',
    PLO_No VARCHAR(20) NOT NULL COMMENT 'PLO identifier (e.g., PLO1, PLO2, PLO3)',
    PLO_Description TEXT NOT NULL COMMENT 'Description of the program learning outcome',
    bloom_taxonomy_level_id BIGINT COMMENT 'Reference to Bloom''s taxonomy level',
    target_attainment DOUBLE DEFAULT 60.0 COMMENT 'Target attainment percentage (e.g., 60%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_plo_degree
        FOREIGN KEY (degree_id) 
        REFERENCES degrees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_plo_bloom_level
        FOREIGN KEY (bloom_taxonomy_level_id) 
        REFERENCES bloom_taxonomy_levels(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    -- Unique constraints
    UNIQUE KEY unique_degree_plo (degree_id, PLO_No),
    
    -- Indexes for performance
    INDEX idx_degree_id (degree_id),
    INDEX idx_bloom_taxonomy_level (bloom_taxonomy_level_id),
    
    -- Validation checks
    CHECK (target_attainment >= 0 AND target_attainment <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Program Learning Outcomes (PLOs) describing knowledge, skills, and attitudes students acquire by graduation';
