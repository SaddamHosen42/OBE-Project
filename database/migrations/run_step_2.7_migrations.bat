@echo off
REM Run Student, Teacher, and Results & Grades Migrations (Step 2.7)

echo Running Student, Teacher, and Results ^& Grades migrations...
echo.

mysql -u root -padmin1433 obe_database < 033_create_students_table.sql
if %errorlevel% neq 0 (
    echo Error running 033_create_students_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created students table

mysql -u root -padmin1433 obe_database < 034_create_cgpas_table.sql
if %errorlevel% neq 0 (
    echo Error running 034_create_cgpas_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created cgpas table

mysql -u root -padmin1433 obe_database < 035_create_guardians_table.sql
if %errorlevel% neq 0 (
    echo Error running 035_create_guardians_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created guardians table

mysql -u root -padmin1433 obe_database < 036_create_designations_table.sql
if %errorlevel% neq 0 (
    echo Error running 036_create_designations_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created designations table

mysql -u root -padmin1433 obe_database < 037_create_teachers_table.sql
if %errorlevel% neq 0 (
    echo Error running 037_create_teachers_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created teachers table

mysql -u root -padmin1433 obe_database < 038_create_teacher_course_table.sql
if %errorlevel% neq 0 (
    echo Error running 038_create_teacher_course_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created teacher_course table

mysql -u root -padmin1433 obe_database < 039_update_course_enrollments_student_fk.sql
if %errorlevel% neq 0 (
    echo Error running 039_update_course_enrollments_student_fk.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Updated course_enrollments with student FK

mysql -u root -padmin1433 obe_database < 040_create_grade_scales_table.sql
if %errorlevel% neq 0 (
    echo Error running 040_create_grade_scales_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created grade_scales table

mysql -u root -padmin1433 obe_database < 041_create_grade_points_table.sql
if %errorlevel% neq 0 (
    echo Error running 041_create_grade_points_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created grade_points table

mysql -u root -padmin1433 obe_database < 042_create_student_assessment_marks_table.sql
if %errorlevel% neq 0 (
    echo Error running 042_create_student_assessment_marks_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created student_assessment_marks table

mysql -u root -padmin1433 obe_database < 043_create_student_question_marks_table.sql
if %errorlevel% neq 0 (
    echo Error running 043_create_student_question_marks_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created student_question_marks table

mysql -u root -padmin1433 obe_database < 044_create_student_rubric_scores_table.sql
if %errorlevel% neq 0 (
    echo Error running 044_create_student_rubric_scores_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created student_rubric_scores table

mysql -u root -padmin1433 obe_database < 045_create_course_results_table.sql
if %errorlevel% neq 0 (
    echo Error running 045_create_course_results_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created course_results table

mysql -u root -padmin1433 obe_database < 046_create_semester_results_table.sql
if %errorlevel% neq 0 (
    echo Error running 046_create_semester_results_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created semester_results table

mysql -u root -padmin1433 obe_database < 047_create_improvement_retake_records_table.sql
if %errorlevel% neq 0 (
    echo Error running 047_create_improvement_retake_records_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created improvement_retake_records table

echo.
echo ✅ All Student, Teacher, and Results ^& Grades migrations completed successfully!
echo.
pause
