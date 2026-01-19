@echo off
REM Run Results & Grades Migrations (Step 2.7)

echo Running Results & Grades migrations...
echo.

mysql -u root -padmin1433 obe_database < 033_create_grade_scales_table.sql
if %errorlevel% neq 0 (
    echo Error running 033_create_grade_scales_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created grade_scales table

mysql -u root -padmin1433 obe_database < 034_create_grade_points_table.sql
if %errorlevel% neq 0 (
    echo Error running 034_create_grade_points_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created grade_points table

mysql -u root -padmin1433 obe_database < 035_create_student_assessment_marks_table.sql
if %errorlevel% neq 0 (
    echo Error running 035_create_student_assessment_marks_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created student_assessment_marks table

mysql -u root -padmin1433 obe_database < 036_create_student_question_marks_table.sql
if %errorlevel% neq 0 (
    echo Error running 036_create_student_question_marks_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created student_question_marks table

mysql -u root -padmin1433 obe_database < 037_create_student_rubric_scores_table.sql
if %errorlevel% neq 0 (
    echo Error running 037_create_student_rubric_scores_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created student_rubric_scores table

mysql -u root -padmin1433 obe_database < 038_create_course_results_table.sql
if %errorlevel% neq 0 (
    echo Error running 038_create_course_results_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created course_results table

mysql -u root -padmin1433 obe_database < 039_create_semester_results_table.sql
if %errorlevel% neq 0 (
    echo Error running 039_create_semester_results_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created semester_results table

mysql -u root -padmin1433 obe_database < 040_create_improvement_retake_records_table.sql
if %errorlevel% neq 0 (
    echo Error running 040_create_improvement_retake_records_table.sql
    pause
    exit /b %errorlevel%
)
echo ✓ Created improvement_retake_records table

echo.
echo ✅ All Results & Grades migrations completed successfully!
echo.
pause
