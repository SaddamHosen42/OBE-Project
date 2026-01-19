-- Migration: Create course_enrollments table
-- Description: Stores student enrollments in course offerings
-- Dependencies: students, course_offerings
-- Note: students table will be created in Step 2.5

CREATE TABLE IF NOT EXISTS course_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_offering_id BIGINT NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    status VARCHAR(50) DEFAULT 'enrolled' COMMENT 'enrolled/dropped/completed/withdrawn/failed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    -- Note: student_id FK will be added after students table is created
    CONSTRAINT fk_course_enrollments_course_offering FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_course_enrollments_status CHECK (
        status IN ('enrolled', 'dropped', 'completed', 'withdrawn', 'failed')
    ),
    
    -- Unique constraint: a student can't enroll in the same course offering twice
    CONSTRAINT uq_course_enrollments_student_course_offering UNIQUE (student_id, course_offering_id),
    
    -- Indexes
    INDEX idx_course_enrollments_student_id (student_id),
    INDEX idx_course_enrollments_course_offering_id (course_offering_id),
    INDEX idx_course_enrollments_status (status),
    INDEX idx_course_enrollments_enrollment_date (enrollment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores student enrollments in course offerings';
