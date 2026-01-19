-- Migration: Create action_plans table
-- Description: Stores action plans for continuous improvement based on outcome attainment gaps
-- Dependencies: degrees, course_offerings, academic_sessions, users tables

USE obe_system;

CREATE TABLE IF NOT EXISTS action_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    course_offering_id BIGINT NULL,
    academic_session_id BIGINT NOT NULL,
    outcome_type VARCHAR(50) NOT NULL COMMENT 'CLO or PLO',
    outcome_id BIGINT NOT NULL COMMENT 'ID of the CLO or PLO',
    identified_gap TEXT NOT NULL COMMENT 'Description of the identified performance gap',
    root_cause TEXT NULL COMMENT 'Analysis of the root cause of the gap',
    proposed_action TEXT NOT NULL COMMENT 'Proposed action to address the gap',
    responsible_person BIGINT UNSIGNED NOT NULL,
    target_date DATE NOT NULL COMMENT 'Expected completion date',
    status VARCHAR(50) NOT NULL DEFAULT 'Planned' COMMENT 'Planned, In Progress, Completed, Deferred',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_action_plans_degree
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_action_plans_course_offering
        FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_action_plans_academic_session
        FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_action_plans_responsible_person
        FOREIGN KEY (responsible_person) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_action_plans_degree (degree_id),
    INDEX idx_action_plans_course_offering (course_offering_id),
    INDEX idx_action_plans_academic_session (academic_session_id),
    INDEX idx_action_plans_status (status),
    INDEX idx_action_plans_outcome_type (outcome_type),
    INDEX idx_action_plans_responsible_person (responsible_person),
    INDEX idx_action_plans_target_date (target_date),
    
    -- Check Constraints
    CONSTRAINT chk_action_plans_outcome_type 
        CHECK (outcome_type IN ('CLO', 'PLO')),
    
    CONSTRAINT chk_action_plans_status 
        CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Deferred'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments
ALTER TABLE action_plans COMMENT = 'Stores continuous improvement action plans based on outcome attainment analysis';
