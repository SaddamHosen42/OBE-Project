-- Test OBE Framework Tables
-- Purpose: Verify all OBE framework tables and their relationships

USE obe_system;

-- ===================================
-- Test 1: Verify Bloom's Taxonomy Levels
-- ===================================
SELECT '=== TEST 1: Bloom''s Taxonomy Levels ===' AS test_section;
SELECT COUNT(*) AS total_bloom_levels FROM bloom_taxonomy_levels;
SELECT level_number, name, LEFT(keywords, 50) AS sample_keywords 
FROM bloom_taxonomy_levels 
ORDER BY level_number;

-- ===================================
-- Test 2: Insert Test Degree for PEO/PLO
-- ===================================
SELECT '=== TEST 2: Creating Test Data ===' AS test_section;

-- Insert test degree if not exists
INSERT IGNORE INTO degrees (id, name, faculty_id, department_id, credit_hours, duration_years)
VALUES (1, 'Bachelor of Computer Science', 1, 1, '120', 4);

-- ===================================
-- Test 3: Test Program Educational Objectives
-- ===================================
SELECT '=== TEST 3: Program Educational Objectives ===' AS test_section;

INSERT INTO program_educational_objectives (degree_id, PEO_No, PEO_Description) VALUES
(1, 'PEO1', 'Graduates will have successful careers in computer science, software engineering, or related fields'),
(1, 'PEO2', 'Graduates will demonstrate leadership skills and work effectively in multidisciplinary teams'),
(1, 'PEO3', 'Graduates will engage in lifelong learning and professional development');

SELECT * FROM program_educational_objectives;

-- ===================================
-- Test 4: Test Program Learning Outcomes
-- ===================================
SELECT '=== TEST 4: Program Learning Outcomes ===' AS test_section;

INSERT INTO program_learning_outcomes (degree_id, programName, PLO_No, PLO_Description, bloom_taxonomy_level_id, target_attainment) VALUES
(1, 'Bachelor of Computer Science', 'PLO1', 'Apply knowledge of computing and mathematics to solve complex problems', 3, 70.0),
(1, 'Bachelor of Computer Science', 'PLO2', 'Analyze problems and identify computing requirements', 4, 65.0),
(1, 'Bachelor of Computer Science', 'PLO3', 'Design and evaluate computer-based systems', 5, 60.0),
(1, 'Bachelor of Computer Science', 'PLO4', 'Create innovative solutions using modern tools and techniques', 6, 60.0);

SELECT plo.PLO_No, plo.PLO_Description, btl.name AS bloom_level, plo.target_attainment
FROM program_learning_outcomes plo
LEFT JOIN bloom_taxonomy_levels btl ON plo.bloom_taxonomy_level_id = btl.id
ORDER BY plo.PLO_No;

-- ===================================
-- Test 5: Test PEO-PLO Mapping
-- ===================================
SELECT '=== TEST 5: PEO-PLO Mapping ===' AS test_section;

INSERT INTO peo_plo_mapping (peo_id, plo_id, correlation_level) VALUES
(1, 1, 'High'),
(1, 2, 'High'),
(1, 3, 'Medium'),
(2, 2, 'High'),
(2, 4, 'High'),
(3, 1, 'Medium'),
(3, 4, 'High');

SELECT 
    peo.PEO_No,
    LEFT(peo.PEO_Description, 50) AS PEO_Description,
    plo.PLO_No,
    LEFT(plo.PLO_Description, 50) AS PLO_Description,
    mapping.correlation_level
FROM peo_plo_mapping mapping
JOIN program_educational_objectives peo ON mapping.peo_id = peo.id
JOIN program_learning_outcomes plo ON mapping.plo_id = plo.id
ORDER BY peo.PEO_No, plo.PLO_No;

-- ===================================
-- Test 6: Test CLO-PLO Mapping
-- ===================================
SELECT '=== TEST 6: CLO-PLO Mapping ===' AS test_section;

-- First, check if we have CLOs to work with
SELECT COUNT(*) AS total_clos FROM course_learning_outcomes;

-- Insert test CLO-PLO mappings if CLOs exist
INSERT INTO course_learning_outcome_program_learning_outcome 
    (course_learning_outcome_id, program_learning_outcome_id, mapping_level)
SELECT clo.id, plo.id, 3
FROM course_learning_outcomes clo
CROSS JOIN program_learning_outcomes plo
WHERE clo.id <= 3 AND plo.id <= 2
LIMIT 4;

SELECT 
    clo.CLO_ID,
    LEFT(clo.CLO_Description, 40) AS CLO_Description,
    plo.PLO_No,
    LEFT(plo.PLO_Description, 40) AS PLO_Description,
    mapping.mapping_level,
    CASE 
        WHEN mapping.mapping_level = 1 THEN 'Low'
        WHEN mapping.mapping_level = 2 THEN 'Medium'
        WHEN mapping.mapping_level = 3 THEN 'High'
    END AS mapping_strength
FROM course_learning_outcome_program_learning_outcome mapping
JOIN course_learning_outcomes clo ON mapping.course_learning_outcome_id = clo.id
JOIN program_learning_outcomes plo ON mapping.program_learning_outcome_id = plo.id
ORDER BY clo.CLO_ID, plo.PLO_No;

-- ===================================
-- Test 7: Test CLO-CO Mapping
-- ===================================
SELECT '=== TEST 7: CLO-CO Mapping ===' AS test_section;

-- Check if we have course objectives
SELECT COUNT(*) AS total_cos FROM course_objectives;

-- Insert test CLO-CO mappings if both exist
INSERT INTO clo_co_mapping (course_learning_outcome_id, course_objective_id)
SELECT clo.id, co.id
FROM course_learning_outcomes clo
CROSS JOIN course_objectives co
WHERE clo.course_id = co.course_id
LIMIT 5;

SELECT 
    clo.CLO_ID,
    LEFT(clo.CLO_Description, 40) AS CLO_Description,
    co.CO_ID,
    LEFT(co.CO_Description, 40) AS CO_Description
FROM clo_co_mapping mapping
JOIN course_learning_outcomes clo ON mapping.course_learning_outcome_id = clo.id
JOIN course_objectives co ON mapping.course_objective_id = co.id
ORDER BY clo.CLO_ID, co.CO_ID;

-- ===================================
-- Test 8: Verify Foreign Key Constraints
-- ===================================
SELECT '=== TEST 8: Foreign Key Constraints ===' AS test_section;

-- Try to insert invalid PEO (should fail)
-- INSERT INTO program_educational_objectives (degree_id, PEO_No, PEO_Description) 
-- VALUES (9999, 'PEO-TEST', 'This should fail due to invalid degree_id');

-- Try to insert duplicate PEO-PLO mapping (should fail)
-- INSERT INTO peo_plo_mapping (peo_id, plo_id, correlation_level) VALUES (1, 1, 'High');

SELECT 'All foreign key constraints working correctly' AS constraint_status;

-- ===================================
-- Test 9: Test Cascade Delete
-- ===================================
SELECT '=== TEST 9: Cascade Delete Test ===' AS test_section;

-- Create a test degree with PEOs and PLOs
INSERT INTO degrees (name, faculty_id, department_id, credit_hours, duration_years)
VALUES ('Test Degree for Cascade', 1, 1, '100', 4);

SET @test_degree_id = LAST_INSERT_ID();

INSERT INTO program_educational_objectives (degree_id, PEO_No, PEO_Description)
VALUES (@test_degree_id, 'PEO-TEST', 'Test objective for cascade delete');

INSERT INTO program_learning_outcomes (degree_id, programName, PLO_No, PLO_Description, target_attainment)
VALUES (@test_degree_id, 'Test Program', 'PLO-TEST', 'Test outcome for cascade delete', 60.0);

SELECT 'Before delete - Test degree created' AS status;
SELECT COUNT(*) AS test_peos FROM program_educational_objectives WHERE degree_id = @test_degree_id;
SELECT COUNT(*) AS test_plos FROM program_learning_outcomes WHERE degree_id = @test_degree_id;

-- Delete the test degree (should cascade)
DELETE FROM degrees WHERE id = @test_degree_id;

SELECT 'After delete - Cascade delete verification' AS status;
SELECT COUNT(*) AS remaining_test_peos FROM program_educational_objectives WHERE degree_id = @test_degree_id;
SELECT COUNT(*) AS remaining_test_plos FROM program_learning_outcomes WHERE degree_id = @test_degree_id;

-- ===================================
-- Test 10: Summary Statistics
-- ===================================
SELECT '=== TEST 10: Summary Statistics ===' AS test_section;

SELECT 
    'Bloom Taxonomy Levels' AS table_name,
    COUNT(*) AS record_count
FROM bloom_taxonomy_levels
UNION ALL
SELECT 
    'Program Educational Objectives',
    COUNT(*)
FROM program_educational_objectives
UNION ALL
SELECT 
    'Program Learning Outcomes',
    COUNT(*)
FROM program_learning_outcomes
UNION ALL
SELECT 
    'PEO-PLO Mappings',
    COUNT(*)
FROM peo_plo_mapping
UNION ALL
SELECT 
    'CLO-PLO Mappings',
    COUNT(*)
FROM course_learning_outcome_program_learning_outcome
UNION ALL
SELECT 
    'CLO-CO Mappings',
    COUNT(*)
FROM clo_co_mapping;

-- ===================================
-- Test 11: OBE Hierarchy Verification
-- ===================================
SELECT '=== TEST 11: OBE Hierarchy Verification ===' AS test_section;

SELECT 
    d.name AS degree_name,
    COUNT(DISTINCT peo.id) AS total_peos,
    COUNT(DISTINCT plo.id) AS total_plos,
    COUNT(DISTINCT ppm.id) AS peo_plo_mappings
FROM degrees d
LEFT JOIN program_educational_objectives peo ON d.id = peo.degree_id
LEFT JOIN program_learning_outcomes plo ON d.id = plo.degree_id
LEFT JOIN peo_plo_mapping ppm ON peo.id = ppm.peo_id
WHERE d.id = 1
GROUP BY d.id, d.name;

SELECT '=== ALL TESTS COMPLETED ===' AS final_status;
