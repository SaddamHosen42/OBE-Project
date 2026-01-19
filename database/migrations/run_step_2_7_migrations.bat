@echo off
echo ==========================================
echo Running Step 2.7: Results and Grades Tables
echo ==========================================
echo.

set MYSQL_USER=root
set MYSQL_PASS=admin1433
set DB_NAME=obe_db

echo Creating grade_scales table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 039_create_grade_scales_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create grade_scales table
    pause
    exit /b 1
)
echo Success!
echo.

echo Creating grade_points table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 040_create_grade_points_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create grade_points table
    pause
    exit /b 1
)
echo Success!
echo.

echo Creating student_assessment_marks table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 041_create_student_assessment_marks_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create student_assessment_marks table
    pause
    exit /b 1
)
echo Success!
echo.

echo Creating student_question_marks table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 042_create_student_question_marks_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create student_question_marks table
    pause
    exit /b 1
)
echo Success!
echo.

echo Creating student_rubric_scores table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 043_create_student_rubric_scores_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create student_rubric_scores table
    pause
    exit /b 1
)
echo Success!
echo.

echo Creating course_results table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 044_create_course_results_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create course_results table
    pause
    exit /b 1
)
echo Success!
echo.

echo Creating semester_results table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 045_create_semester_results_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create semester_results table
    pause
    exit /b 1
)
echo Success!
echo.

echo Creating improvement_retake_records table...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% < 046_create_improvement_retake_records_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create improvement_retake_records table
    pause
    exit /b 1
)
echo Success!
echo.

echo ==========================================
echo Step 2.7 Migration Completed Successfully!
echo ==========================================
echo All Results and Grades tables have been created.
echo.
pause
