# Outcome Based Education (OBE) Database Schema

---

## 🧑 Users & Authentication

### users
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | |
| email | varchar | UNIQUE |
| email_verified_at | timestamp | |
| phone | varchar | |
| username | varchar | UNIQUE |
| password | varchar | |
| role | varchar | |
| profile_image | varchar | |
| dob | varchar | |
| nationality | varchar | |
| nid_no | varchar | |
| blood_group | varchar | |
| remember_token | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### sessions
| Column | Type | Constraint |
|--------|------|------------|
| id | varchar | PK |
| user_id | bigint | FK → users.id |
| ip_address | varchar | |
| user_agent | text | |
| payload | longtext | |
| last_activity | int | |

### password_reset_tokens
| Column | Type | Constraint |
|--------|------|------------|
| email | varchar | PK |
| token | varchar | |
| created_at | timestamp | |

---

## 🏠 Address & Personal Info

### addresses
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| user_id | bigint | FK → users.id |
| present_division | varchar | |
| present_district | varchar | |
| present_upazilla | varchar | |
| present_area | varchar | |
| permanent_division | varchar | |
| permanent_district | varchar | |
| permanent_upazilla | varchar | |
| permanent_area | varchar | |
| permanent_district_distance | double | |
| created_at | timestamp | |
| updated_at | timestamp | |

### genders
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| user_id | bigint | FK → users.id |
| name | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 🎓 Academic Structure

### faculties
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | |
| short_name | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### departments
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | |
| dept_code | varchar | |
| faculty_id | bigint | FK → faculties.id |
| created_at | timestamp | |
| updated_at | timestamp | |

### degrees
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | |
| faculty_id | bigint | FK → faculties.id |
| department_id | bigint | FK → departments.id |
| credit_hours | varchar | |
| duration_years | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

### academic_sessions
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| session_name | varchar | (e.g., "2024-2025") |
| start_date | date | |
| end_date | date | |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### semesters
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| academic_session_id | bigint | FK → academic_sessions.id |
| name | varchar | (e.g., "Fall 2024") |
| semester_number | int | |
| start_date | date | |
| end_date | date | |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 📚 Courses & Curriculum

### courses
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| courseCode | varchar | UNIQUE |
| courseTitle | text | |
| department_id | bigint | FK → departments.id |
| degree_id | bigint | FK → degrees.id |
| credit | double | |
| contactHourPerWeek | double | |
| level | varchar | |
| semester | varchar | |
| academicSession | varchar | |
| type | varchar | (Theory/Lab/Project) |
| type_T_S | varchar | |
| totalMarks | varchar | |
| instructor | varchar | |
| prerequisites | text | |
| summary | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_offerings
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_id | bigint | FK → courses.id |
| semester_id | bigint | FK → semesters.id |
| section | varchar | |
| max_students | int | |
| status | varchar | (active/closed) |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_enrollments
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| course_offering_id | bigint | FK → course_offerings.id |
| enrollment_date | date | |
| status | varchar | (enrolled/dropped/completed) |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_objectives
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_id | bigint | FK → courses.id |
| CO_ID | varchar | |
| CO_Description | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_learning_outcomes
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_id | bigint | FK → courses.id |
| CLO_ID | varchar | (e.g., CLO1, CLO2) |
| CLO_Description | text | |
| bloom_taxonomy_level_id | bigint | FK → bloom_taxonomy_levels.id |
| weight_percentage | double | |
| target_attainment | double | (e.g., 60%) |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_contents
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_id | bigint | FK → courses.id |
| content | text | |
| teaching_strategy | varchar | |
| assessment_strategy | varchar | |
| CLO_mapping | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### weekly_lesson_plans
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_id | bigint | FK → courses.id |
| weekNo | varchar | |
| topics | text | |
| specificOutcomes | text | |
| teachingStrategy | varchar | |
| teachingAid | varchar | |
| assessmentStrategy | varchar | |
| CLO_mapping | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 🎯 Outcome Mapping & OBE Framework

### bloom_taxonomy_levels
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| level_number | int | (1-6) |
| name | varchar | (Remember, Understand, Apply, Analyze, Evaluate, Create) |
| description | text | |
| keywords | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### program_educational_objectives (PEO)
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| degree_id | bigint | FK → degrees.id |
| PEO_No | varchar | (e.g., PEO1, PEO2) |
| PEO_Description | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### program_learning_outcomes (PLO)
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| degree_id | bigint | FK → degrees.id |
| programName | varchar | |
| PLO_No | varchar | (e.g., PLO1, PLO2) |
| PLO_Description | text | |
| bloom_taxonomy_level_id | bigint | FK → bloom_taxonomy_levels.id |
| target_attainment | double | (e.g., 60%) |
| created_at | timestamp | |
| updated_at | timestamp | |

### peo_plo_mapping
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| peo_id | bigint | FK → program_educational_objectives.id |
| plo_id | bigint | FK → program_learning_outcomes.id |
| correlation_level | varchar | (High/Medium/Low) |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_learning_outcome_program_learning_outcome
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_learning_outcome_id | bigint | FK → course_learning_outcomes.id |
| program_learning_outcome_id | bigint | FK → program_learning_outcomes.id |
| mapping_level | int | (1=Low, 2=Medium, 3=High) |
| created_at | timestamp | |
| updated_at | timestamp | |

### clo_co_mapping
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_learning_outcome_id | bigint | FK → course_learning_outcomes.id |
| course_objective_id | bigint | FK → course_objectives.id |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 📝 Assessment & Examination Structure

### assessment_types
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | (Quiz, Assignment, Midterm, Final, Lab, Presentation, Project, Viva) |
| category | varchar | (Continuous/Terminal) |
| description | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### assessment_components
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_offering_id | bigint | FK → course_offerings.id |
| assessment_type_id | bigint | FK → assessment_types.id |
| name | varchar | (e.g., "Quiz 1", "Midterm Exam") |
| total_marks | double | |
| weight_percentage | double | |
| scheduled_date | date | |
| duration_minutes | int | |
| instructions | text | |
| is_published | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### assessment_clo_mapping
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| assessment_component_id | bigint | FK → assessment_components.id |
| course_learning_outcome_id | bigint | FK → course_learning_outcomes.id |
| marks_allocated | double | |
| weight_percentage | double | |
| created_at | timestamp | |
| updated_at | timestamp | |

### rubrics
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | |
| description | text | |
| course_learning_outcome_id | bigint | FK → course_learning_outcomes.id (nullable) |
| created_by | bigint | FK → users.id |
| created_at | timestamp | |
| updated_at | timestamp | |

### rubric_criteria
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| rubric_id | bigint | FK → rubrics.id |
| criterion_name | varchar | |
| description | text | |
| max_score | double | |
| weight_percentage | double | |
| order | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

### rubric_levels
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| rubric_criteria_id | bigint | FK → rubric_criteria.id |
| level_name | varchar | (Excellent, Good, Average, Poor, Unsatisfactory) |
| level_score | double | |
| description | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### questions
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| assessment_component_id | bigint | FK → assessment_components.id |
| question_number | varchar | |
| question_text | text | |
| question_type | varchar | (MCQ/Short/Descriptive/Problem) |
| marks | double | |
| difficulty_level | varchar | (Easy/Medium/Hard) |
| bloom_taxonomy_level_id | bigint | FK → bloom_taxonomy_levels.id |
| created_at | timestamp | |
| updated_at | timestamp | |

### question_clo_mapping
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| question_id | bigint | FK → questions.id |
| course_learning_outcome_id | bigint | FK → course_learning_outcomes.id |
| marks_allocated | double | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 📊 Results & Marks Management

### grade_scales
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | (e.g., "Standard Scale") |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### grade_points
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| grade_scale_id | bigint | FK → grade_scales.id |
| letter_grade | varchar | (A+, A, A-, B+, B, B-, C+, C, D, F) |
| grade_point | double | (4.0, 3.75, 3.5, etc.) |
| min_percentage | double | |
| max_percentage | double | |
| remarks | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### student_assessment_marks
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| assessment_component_id | bigint | FK → assessment_components.id |
| marks_obtained | double | |
| is_absent | boolean | |
| is_exempted | boolean | |
| remarks | text | |
| evaluated_by | bigint | FK → users.id |
| evaluated_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

### student_question_marks
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| question_id | bigint | FK → questions.id |
| marks_obtained | double | |
| feedback | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### student_rubric_scores
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| assessment_component_id | bigint | FK → assessment_components.id |
| rubric_criteria_id | bigint | FK → rubric_criteria.id |
| rubric_level_id | bigint | FK → rubric_levels.id |
| score | double | |
| feedback | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_results
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| course_offering_id | bigint | FK → course_offerings.id |
| total_marks | double | |
| percentage | double | |
| grade_point_id | bigint | FK → grade_points.id |
| letter_grade | varchar | |
| grade_point | double | |
| credit_earned | double | |
| status | varchar | (Pass/Fail/Incomplete/Withdrawn) |
| is_published | boolean | |
| remarks | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### semester_results
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| semester_id | bigint | FK → semesters.id |
| total_credits_attempted | double | |
| total_credits_earned | double | |
| total_grade_points | double | |
| sgpa | double | (Semester GPA) |
| cgpa | double | (Cumulative GPA) |
| status | varchar | (Regular/Probation/Dean's List) |
| is_published | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### improvement_retake_records
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| course_offering_id | bigint | FK → course_offerings.id |
| original_course_result_id | bigint | FK → course_results.id |
| type | varchar | (Improvement/Retake) |
| attempt_number | int | |
| new_grade_point | double | |
| new_letter_grade | varchar | |
| is_considered | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 🎯 OBE Attainment & Analytics

### student_clo_attainment
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| course_offering_id | bigint | FK → course_offerings.id |
| course_learning_outcome_id | bigint | FK → course_learning_outcomes.id |
| total_marks_possible | double | |
| marks_obtained | double | |
| attainment_percentage | double | |
| attainment_level | varchar | (Exceeded/Met/Approaching/Not Met) |
| is_attained | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_clo_attainment_summary
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_offering_id | bigint | FK → course_offerings.id |
| course_learning_outcome_id | bigint | FK → course_learning_outcomes.id |
| total_students | int | |
| students_attained | int | |
| average_attainment_percentage | double | |
| attainment_rate | double | (% of students who attained) |
| target_attainment | double | |
| is_target_met | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### student_plo_attainment
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| program_learning_outcome_id | bigint | FK → program_learning_outcomes.id |
| semester_id | bigint | FK → semesters.id |
| cumulative_attainment_percentage | double | |
| attainment_level | varchar | |
| is_attained | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### program_plo_attainment_summary
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| degree_id | bigint | FK → degrees.id |
| program_learning_outcome_id | bigint | FK → program_learning_outcomes.id |
| academic_session_id | bigint | FK → academic_sessions.id |
| batch_year | int | |
| total_students | int | |
| students_attained | int | |
| average_attainment_percentage | double | |
| attainment_rate | double | |
| target_attainment | double | |
| is_target_met | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### attainment_thresholds
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| degree_id | bigint | FK → degrees.id |
| threshold_type | varchar | (CLO/PLO/PEO) |
| level_name | varchar | (Exceeded/Met/Approaching/Not Met) |
| min_percentage | double | |
| max_percentage | double | |
| is_attained | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### direct_attainment_methods
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| course_offering_id | bigint | FK → course_offerings.id |
| method_name | varchar | (Exam/Quiz/Assignment/Lab/Project) |
| weight_percentage | double | |
| description | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### indirect_attainment_methods
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| degree_id | bigint | FK → degrees.id |
| method_name | varchar | (Course Exit Survey/Alumni Survey/Employer Survey) |
| weight_percentage | double | |
| description | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 📋 Surveys & Feedback (Indirect Assessment)

### surveys
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| title | varchar | |
| survey_type | varchar | (Course Exit/Graduate Exit/Alumni/Employer) |
| degree_id | bigint | FK → degrees.id |
| course_offering_id | bigint | FK → course_offerings.id (nullable) |
| start_date | date | |
| end_date | date | |
| is_active | boolean | |
| is_anonymous | boolean | |
| created_by | bigint | FK → users.id |
| created_at | timestamp | |
| updated_at | timestamp | |

### survey_questions
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| survey_id | bigint | FK → surveys.id |
| question_text | text | |
| question_type | varchar | (Likert/Text/MCQ/Rating) |
| is_required | boolean | |
| order | int | |
| clo_id | bigint | FK → course_learning_outcomes.id (nullable) |
| plo_id | bigint | FK → program_learning_outcomes.id (nullable) |
| created_at | timestamp | |
| updated_at | timestamp | |

### survey_responses
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| survey_id | bigint | FK → surveys.id |
| respondent_id | bigint | FK → users.id (nullable if anonymous) |
| respondent_type | varchar | (Student/Alumni/Employer) |
| submitted_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

### survey_answers
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| survey_response_id | bigint | FK → survey_responses.id |
| survey_question_id | bigint | FK → survey_questions.id |
| answer_text | text | |
| rating_value | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

### indirect_attainment_results
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| survey_id | bigint | FK → surveys.id |
| outcome_type | varchar | (CLO/PLO) |
| outcome_id | bigint | |
| average_rating | double | |
| attainment_percentage | double | |
| total_responses | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 📈 Continuous Improvement

### action_plans
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| degree_id | bigint | FK → degrees.id |
| course_offering_id | bigint | FK → course_offerings.id (nullable) |
| academic_session_id | bigint | FK → academic_sessions.id |
| outcome_type | varchar | (CLO/PLO) |
| outcome_id | bigint | |
| identified_gap | text | |
| root_cause | text | |
| proposed_action | text | |
| responsible_person | bigint | FK → users.id |
| target_date | date | |
| status | varchar | (Planned/In Progress/Completed/Deferred) |
| created_at | timestamp | |
| updated_at | timestamp | |

### action_plan_outcomes
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| action_plan_id | bigint | FK → action_plans.id |
| outcome_description | text | |
| improvement_achieved | text | |
| new_attainment_percentage | double | |
| verified_by | bigint | FK → users.id |
| verified_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

### obe_review_cycles
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| degree_id | bigint | FK → degrees.id |
| cycle_name | varchar | |
| start_date | date | |
| end_date | date | |
| review_type | varchar | (Annual/Biennial/Accreditation) |
| status | varchar | (Planned/Ongoing/Completed) |
| summary_report | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 👨‍🎓 Students & Performance

### students
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| user_id | bigint | FK → users.id |
| faculty_id | bigint | FK → faculties.id |
| degree_id | bigint | FK → degrees.id |
| department_id | bigint | FK → departments.id |
| hall_id | bigint | FK → buildings.id |
| SID | varchar | UNIQUE |
| batch_year | int | |
| admission_date | date | |
| level | varchar | |
| semester | varchar | |
| session_year | int | |
| residential_status | varchar | |
| academic_status | varchar | (Active/Graduated/Suspended/Withdrawn) |
| image | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### cgpas
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| cgpa | double | |
| total_credits | double | |
| created_at | timestamp | |
| updated_at | timestamp | |

### guardians
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| student_id | bigint | FK → students.id |
| father_name | varchar | |
| father_phone | varchar | |
| mother_name | varchar | |
| mother_phone | varchar | |
| father_nid | varchar | |
| mother_nid | varchar | |
| guardian_occupation | varchar | |
| income_per_year | double | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 👨‍🏫 Teachers & Roles

### teachers
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| user_id | bigint | FK → users.id |
| faculty_id | bigint | FK → faculties.id |
| department_id | bigint | FK → departments.id |
| designation_id | bigint | FK → designations.id |
| employee_id | varchar | UNIQUE |
| joining_date | date | |
| career_obj | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### designations
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | |
| rank | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

### teacher_course
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| teacher_id | bigint | FK → teachers.id |
| course_offering_id | bigint | FK → course_offerings.id |
| role | varchar | (Instructor/Co-Instructor/Lab Instructor) |
| lessons | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 🏢 Halls & Accommodation

### buildings
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| name | varchar | |
| purpose | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### floors
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| floor_number | int | |
| building_id | bigint | FK → buildings.id |
| total_rooms | int | |
| usage | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### rooms
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| room_number | int | |
| floor_id | bigint | FK → floors.id |
| room_type | varchar | |
| room_size | varchar | |
| available_seats | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

### seat_allocations
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| room_id | bigint | FK → rooms.id |
| student_id | bigint | FK → students.id |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 📄 Reports & Audit

### obe_reports
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| report_type | varchar | (CLO_Attainment/PLO_Attainment/Course_Report/Program_Report) |
| degree_id | bigint | FK → degrees.id (nullable) |
| course_offering_id | bigint | FK → course_offerings.id (nullable) |
| academic_session_id | bigint | FK → academic_sessions.id |
| generated_by | bigint | FK → users.id |
| report_data | json | |
| file_path | varchar | |
| created_at | timestamp | |
| updated_at | timestamp | |

### audit_logs
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| user_id | bigint | FK → users.id |
| action | varchar | (CREATE/UPDATE/DELETE) |
| table_name | varchar | |
| record_id | bigint | |
| old_values | json | |
| new_values | json | |
| ip_address | varchar | |
| user_agent | varchar | |
| created_at | timestamp | |

### result_publications
| Column | Type | Constraint |
|--------|------|------------|
| id | bigint | PK |
| semester_id | bigint | FK → semesters.id |
| publication_type | varchar | (Provisional/Final) |
| published_by | bigint | FK → users.id |
| published_at | timestamp | |
| remarks | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 🔗 Entity Relationship Summary

### Key Relationships:
1. **Users** → Students, Teachers, Addresses, Sessions
2. **Faculties** → Departments → Degrees → Courses
3. **Courses** → CLOs → PLOs (Many-to-Many mapping)
4. **Course Offerings** → Enrollments → Assessment Components
5. **Assessment Components** → CLO Mapping → Questions
6. **Students** → Assessment Marks → CLO Attainment → PLO Attainment
7. **Surveys** → Indirect Attainment → PLO/CLO
8. **Action Plans** → Continuous Improvement Cycle

### OBE Hierarchy:
```
PEO (Program Educational Objectives)
  ↓
PLO (Program Learning Outcomes)
  ↓
CLO (Course Learning Outcomes)
  ↓
Assessment Components (Direct) + Surveys (Indirect)
  ↓
Student Attainment
  ↓
Continuous Improvement Actions
```

### Bloom's Taxonomy Integration:
- Each CLO mapped to a Bloom's level
- Questions tagged with difficulty and Bloom's level
- Enables cognitive level analysis in assessments

### Direct vs Indirect Assessment:
- **Direct**: Exams, Quizzes, Assignments, Projects, Labs
- **Indirect**: Course Exit Surveys, Alumni Surveys, Employer Feedback

---

## 📊 Key Performance Metrics

The database supports calculation of:
- **CLO Attainment Rate**: % of students achieving each CLO
- **PLO Attainment Rate**: Aggregated from all courses contributing to PLO
- **Course Attainment Report**: Overall CLO/PLO achievement per course
- **Program Attainment Report**: Longitudinal PLO achievement tracking
- **Gap Analysis**: Identify underperforming outcomes
- **Continuous Improvement Tracking**: Document actions and their impact