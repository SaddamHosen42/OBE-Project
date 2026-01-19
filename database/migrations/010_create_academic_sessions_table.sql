-- Migration: 010_create_academic_sessions_table.sql
-- Description: Create academic_sessions table to store academic year information
-- Dependencies: None

CREATE TABLE IF NOT EXISTS academic_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_name VARCHAR(50) NOT NULL COMMENT 'e.g., "2024-2025"',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_session_name (session_name),
    INDEX idx_is_active (is_active),
    INDEX idx_dates (start_date, end_date),
    
    -- Unique constraint for session name
    UNIQUE KEY uk_session_name (session_name),
    
    -- Check constraint to ensure end_date is after start_date
    CONSTRAINT chk_session_dates CHECK (end_date > start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO academic_sessions (session_name, start_date, end_date, is_active) VALUES 
('2023-2024', '2023-07-01', '2024-06-30', FALSE),
('2024-2025', '2024-07-01', '2025-06-30', FALSE),
('2025-2026', '2025-07-01', '2026-06-30', TRUE),
('2026-2027', '2026-07-01', '2027-06-30', FALSE);
