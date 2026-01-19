-- Migration: Create course_learning_outcomes table
-- Description: Stores course learning outcomes (CLOs) for each course with Bloom's taxonomy mapping
-- Dependencies: courses, bloom_taxonomy_levels
-- Note: bloom_taxonomy_levels table will be created in Step 2.6

CREATE TABLE IF NOT EXISTS course_learning_outcomes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    CLO_ID VARCHAR(50) NOT NULL,
    CLO_Description TEXT NOT NULL,
    bloom_taxonomy_level_id BIGINT NULL,
    weight_percentage DECIMAL(5,2) DEFAULT 0.0,
    target_attainment DECIMAL(5,2) DEFAULT 60.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_course_learning_outcomes_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    -- Note: bloom_taxonomy_level_id FK will be added after bloom_taxonomy_levels table is created
    
    -- Check constraints
    CONSTRAINT chk_clo_weight_percentage CHECK (
        weight_percentage >= 0 AND weight_percentage <= 100
    ),
    CONSTRAINT chk_clo_target_attainment CHECK (
        target_attainment >= 0 AND target_attainment <= 100
    ),
    
    -- Unique constraint: CLO_ID must be unique within a course
    CONSTRAINT uq_course_learning_outcomes_course_clo_id UNIQUE (course_id, CLO_ID),
    
    -- Indexes
    INDEX idx_course_learning_outcomes_course_id (course_id),
    INDEX idx_course_learning_outcomes_clo_id (CLO_ID),
    INDEX idx_course_learning_outcomes_bloom_level (bloom_taxonomy_level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores course learning outcomes (CLOs) with Bloom''s taxonomy mapping';
