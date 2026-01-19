-- Migration: Create peo_plo_mapping table
-- Description: Maps Program Educational Objectives (PEOs) to Program Learning Outcomes (PLOs)
-- Dependencies: program_educational_objectives, program_learning_outcomes tables

-- Drop table if exists
DROP TABLE IF EXISTS peo_plo_mapping;

-- Create peo_plo_mapping table
CREATE TABLE peo_plo_mapping (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    peo_id BIGINT NOT NULL COMMENT 'Reference to program educational objective',
    plo_id BIGINT NOT NULL COMMENT 'Reference to program learning outcome',
    correlation_level VARCHAR(20) DEFAULT 'Medium' COMMENT 'Correlation strength: High, Medium, Low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_peo_plo_peo
        FOREIGN KEY (peo_id) 
        REFERENCES program_educational_objectives(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_peo_plo_plo
        FOREIGN KEY (plo_id) 
        REFERENCES program_learning_outcomes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraints (prevent duplicate mappings)
    UNIQUE KEY unique_peo_plo (peo_id, plo_id),
    
    -- Indexes for performance
    INDEX idx_peo_id (peo_id),
    INDEX idx_plo_id (plo_id),
    INDEX idx_correlation_level (correlation_level),
    
    -- Validation checks
    CHECK (correlation_level IN ('High', 'Medium', 'Low'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mapping between Program Educational Objectives and Program Learning Outcomes showing how PLOs support PEOs';
