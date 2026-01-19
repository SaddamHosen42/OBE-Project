-- Migration: 011_create_semesters_table.sql
-- Description: Create semesters table to store semester information within academic sessions
-- Dependencies: 010_create_academic_sessions_table.sql

CREATE TABLE IF NOT EXISTS semesters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    academic_session_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL COMMENT 'e.g., "Fall 2025", "Spring 2026"',
    semester_number INT NOT NULL COMMENT '1 for first semester, 2 for second, etc.',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_semesters_academic_session 
        FOREIGN KEY (academic_session_id) 
        REFERENCES academic_sessions(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_academic_session_id (academic_session_id),
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_semester_number (semester_number),
    INDEX idx_dates (start_date, end_date),
    
    -- Unique constraint for semester name within an academic session
    UNIQUE KEY uk_semester_per_session (academic_session_id, semester_number),
    
    -- Check constraint to ensure end_date is after start_date
    CONSTRAINT chk_semester_dates CHECK (end_date > start_date),
    
    -- Check constraint for valid semester numbers
    CONSTRAINT chk_semester_number CHECK (semester_number > 0 AND semester_number <= 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO semesters (academic_session_id, name, semester_number, start_date, end_date, is_active) VALUES 
-- For 2025-2026 academic session (id: 3)
(3, 'Fall 2025', 1, '2025-07-01', '2025-12-31', FALSE),
(3, 'Spring 2026', 2, '2026-01-01', '2026-06-30', TRUE),

-- For 2024-2025 academic session (id: 2)
(2, 'Fall 2024', 1, '2024-07-01', '2024-12-31', FALSE),
(2, 'Spring 2025', 2, '2025-01-01', '2025-06-30', FALSE);
