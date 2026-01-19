-- Migration: Create assessment_types table
-- Description: Stores different types of assessments (Quiz, Assignment, Midterm, Final, Lab, etc.)
-- Dependencies: None

CREATE TABLE IF NOT EXISTS assessment_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Quiz, Assignment, Midterm, Final, Lab, Presentation, Project, Viva',
    category VARCHAR(100) NOT NULL COMMENT 'Continuous or Terminal',
    description TEXT NULL COMMENT 'Detailed description of the assessment type',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_assessment_types_name (name),
    INDEX idx_assessment_types_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types of assessments used in courses';

-- Insert default assessment types
INSERT INTO assessment_types (name, category, description) VALUES
('Quiz', 'Continuous', 'Short assessment to test knowledge on specific topics'),
('Assignment', 'Continuous', 'Take-home assignments for deeper understanding'),
('Midterm Exam', 'Terminal', 'Mid-semester examination'),
('Final Exam', 'Terminal', 'End of semester examination'),
('Lab Work', 'Continuous', 'Practical laboratory assessments'),
('Presentation', 'Continuous', 'Oral presentation and demonstration'),
('Project', 'Continuous', 'Long-term project work'),
('Viva', 'Terminal', 'Oral examination'),
('Class Test', 'Continuous', 'In-class tests'),
('Report', 'Continuous', 'Written reports and documentation');
