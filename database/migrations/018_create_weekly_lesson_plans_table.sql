-- Migration: Create weekly_lesson_plans table
-- Description: Stores weekly lesson plans with topics, outcomes, and teaching strategies
-- Dependencies: courses

CREATE TABLE IF NOT EXISTS weekly_lesson_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    weekNo VARCHAR(10) NOT NULL,
    topics TEXT NULL,
    specificOutcomes TEXT NULL,
    teachingStrategy VARCHAR(255) NULL,
    teachingAid VARCHAR(255) NULL,
    assessmentStrategy VARCHAR(255) NULL,
    CLO_mapping VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_weekly_lesson_plans_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint: weekNo must be unique within a course
    CONSTRAINT uq_weekly_lesson_plans_course_week UNIQUE (course_id, weekNo),
    
    -- Indexes
    INDEX idx_weekly_lesson_plans_course_id (course_id),
    INDEX idx_weekly_lesson_plans_week_no (weekNo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores weekly lesson plans with topics and teaching strategies';
