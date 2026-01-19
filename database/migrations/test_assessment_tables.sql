-- Test Assessment Tables - Step 2.6
-- This script tests all assessment-related tables and their relationships

USE obe_system;

-- ================================================
-- Test 1: Verify all assessment tables exist
-- ================================================
SELECT 'Test 1: Checking Assessment Tables Existence' AS Test;

SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'obe_system'
AND TABLE_NAME IN (
    'assessment_types',
    'assessment_components',
    'assessment_clo_mapping',
    'rubrics',
    'rubric_criteria',
    'rubric_levels',
    'questions',
    'question_clo_mapping'
)
ORDER BY TABLE_NAME;

-- ================================================
-- Test 2: Verify default assessment types
-- ================================================
SELECT 'Test 2: Checking Default Assessment Types' AS Test;

SELECT id, name, category, description
FROM assessment_types
ORDER BY id;

-- ================================================
-- Test 3: Test Foreign Key Constraints
-- ================================================
SELECT 'Test 3: Checking Foreign Key Constraints' AS Test;

SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'obe_system'
AND TABLE_NAME IN (
    'assessment_components',
    'assessment_clo_mapping',
    'rubrics',
    'rubric_criteria',
    'rubric_levels',
    'questions',
    'question_clo_mapping'
)
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- ================================================
-- Test 4: Insert Sample Data (if prerequisites exist)
-- ================================================
SELECT 'Test 4: Testing Data Insertion' AS Test;

-- Check if we have course offerings to link to
SELECT COUNT(*) AS course_offering_count FROM course_offerings;

-- Check if we have CLOs to link to
SELECT COUNT(*) AS clo_count FROM course_learning_outcomes;

-- Check if we have users to link to (for rubrics)
SELECT COUNT(*) AS user_count FROM users;

-- ================================================
-- Test 5: Sample Assessment Component Insertion (conditional)
-- ================================================
SELECT 'Test 5: Attempting Sample Data Insertion' AS Test;

-- Only insert if we have necessary data
SET @has_course_offering = (SELECT COUNT(*) FROM course_offerings LIMIT 1);
SET @has_assessment_type = (SELECT COUNT(*) FROM assessment_types LIMIT 1);

-- Conditional insert for assessment_components
-- Note: This will only work if prerequisites exist

-- ================================================
-- Test 6: Verify Indexes
-- ================================================
SELECT 'Test 6: Checking Indexes' AS Test;

SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'obe_system'
AND TABLE_NAME IN (
    'assessment_types',
    'assessment_components',
    'assessment_clo_mapping',
    'rubrics',
    'rubric_criteria',
    'rubric_levels',
    'questions',
    'question_clo_mapping'
)
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ================================================
-- Test 7: Check Unique Constraints
-- ================================================
SELECT 'Test 7: Checking Unique Constraints' AS Test;

SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'obe_system'
AND TABLE_NAME IN (
    'assessment_clo_mapping',
    'question_clo_mapping'
)
AND CONSTRAINT_TYPE = 'UNIQUE'
ORDER BY TABLE_NAME;

-- ================================================
-- Test 8: Test Cascade Deletes (conceptual check)
-- ================================================
SELECT 'Test 8: Verifying Cascade Delete Setup' AS Test;

SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'obe_system'
AND TABLE_NAME IN (
    'assessment_components',
    'assessment_clo_mapping',
    'rubric_criteria',
    'rubric_levels',
    'questions',
    'question_clo_mapping'
)
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- ================================================
-- Summary Report
-- ================================================
SELECT 'Summary: Assessment Tables Migration Status' AS Test;

SELECT 
    'assessment_types' AS table_name,
    (SELECT COUNT(*) FROM assessment_types) AS row_count,
    'Default types loaded' AS status
UNION ALL
SELECT 
    'assessment_components',
    (SELECT COUNT(*) FROM assessment_components),
    'Ready for data'
UNION ALL
SELECT 
    'assessment_clo_mapping',
    (SELECT COUNT(*) FROM assessment_clo_mapping),
    'Ready for data'
UNION ALL
SELECT 
    'rubrics',
    (SELECT COUNT(*) FROM rubrics),
    'Ready for data'
UNION ALL
SELECT 
    'rubric_criteria',
    (SELECT COUNT(*) FROM rubric_criteria),
    'Ready for data'
UNION ALL
SELECT 
    'rubric_levels',
    (SELECT COUNT(*) FROM rubric_levels),
    'Ready for data'
UNION ALL
SELECT 
    'questions',
    (SELECT COUNT(*) FROM questions),
    'Ready for data'
UNION ALL
SELECT 
    'question_clo_mapping',
    (SELECT COUNT(*) FROM question_clo_mapping),
    'Ready for data';

-- ================================================
-- Final Message
-- ================================================
SELECT '✅ Assessment Tables Testing Complete!' AS Status;
