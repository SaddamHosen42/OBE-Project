-- Migration: Create questions table
-- Description: Stores individual questions within assessments
-- Dependencies: assessment_components, bloom_taxonomy_levels

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assessment_component_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to assessment component',
    question_number VARCHAR(50) NOT NULL COMMENT 'Question number or identifier (e.g., Q1, 1a, 2b)',
    question_text TEXT NOT NULL COMMENT 'The actual question text',
    question_type VARCHAR(100) NOT NULL COMMENT 'MCQ, Short, Descriptive, Problem, True/False, etc.',
    marks DOUBLE NOT NULL DEFAULT 0 COMMENT 'Marks allocated to this question',
    difficulty_level VARCHAR(50) NULL COMMENT 'Easy, Medium, Hard',
    bloom_taxonomy_level_id BIGINT NULL COMMENT 'Bloom taxonomy level',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_questions_assessment
        FOREIGN KEY (assessment_component_id)
        REFERENCES assessment_components(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_questions_bloom
        FOREIGN KEY (bloom_taxonomy_level_id)
        REFERENCES bloom_taxonomy_levels(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_questions_assessment (assessment_component_id),
    INDEX idx_questions_bloom (bloom_taxonomy_level_id),
    INDEX idx_questions_type (question_type),
    INDEX idx_questions_difficulty (difficulty_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Individual questions within assessments';
