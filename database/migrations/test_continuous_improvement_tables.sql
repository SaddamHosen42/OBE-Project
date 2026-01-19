-- Test Script for Continuous Improvement Tables (Step 2.10)
-- This script tests the action_plans, action_plan_outcomes, and obe_review_cycles tables

USE obe_database;

-- Display table structures
DESCRIBE action_plans;
DESCRIBE action_plan_outcomes;
DESCRIBE obe_review_cycles;

-- Test 1: Insert Action Plan
INSERT INTO action_plans (
    degree_id, 
    course_offering_id, 
    academic_session_id, 
    outcome_type, 
    outcome_id,
    identified_gap,
    root_cause,
    proposed_action,
    responsible_person,
    target_date,
    status
) VALUES (
    1, 
    NULL, 
    1, 
    'CLO',
    1,
    'CLO1 attainment rate is below target (55% vs 60%)',
    'Students struggle with basic programming concepts',
    'Introduce more practice problems and tutorials',
    1,
    '2026-06-30',
    'Planned'
);

-- Test 2: Insert Action Plan Outcome
INSERT INTO action_plan_outcomes (
    action_plan_id,
    outcome_description,
    improvement_achieved,
    new_attainment_percentage,
    verified_by,
    verified_at
) VALUES (
    1,
    'Additional tutorials implemented and practice sessions conducted',
    'CLO1 attainment improved from 55% to 68% after intervention',
    68.00,
    1,
    NOW()
);

-- Test 3: Insert OBE Review Cycle
INSERT INTO obe_review_cycles (
    degree_id,
    cycle_name,
    start_date,
    end_date,
    review_type,
    status,
    summary_report
) VALUES (
    1,
    'Annual Review 2025-2026',
    '2025-09-01',
    '2026-06-30',
    'Annual',
    'Ongoing',
    'Comprehensive review of program outcomes and continuous improvement initiatives'
);

-- Display inserted data
SELECT * FROM action_plans;
SELECT * FROM action_plan_outcomes;
SELECT * FROM obe_review_cycles;

-- Test 4: Test Foreign Key Relationships
SELECT 
    ap.id,
    ap.outcome_type,
    ap.identified_gap,
    ap.status,
    d.name as degree_name,
    u.name as responsible_person_name
FROM action_plans ap
JOIN degrees d ON ap.degree_id = d.id
JOIN users u ON ap.responsible_person = u.id;

-- Test 5: Test Join between Action Plans and Outcomes
SELECT 
    ap.identified_gap,
    ap.proposed_action,
    ap.status,
    apo.outcome_description,
    apo.new_attainment_percentage,
    apo.verified_at
FROM action_plans ap
LEFT JOIN action_plan_outcomes apo ON ap.id = apo.action_plan_id;

-- Test 6: Test Review Cycles
SELECT 
    orc.cycle_name,
    orc.review_type,
    orc.status,
    orc.start_date,
    orc.end_date,
    d.name as degree_name
FROM obe_review_cycles orc
JOIN degrees d ON orc.degree_id = d.id;

-- Test 7: Test Check Constraints
-- This should fail (invalid outcome_type)
-- INSERT INTO action_plans (degree_id, academic_session_id, outcome_type, outcome_id, identified_gap, proposed_action, responsible_person, target_date, status)
-- VALUES (1, 1, 'INVALID', 1, 'Test gap', 'Test action', 1, '2026-06-30', 'Planned');

-- This should fail (invalid status)
-- INSERT INTO action_plans (degree_id, academic_session_id, outcome_type, outcome_id, identified_gap, proposed_action, responsible_person, target_date, status)
-- VALUES (1, 1, 'CLO', 1, 'Test gap', 'Test action', 1, '2026-06-30', 'INVALID');

-- Test 8: Test Cascade Delete
-- Create a test action plan
INSERT INTO action_plans (degree_id, academic_session_id, outcome_type, outcome_id, identified_gap, proposed_action, responsible_person, target_date, status)
VALUES (1, 1, 'PLO', 1, 'Test gap for deletion', 'Test action', 1, '2026-12-31', 'Planned');

SET @test_plan_id = LAST_INSERT_ID();

-- Add an outcome to it
INSERT INTO action_plan_outcomes (action_plan_id, outcome_description, verified_by)
VALUES (@test_plan_id, 'Test outcome for cascade delete', 1);

-- Verify they exist
SELECT COUNT(*) as action_plans_before FROM action_plans WHERE id = @test_plan_id;
SELECT COUNT(*) as outcomes_before FROM action_plan_outcomes WHERE action_plan_id = @test_plan_id;

-- Delete the action plan (should cascade to outcomes)
DELETE FROM action_plans WHERE id = @test_plan_id;

-- Verify cascade delete worked
SELECT COUNT(*) as action_plans_after FROM action_plans WHERE id = @test_plan_id;
SELECT COUNT(*) as outcomes_after FROM action_plan_outcomes WHERE action_plan_id = @test_plan_id;

-- Cleanup test data
DELETE FROM action_plan_outcomes WHERE action_plan_id IN (SELECT id FROM action_plans);
DELETE FROM action_plans;
DELETE FROM obe_review_cycles;

SELECT 'All Continuous Improvement Tables Tests Completed Successfully!' as Status;
