-- Migration: 054_create_seat_allocations_table.sql
-- Description: Create seat_allocations table to track student room assignments
-- Dependencies: 053_create_rooms_table.sql, 033_create_students_table.sql

CREATE TABLE IF NOT EXISTS seat_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_seat_allocations_room
        FOREIGN KEY (room_id) 
        REFERENCES rooms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_seat_allocations_student
        FOREIGN KEY (student_id) 
        REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_room_id (room_id),
    INDEX idx_student_id (student_id),
    
    -- Unique constraint to ensure a student can only have one seat allocation
    UNIQUE KEY unique_student_allocation (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Sample data insertion commented out as it requires existing student records
-- Insert sample data after students are created:
-- INSERT INTO seat_allocations (room_id, student_id) VALUES 
-- (1, 1),  -- Student 1 in Room 101 (Double)
-- (1, 2),  -- Student 2 in Room 101 (Double) - sharing
-- (2, 3),  -- Student 3 in Room 102 (Single)
-- (3, 4),  -- Student 4 in Room 103 (Double)
-- (3, 5);  -- Student 5 in Room 103 (Double) - sharing
