-- Migration: Create course_offerings table
-- Description: Stores specific course offerings/sections for each semester
-- Dependencies: courses, semesters

CREATE TABLE IF NOT EXISTS course_offerings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    section VARCHAR(10) NULL,
    max_students INT NULL,
    status VARCHAR(50) DEFAULT 'active' COMMENT 'active/closed/cancelled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_course_offerings_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_course_offerings_semester FOREIGN KEY (semester_id) 
        REFERENCES semesters(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_course_offerings_max_students CHECK (max_students IS NULL OR max_students > 0),
    CONSTRAINT chk_course_offerings_status CHECK (status IN ('active', 'closed', 'cancelled')),
    
    -- Unique constraint: one course can't have duplicate sections in the same semester
    CONSTRAINT uq_course_offerings_course_semester_section UNIQUE (course_id, semester_id, section),
    
    -- Indexes
    INDEX idx_course_offerings_course_id (course_id),
    INDEX idx_course_offerings_semester_id (semester_id),
    INDEX idx_course_offerings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores specific course offerings for each semester';
