-- Test file for Step 2.4: Course Tables
-- This file tests the structure and constraints of all course-related tables

-- Test 1: Verify courses table structure
DESCRIBE courses;

-- Test 2: Verify course_offerings table structure
DESCRIBE course_offerings;

-- Test 3: Verify course_enrollments table structure
DESCRIBE course_enrollments;

-- Test 4: Verify course_objectives table structure
DESCRIBE course_objectives;

-- Test 5: Verify course_learning_outcomes table structure
DESCRIBE course_learning_outcomes;

-- Test 6: Verify course_contents table structure
DESCRIBE course_contents;

-- Test 7: Verify weekly_lesson_plans table structure
DESCRIBE weekly_lesson_plans;

-- Test 8: Insert test data into courses table
INSERT INTO courses (
    courseCode, courseTitle, department_id, degree_id, 
    credit, contactHourPerWeek, level, semester, 
    academicSession, type, totalMarks
) VALUES (
    'CSE101', 'Introduction to Computer Science', 1, 1, 
    3.0, 3.0, '1', 'Fall', 
    '2024-2025', 'Theory', '100'
);

-- Test 9: Verify course was inserted
SELECT * FROM courses WHERE courseCode = 'CSE101';

-- Test 10: Insert test data into course_offerings
INSERT INTO course_offerings (course_id, semester_id, section, max_students, status)
VALUES (1, 1, 'A', 60, 'active');

-- Test 11: Verify course offering was inserted
SELECT * FROM course_offerings WHERE course_id = 1;

-- Test 12: Insert test data into course_objectives
INSERT INTO course_objectives (course_id, CO_ID, CO_Description)
VALUES 
    (1, 'CO1', 'Understand basic concepts of programming'),
    (1, 'CO2', 'Apply programming concepts to solve problems'),
    (1, 'CO3', 'Analyze algorithmic complexity');

-- Test 13: Verify course objectives were inserted
SELECT * FROM course_objectives WHERE course_id = 1;

-- Test 14: Insert test data into course_learning_outcomes
INSERT INTO course_learning_outcomes (
    course_id, CLO_ID, CLO_Description, 
    weight_percentage, target_attainment
) VALUES 
    (1, 'CLO1', 'Students will be able to write basic programs', 30.0, 60.0),
    (1, 'CLO2', 'Students will be able to debug code', 35.0, 65.0),
    (1, 'CLO3', 'Students will be able to design algorithms', 35.0, 70.0);

-- Test 15: Verify CLOs were inserted
SELECT * FROM course_learning_outcomes WHERE course_id = 1;

-- Test 16: Insert test data into course_contents
INSERT INTO course_contents (
    course_id, content, teaching_strategy, 
    assessment_strategy, CLO_mapping
) VALUES (
    1, 
    'Introduction to programming fundamentals, variables, data types, control structures',
    'Lecture, Demonstration, Hands-on Practice',
    'Quizzes, Assignments, Exams',
    'CLO1, CLO2'
);

-- Test 17: Verify course content was inserted
SELECT * FROM course_contents WHERE course_id = 1;

-- Test 18: Insert test data into weekly_lesson_plans
INSERT INTO weekly_lesson_plans (
    course_id, weekNo, topics, specificOutcomes,
    teachingStrategy, teachingAid, assessmentStrategy, CLO_mapping
) VALUES 
    (1, 'Week 1', 'Introduction to Programming', 'Understand programming basics',
     'Lecture', 'PPT, Whiteboard', 'Quiz', 'CLO1'),
    (1, 'Week 2', 'Variables and Data Types', 'Learn variable declaration',
     'Lecture + Lab', 'Code Examples', 'Assignment', 'CLO1, CLO2');

-- Test 19: Verify weekly lesson plans were inserted
SELECT * FROM weekly_lesson_plans WHERE course_id = 1;

-- Test 20: Test foreign key constraints
-- This should fail because department_id 999 doesn't exist
-- INSERT INTO courses (courseCode, courseTitle, department_id, degree_id, credit)
-- VALUES ('CSE999', 'Invalid Course', 999, 1, 3.0);

-- Test 21: Test unique constraint on courseCode
-- This should fail because CSE101 already exists
-- INSERT INTO courses (courseCode, courseTitle, department_id, degree_id, credit)
-- VALUES ('CSE101', 'Duplicate Course', 1, 1, 3.0);

-- Test 22: Test check constraint on credit
-- This should fail because credit is negative
-- INSERT INTO courses (courseCode, courseTitle, department_id, degree_id, credit)
-- VALUES ('CSE102', 'Invalid Credit', 1, 1, -1.0);

-- Test 23: Test unique constraint on CLO_ID per course
-- This should fail because CLO1 already exists for course 1
-- INSERT INTO course_learning_outcomes (course_id, CLO_ID, CLO_Description)
-- VALUES (1, 'CLO1', 'Duplicate CLO');

-- Test 24: Test cascade delete - create a course and delete it
INSERT INTO courses (courseCode, courseTitle, department_id, degree_id, credit)
VALUES ('CSE999', 'Test Course for Deletion', 1, 1, 3.0);

SET @test_course_id = LAST_INSERT_ID();

INSERT INTO course_objectives (course_id, CO_ID, CO_Description)
VALUES (@test_course_id, 'CO1', 'Test Objective');

INSERT INTO course_learning_outcomes (course_id, CLO_ID, CLO_Description)
VALUES (@test_course_id, 'CLO1', 'Test CLO');

-- Delete the course and verify cascade works
DELETE FROM courses WHERE id = @test_course_id;

-- Verify related records were deleted
SELECT COUNT(*) as remaining_objectives FROM course_objectives WHERE course_id = @test_course_id;
SELECT COUNT(*) as remaining_clos FROM course_learning_outcomes WHERE course_id = @test_course_id;

-- Test 25: Display table counts
SELECT 
    (SELECT COUNT(*) FROM courses) as courses_count,
    (SELECT COUNT(*) FROM course_offerings) as course_offerings_count,
    (SELECT COUNT(*) FROM course_objectives) as course_objectives_count,
    (SELECT COUNT(*) FROM course_learning_outcomes) as course_learning_outcomes_count,
    (SELECT COUNT(*) FROM course_contents) as course_contents_count,
    (SELECT COUNT(*) FROM weekly_lesson_plans) as weekly_lesson_plans_count;

SELECT 'All Course Tables Tests Completed Successfully!' as status;
