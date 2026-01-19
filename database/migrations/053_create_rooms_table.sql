-- Migration: 053_create_rooms_table.sql
-- Description: Create rooms table to store room information
-- Dependencies: 052_create_floors_table.sql

CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number INT NOT NULL,
    floor_id BIGINT NOT NULL,
    room_type VARCHAR(50) NULL,
    room_size VARCHAR(50) NULL,
    available_seats INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_rooms_floor
        FOREIGN KEY (floor_id) 
        REFERENCES floors(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_floor_id (floor_id),
    INDEX idx_room_number (room_number),
    INDEX idx_room_type (room_type),
    
    -- Unique constraint to prevent duplicate room numbers on same floor
    UNIQUE KEY unique_floor_room (floor_id, room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
-- Hall of Residence - A, Floor 1 (floor_id: 1)
INSERT INTO rooms (room_number, floor_id, room_type, room_size, available_seats) VALUES 
(101, 1, 'Double', 'Medium', 2),
(102, 1, 'Single', 'Small', 1),
(103, 1, 'Double', 'Medium', 2),
(104, 1, 'Triple', 'Large', 3),
(105, 1, 'Double', 'Medium', 2),
-- Hall of Residence - A, Floor 2 (floor_id: 2)
(201, 2, 'Double', 'Medium', 2),
(202, 2, 'Single', 'Small', 1),
(203, 2, 'Double', 'Medium', 2),
-- Hall of Residence - B, Floor 1 (floor_id: 4)
(101, 4, 'Double', 'Medium', 2),
(102, 4, 'Double', 'Medium', 2),
(103, 4, 'Single', 'Small', 1);
