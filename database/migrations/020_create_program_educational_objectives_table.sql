-- Migration: Create program_educational_objectives table
-- Description: Stores Program Educational Objectives (PEOs) - broad statements describing career and professional accomplishments
-- Dependencies: degrees table

-- Drop table if exists
DROP TABLE IF EXISTS program_educational_objectives;

-- Create program_educational_objectives table
CREATE TABLE program_educational_objectives (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    degree_id BIGINT NOT NULL COMMENT 'Reference to degree/program',
    PEO_No VARCHAR(20) NOT NULL COMMENT 'PEO identifier (e.g., PEO1, PEO2, PEO3)',
    PEO_Description TEXT NOT NULL COMMENT 'Description of the program educational objective',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_peo_degree
        FOREIGN KEY (degree_id) 
        REFERENCES degrees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraints
    UNIQUE KEY unique_degree_peo (degree_id, PEO_No),
    
    -- Indexes for performance
    INDEX idx_degree_id (degree_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Program Educational Objectives (PEOs) defining what graduates are expected to achieve 3-5 years after graduation';
