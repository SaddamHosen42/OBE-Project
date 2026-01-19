-- Migration: Create course_objectives table
-- Description: Stores course objectives (COs) for each course
-- Dependencies: courses

CREATE TABLE IF NOT EXISTS course_objectives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    CO_ID VARCHAR(50) NOT NULL,
    CO_Description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_course_objectives_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint: CO_ID must be unique within a course
    CONSTRAINT uq_course_objectives_course_co_id UNIQUE (course_id, CO_ID),
    
    -- Indexes
    INDEX idx_course_objectives_course_id (course_id),
    INDEX idx_course_objectives_co_id (CO_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores course objectives (COs) for each course';
