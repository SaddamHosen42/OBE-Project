-- Test Academic Structure Foreign Key Constraints
-- This script tests cascade delete and constraint validation

USE obe_system;

-- Show initial counts
SELECT 'Initial Counts' as Test;
SELECT COUNT(*) as faculties_count FROM faculties;
SELECT COUNT(*) as departments_count FROM departments;
SELECT COUNT(*) as degrees_count FROM degrees;
SELECT COUNT(*) as academic_sessions_count FROM academic_sessions;
SELECT COUNT(*) as semesters_count FROM semesters;

-- Test 1: Try to insert department with invalid faculty_id (should fail)
SELECT '\n=== Test 1: Invalid Faculty Reference (Should Fail) ===' as Test;
INSERT INTO departments (name, dept_code, faculty_id) 
VALUES ('Test Department', 'TEST', 999);

-- Test 2: Try to insert degree with invalid department_id (should fail)
SELECT '\n=== Test 2: Invalid Department Reference (Should Fail) ===' as Test;
INSERT INTO degrees (name, faculty_id, department_id, credit_hours, duration_years) 
VALUES ('Test Degree', 1, 999, '120', 4);

-- Test 3: Try to insert semester with invalid academic_session_id (should fail)
SELECT '\n=== Test 3: Invalid Academic Session Reference (Should Fail) ===' as Test;
INSERT INTO semesters (academic_session_id, name, semester_number, start_date, end_date) 
VALUES (999, 'Test Semester', 1, '2026-01-01', '2026-06-30');

-- Test 4: Verify cascade delete (create test records and delete parent)
SELECT '\n=== Test 4: Cascade Delete Test ===' as Test;

-- Insert test faculty
INSERT INTO faculties (name, short_name) VALUES ('Test Faculty', 'TF');
SET @test_faculty_id = LAST_INSERT_ID();

-- Insert test department
INSERT INTO departments (name, dept_code, faculty_id) 
VALUES ('Test Department', 'TESTDEPT', @test_faculty_id);
SET @test_dept_id = LAST_INSERT_ID();

-- Insert test degree
INSERT INTO degrees (name, faculty_id, department_id, credit_hours, duration_years) 
VALUES ('Test Degree Program', @test_faculty_id, @test_dept_id, '120', 4);

-- Verify records created
SELECT 'Before Delete' as Status;
SELECT COUNT(*) as test_departments FROM departments WHERE faculty_id = @test_faculty_id;
SELECT COUNT(*) as test_degrees FROM degrees WHERE faculty_id = @test_faculty_id;

-- Delete faculty (should cascade to departments and degrees)
DELETE FROM faculties WHERE id = @test_faculty_id;

-- Verify cascade deletion
SELECT 'After Delete' as Status;
SELECT COUNT(*) as remaining_test_departments FROM departments WHERE faculty_id = @test_faculty_id;
SELECT COUNT(*) as remaining_test_degrees FROM degrees WHERE faculty_id = @test_faculty_id;

-- Test 5: Verify academic_sessions and semesters cascade
SELECT '\n=== Test 5: Academic Session Cascade Delete ===' as Test;

-- Insert test academic session
INSERT INTO academic_sessions (session_name, start_date, end_date, is_active) 
VALUES ('TEST-2027', '2027-07-01', '2028-06-30', FALSE);
SET @test_session_id = LAST_INSERT_ID();

-- Insert test semesters
INSERT INTO semesters (academic_session_id, name, semester_number, start_date, end_date, is_active) 
VALUES (@test_session_id, 'Test Fall 2027', 1, '2027-07-01', '2027-12-31', FALSE);

-- Verify semester created
SELECT 'Before Delete' as Status;
SELECT COUNT(*) as test_semesters FROM semesters WHERE academic_session_id = @test_session_id;

-- Delete academic session (should cascade to semesters)
DELETE FROM academic_sessions WHERE id = @test_session_id;

-- Verify cascade deletion
SELECT 'After Delete' as Status;
SELECT COUNT(*) as remaining_test_semesters FROM semesters WHERE academic_session_id = @test_session_id;

-- Final counts (should match initial counts)
SELECT '\n=== Final Verification ===' as Test;
SELECT COUNT(*) as faculties_count FROM faculties;
SELECT COUNT(*) as departments_count FROM departments;
SELECT COUNT(*) as degrees_count FROM degrees;
SELECT COUNT(*) as academic_sessions_count FROM academic_sessions;
SELECT COUNT(*) as semesters_count FROM semesters;

SELECT '\n✅ All constraint tests completed!' as Result;
