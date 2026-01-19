@echo off
REM Run All Migrations in Order (001-047)

echo Running all OBE System migrations...
echo.

REM Step 2.1: Core User Tables
mysql -u root -padmin1433 obe_database < 002_create_users_table.sql
echo ✓ Created users table

mysql -u root -padmin1433 obe_database < 003_create_sessions_table.sql
echo ✓ Created sessions table

mysql -u root -padmin1433 obe_database < 004_create_password_reset_tokens_table.sql
echo ✓ Created password_reset_tokens table

REM Step 2.2: Personal Information Tables
mysql -u root -padmin1433 obe_database < 005_create_addresses_table.sql
echo ✓ Created addresses table

mysql -u root -padmin1433 obe_database < 006_create_genders_table.sql
echo ✓ Created genders table

REM Step 2.3: Academic Structure Tables
mysql -u root -padmin1433 obe_database < 007_create_faculties_table.sql
echo ✓ Created faculties table

mysql -u root -padmin1433 obe_database < 008_create_departments_table.sql
echo ✓ Created departments table

mysql -u root -padmin1433 obe_database < 009_create_degrees_table.sql
echo ✓ Created degrees table

mysql -u root -padmin1433 obe_database < 010_create_academic_sessions_table.sql
echo ✓ Created academic_sessions table

mysql -u root -padmin1433 obe_database < 011_create_semesters_table.sql
echo ✓ Created semesters table

REM Step 2.4: Course Tables
mysql -u root -padmin1433 obe_database < 012_create_courses_table.sql
echo ✓ Created courses table

mysql -u root -padmin1433 obe_database < 013_create_course_offerings_table.sql
echo ✓ Created course_offerings table

mysql -u root -padmin1433 obe_database < 014_create_course_enrollments_table.sql
echo ✓ Created course_enrollments table

mysql -u root -padmin1433 obe_database < 015_create_course_objectives_table.sql
echo ✓ Created course_objectives table

mysql -u root -padmin1433 obe_database < 016_create_course_learning_outcomes_table.sql
echo ✓ Created course_learning_outcomes table

mysql -u root -padmin1433 obe_database < 017_create_course_contents_table.sql
echo ✓ Created course_contents table

mysql -u root -padmin1433 obe_database < 018_create_weekly_lesson_plans_table.sql
echo ✓ Created weekly_lesson_plans table

REM Step 2.5: OBE Framework Tables
mysql -u root -padmin1433 obe_database < 019_create_bloom_taxonomy_levels_table.sql
echo ✓ Created bloom_taxonomy_levels table

mysql -u root -padmin1433 obe_database < 020_create_program_educational_objectives_table.sql
echo ✓ Created program_educational_objectives table

mysql -u root -padmin1433 obe_database < 021_create_program_learning_outcomes_table.sql
echo ✓ Created program_learning_outcomes table

mysql -u root -padmin1433 obe_database < 022_create_peo_plo_mapping_table.sql
echo ✓ Created peo_plo_mapping table

mysql -u root -padmin1433 obe_database < 023_create_course_learning_outcome_program_learning_outcome_table.sql
echo ✓ Created course_learning_outcome_program_learning_outcome table

mysql -u root -padmin1433 obe_database < 024_create_clo_co_mapping_table.sql
echo ✓ Created clo_co_mapping table

REM Step 2.6: Assessment Tables
mysql -u root -padmin1433 obe_database < 025_create_assessment_types_table.sql
echo ✓ Created assessment_types table

mysql -u root -padmin1433 obe_database < 026_create_assessment_components_table.sql
echo ✓ Created assessment_components table

mysql -u root -padmin1433 obe_database < 027_create_assessment_clo_mapping_table.sql
echo ✓ Created assessment_clo_mapping table

mysql -u root -padmin1433 obe_database < 028_create_rubrics_table.sql
echo ✓ Created rubrics table

mysql -u root -padmin1433 obe_database < 029_create_rubric_criteria_table.sql
echo ✓ Created rubric_criteria table

mysql -u root -padmin1433 obe_database < 030_create_rubric_levels_table.sql
echo ✓ Created rubric_levels table

mysql -u root -padmin1433 obe_database < 031_create_questions_table.sql
echo ✓ Created questions table

mysql -u root -padmin1433 obe_database < 032_create_question_clo_mapping_table.sql
echo ✓ Created question_clo_mapping table

REM Step 2.7: Student & Teacher Tables
mysql -u root -padmin1433 obe_database < 033_create_students_table.sql
echo ✓ Created students table

mysql -u root -padmin1433 obe_database < 034_create_cgpas_table.sql
echo ✓ Created cgpas table

mysql -u root -padmin1433 obe_database < 035_create_guardians_table.sql
echo ✓ Created guardians table

mysql -u root -padmin1433 obe_database < 036_create_designations_table.sql
echo ✓ Created designations table

mysql -u root -padmin1433 obe_database < 037_create_teachers_table.sql
echo ✓ Created teachers table

mysql -u root -padmin1433 obe_database < 038_create_teacher_course_table.sql
echo ✓ Created teacher_course table

mysql -u root -padmin1433 obe_database < 039_update_course_enrollments_student_fk.sql
echo ✓ Updated course_enrollments with student FK

REM Step 2.7: Results & Grades Tables
mysql -u root -padmin1433 obe_database < 040_create_grade_scales_table.sql
echo ✓ Created grade_scales table

mysql -u root -padmin1433 obe_database < 041_create_grade_points_table.sql
echo ✓ Created grade_points table

mysql -u root -padmin1433 obe_database < 042_create_student_assessment_marks_table.sql
echo ✓ Created student_assessment_marks table

mysql -u root -padmin1433 obe_database < 043_create_student_question_marks_table.sql
echo ✓ Created student_question_marks table

mysql -u root -padmin1433 obe_database < 044_create_student_rubric_scores_table.sql
echo ✓ Created student_rubric_scores table

mysql -u root -padmin1433 obe_database < 045_create_course_results_table.sql
echo ✓ Created course_results table

mysql -u root -padmin1433 obe_database < 046_create_semester_results_table.sql
echo ✓ Created semester_results table

mysql -u root -padmin1433 obe_database < 047_create_improvement_retake_records_table.sql
echo ✓ Created improvement_retake_records table

echo.
echo ✅ All migrations completed successfully!
echo.
pause
