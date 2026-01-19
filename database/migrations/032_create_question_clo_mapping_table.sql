-- Migration: Create question_clo_mapping table
-- Description: Maps individual questions to course learning outcomes
-- Dependencies: questions, course_learning_outcomes

CREATE TABLE IF NOT EXISTS question_clo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to question',
    course_learning_outcome_id BIGINT NOT NULL COMMENT 'Reference to CLO',
    marks_allocated DOUBLE NOT NULL DEFAULT 0 COMMENT 'Marks allocated to this CLO from this question',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_question_clo_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_question_clo_clo
        FOREIGN KEY (course_learning_outcome_id)
        REFERENCES course_learning_outcomes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraint to prevent duplicate mappings
    UNIQUE KEY uk_question_clo_mapping (question_id, course_learning_outcome_id),
    
    -- Indexes
    INDEX idx_question_clo_mapping_question (question_id),
    INDEX idx_question_clo_mapping_clo (course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps individual questions to course learning outcomes';
