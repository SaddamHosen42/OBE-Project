-- Migration: Create obe_review_cycles table
-- Description: Stores OBE review cycles for periodic program evaluation and improvement
-- Dependencies: degrees table

USE obe_system;

CREATE TABLE IF NOT EXISTS obe_review_cycles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    cycle_name VARCHAR(255) NOT NULL COMMENT 'Name/identifier for the review cycle',
    start_date DATE NOT NULL COMMENT 'Review cycle start date',
    end_date DATE NOT NULL COMMENT 'Review cycle end date',
    review_type VARCHAR(50) NOT NULL COMMENT 'Annual, Biennial, or Accreditation review',
    status VARCHAR(50) NOT NULL DEFAULT 'Planned' COMMENT 'Planned, Ongoing, or Completed',
    summary_report TEXT NULL COMMENT 'Summary report of the review findings',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_obe_review_cycles_degree
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_obe_review_cycles_degree (degree_id),
    INDEX idx_obe_review_cycles_status (status),
    INDEX idx_obe_review_cycles_review_type (review_type),
    INDEX idx_obe_review_cycles_dates (start_date, end_date),
    
    -- Check Constraints
    CONSTRAINT chk_obe_review_cycles_review_type 
        CHECK (review_type IN ('Annual', 'Biennial', 'Accreditation')),
    
    CONSTRAINT chk_obe_review_cycles_status 
        CHECK (status IN ('Planned', 'Ongoing', 'Completed')),
    
    CONSTRAINT chk_obe_review_cycles_dates 
        CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments
ALTER TABLE obe_review_cycles COMMENT = 'Stores OBE review cycles for periodic program evaluation and continuous improvement';
