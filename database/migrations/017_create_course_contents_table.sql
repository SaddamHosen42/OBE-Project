-- Migration: Create course_contents table
-- Description: Stores detailed course content with teaching and assessment strategies
-- Dependencies: courses

CREATE TABLE IF NOT EXISTS course_contents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    teaching_strategy VARCHAR(255) NULL,
    assessment_strategy VARCHAR(255) NULL,
    CLO_mapping VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_course_contents_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_course_contents_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores detailed course content with teaching and assessment strategies';
