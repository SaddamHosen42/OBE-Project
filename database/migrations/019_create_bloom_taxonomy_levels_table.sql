-- Migration: Create bloom_taxonomy_levels table
-- Description: Stores Bloom's Taxonomy levels (Remember, Understand, Apply, Analyze, Evaluate, Create)
-- Dependencies: None

-- Drop table if exists
DROP TABLE IF EXISTS bloom_taxonomy_levels;

-- Create bloom_taxonomy_levels table
CREATE TABLE bloom_taxonomy_levels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    level_number INT NOT NULL COMMENT 'Bloom level number (1-6)',
    name VARCHAR(50) NOT NULL COMMENT 'Level name (Remember, Understand, Apply, Analyze, Evaluate, Create)',
    description TEXT COMMENT 'Description of the taxonomy level',
    keywords TEXT COMMENT 'Action verbs associated with this level',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_level_number (level_number),
    UNIQUE KEY unique_level_name (name),
    CHECK (level_number BETWEEN 1 AND 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bloom''s Taxonomy cognitive levels for learning outcomes';

-- Insert default Bloom's Taxonomy levels
INSERT INTO bloom_taxonomy_levels (level_number, name, description, keywords) VALUES
(1, 'Remember', 'Retrieving, recognizing, and recalling relevant knowledge from long-term memory', 'define, duplicate, list, memorize, recall, repeat, reproduce, state'),
(2, 'Understand', 'Constructing meaning from oral, written, and graphic messages', 'classify, describe, discuss, explain, identify, locate, recognize, report, select, translate'),
(3, 'Apply', 'Carrying out or using a procedure through executing or implementing', 'execute, implement, solve, use, demonstrate, interpret, operate, schedule, sketch'),
(4, 'Analyze', 'Breaking material into constituent parts and determining how parts relate to one another', 'differentiate, organize, relate, compare, contrast, distinguish, examine, experiment, question, test'),
(5, 'Evaluate', 'Making judgments based on criteria and standards', 'appraise, argue, defend, judge, select, support, value, critique, weigh'),
(6, 'Create', 'Putting elements together to form a coherent whole; reorganizing into a new pattern', 'design, assemble, construct, conjecture, develop, formulate, author, investigate');

-- Verify data
SELECT * FROM bloom_taxonomy_levels;
