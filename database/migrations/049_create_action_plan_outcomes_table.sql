-- Migration: Create action_plan_outcomes table
-- Description: Stores the outcomes/results of implemented action plans
-- Dependencies: action_plans, users tables

USE obe_database;

CREATE TABLE IF NOT EXISTS action_plan_outcomes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_plan_id BIGINT NOT NULL,
    outcome_description TEXT NOT NULL COMMENT 'Description of the action plan outcome',
    improvement_achieved TEXT NULL COMMENT 'Detailed description of improvement achieved',
    new_attainment_percentage DOUBLE(5,2) NULL COMMENT 'New attainment percentage after improvement',
    verified_by BIGINT UNSIGNED NOT NULL COMMENT 'User who verified the outcome',
    verified_at TIMESTAMP NULL COMMENT 'Timestamp when outcome was verified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_action_plan_outcomes_action_plan
        FOREIGN KEY (action_plan_id) REFERENCES action_plans(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_action_plan_outcomes_verified_by
        FOREIGN KEY (verified_by) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_action_plan_outcomes_action_plan (action_plan_id),
    INDEX idx_action_plan_outcomes_verified_by (verified_by),
    INDEX idx_action_plan_outcomes_verified_at (verified_at),
    
    -- Check Constraints
    CONSTRAINT chk_action_plan_outcomes_percentage 
        CHECK (new_attainment_percentage IS NULL OR (new_attainment_percentage >= 0 AND new_attainment_percentage <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments
ALTER TABLE action_plan_outcomes COMMENT = 'Stores outcomes and results of implemented continuous improvement action plans';
