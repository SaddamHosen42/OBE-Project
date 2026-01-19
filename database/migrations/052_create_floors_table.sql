-- Migration: 052_create_floors_table.sql
-- Description: Create floors table to store floor information for buildings
-- Dependencies: 051_create_buildings_table.sql

CREATE TABLE IF NOT EXISTS floors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    floor_number INT NOT NULL,
    building_id BIGINT NOT NULL,
    total_rooms INT DEFAULT 0,
    `usage` VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_floors_building
        FOREIGN KEY (building_id) 
        REFERENCES buildings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_building_id (building_id),
    INDEX idx_floor_number (floor_number),
    
    -- Unique constraint to prevent duplicate floor numbers in same building
    UNIQUE KEY unique_building_floor (building_id, floor_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO floors (floor_number, building_id, total_rooms, `usage`) VALUES 
-- Hall of Residence - A (building_id: 1)
(1, 1, 20, 'Residential'),
(2, 1, 20, 'Residential'),
(3, 1, 20, 'Residential'),
-- Hall of Residence - B (building_id: 2)
(1, 2, 15, 'Residential'),
(2, 2, 15, 'Residential'),
-- Science Building (building_id: 5)
(1, 5, 10, 'Laboratories'),
(2, 5, 8, 'Classrooms');
