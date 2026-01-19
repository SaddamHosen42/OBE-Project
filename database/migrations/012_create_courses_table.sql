-- Migration: Create courses table
-- Description: Stores course information including course code, title, credits, and prerequisites
-- Dependencies: departments, degrees

CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    courseCode VARCHAR(50) UNIQUE NOT NULL,
    courseTitle TEXT NOT NULL,
    department_id BIGINT NOT NULL,
    degree_id BIGINT NOT NULL,
    credit DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    contactHourPerWeek DECIMAL(5,2) NULL,
    level VARCHAR(50) NULL,
    semester VARCHAR(50) NULL,
    academicSession VARCHAR(50) NULL,
    type VARCHAR(50) NULL COMMENT 'Theory/Lab/Project',
    type_T_S VARCHAR(50) NULL,
    totalMarks VARCHAR(50) NULL,
    instructor VARCHAR(255) NULL,
    prerequisites TEXT NULL,
    summary TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_courses_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_courses_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_courses_credit CHECK (credit >= 0),
    CONSTRAINT chk_courses_contact_hours CHECK (contactHourPerWeek IS NULL OR contactHourPerWeek >= 0),
    
    -- Indexes
    INDEX idx_courses_department_id (department_id),
    INDEX idx_courses_degree_id (degree_id),
    INDEX idx_courses_level (level),
    INDEX idx_courses_semester (semester),
    INDEX idx_courses_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores course catalog information';
