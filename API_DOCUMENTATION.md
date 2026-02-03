# OBE System - Complete API Documentation

**Base URL:** `http://localhost:5000/api` (adjust according to your server configuration)

**Authentication:** Most endpoints require Bearer token authentication
- Header: `Authorization: Bearer <your_token>`
- Get token from `/api/auth/login` or `/api/auth/register`

---

## Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Academic Structure](#2-academic-structure)
3. [Course Management](#3-course-management)
4. [Program Outcomes](#4-program-outcomes)
5. [People Management](#5-people-management)
6. [Assessment](#6-assessment)
7. [Results & Grades](#7-results--grades)
8. [Attainment & Analysis](#8-attainment--analysis)
9. [Action Plans & Review](#9-action-plans--review)
10. [Reports & Surveys](#10-reports--surveys)
11. [System & Infrastructure](#11-system--infrastructure)

---

## 1. Authentication & User Management

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body |
|--------|----------|--------|-------------|--------------|
| POST | `/api/auth/register` | Public | Register a new user | `{ name, email, username, password, role, phone?, dob?, nationality?, nid_no?, blood_group? }` |
| POST | `/api/auth/login` | Public | Login and get JWT token | `{ identifier, password }` |
| POST | `/api/auth/logout` | Private | Logout current user | - |
| POST | `/api/auth/refresh` | Public | Refresh access token | `{ refreshToken }` |
| POST | `/api/auth/forgot-password` | Public | Request password reset | `{ email }` |
| POST | `/api/auth/reset-password` | Public | Reset password with token | `{ token, password }` |
| POST | `/api/auth/change-password` | Private | Change current password | `{ currentPassword, newPassword }` |

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "token": "JWT_TOKEN",
    "refreshToken": "REFRESH_TOKEN"
  }
}
```

### User Routes (`/api/users`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/users` | Admin | Get all users with pagination | Query: `page, limit, role, search, orderBy, order` |
| GET | `/api/users/profile` | Private | Get own profile | - |
| PUT | `/api/users/profile` | Private | Update own profile | Body: `{ name?, phone?, profile_image?, dob?, nationality?, nid_no?, blood_group?, current_password?, new_password? }` |
| GET | `/api/users/:id` | Admin | Get user by ID | - |
| PUT | `/api/users/:id` | Admin | Update user (admin) | Body: Same as registration |
| DELETE | `/api/users/:id` | Admin | Delete user | - |

---

## 2. Academic Structure

### Faculty Routes (`/api/faculties`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/faculties` | Private | Get all faculties | Query: `page, limit, search, orderBy, order, withDepartments` |
| GET | `/api/faculties/:id` | Private | Get faculty by ID | Query: `withDepartments` |
| POST | `/api/faculties` | Admin | Create new faculty | Body: `{ name, short_name, description?, dean_user_id?, email?, phone?, website?, established_date? }` |
| PUT | `/api/faculties/:id` | Admin | Update faculty | Body: Same as create |
| DELETE | `/api/faculties/:id` | Admin | Delete faculty | - |

### Department Routes (`/api/departments`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/departments` | Private | Get all departments | Query: `page, limit, search, orderBy, order, withDegrees, facultyId` |
| GET | `/api/departments/:id` | Private | Get department by ID | Query: `withDegrees` |
| GET | `/api/departments/code/:code` | Private | Get department by code | - |
| GET | `/api/departments/count/by-faculty/:facultyId` | Private | Count departments in faculty | - |
| POST | `/api/departments` | Admin | Create new department | Body: `{ name, dept_code, faculty_id, hod_user_id?, email?, phone?, established_date? }` |
| PUT | `/api/departments/:id` | Admin | Update department | Body: Same as create |
| DELETE | `/api/departments/:id` | Admin | Delete department | - |

### Degree Routes (`/api/degrees`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/degrees` | Private | Get all degrees | Query: `page, limit, search, orderBy, order, withPLOs, withPEOs, departmentId` |
| GET | `/api/degrees/:id` | Private | Get degree by ID | Query: `withPLOs, withPEOs, withBoth` |
| GET | `/api/degrees/count/by-department/:departmentId` | Private | Count degrees in department | - |
| POST | `/api/degrees` | Admin | Create new degree | Body: `{ name, faculty_id, department_id, credit_hours?, duration_years? }` |
| PUT | `/api/degrees/:id` | Admin | Update degree | Body: Same as create |
| DELETE | `/api/degrees/:id` | Admin | Delete degree | - |

### Academic Session Routes (`/api/academic-sessions`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/academic-sessions` | Private | Get all academic sessions | Query: `page, limit, search, orderBy, order, withSemesters` |
| GET | `/api/academic-sessions/active/current` | Private | Get current active session | - |
| GET | `/api/academic-sessions/:id` | Private | Get session by ID | Query: `withSemesters, withCourses` |
| GET | `/api/academic-sessions/:id/semesters/count` | Private | Count semesters in session | - |
| POST | `/api/academic-sessions` | Admin | Create new session | Body: `{ session_name, start_date, end_date, is_active? }` |
| PUT | `/api/academic-sessions/:id` | Admin | Update session | Body: Same as create |
| PUT | `/api/academic-sessions/:id/set-active` | Admin | Set session as active | - |
| DELETE | `/api/academic-sessions/:id` | Admin | Delete session | - |

### Semester Routes (`/api/semesters`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/semesters` | Private | Get all semesters | Query: `page, limit, search, orderBy, order, sessionId, includeSession` |
| GET | `/api/semesters/active/current` | Private | Get current active semester | Query: `includeSession` |
| GET | `/api/semesters/:id` | Private | Get semester by ID | Query: `includeSession, includeCourseOfferings` |
| GET | `/api/semesters/:id/course-offerings/count` | Private | Count course offerings | - |
| POST | `/api/semesters` | Admin | Create new semester | Body: `{ academic_session_id, name, semester_number, start_date, end_date, is_active? }` |
| PUT | `/api/semesters/:id` | Admin | Update semester | Body: Same as create |
| PATCH | `/api/semesters/:id/activate` | Admin | Activate semester | - |
| DELETE | `/api/semesters/:id` | Admin | Delete semester | - |

---

## 3. Course Management

### Course Routes (`/api/courses`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/courses` | Private | Get all courses | Query: `page, limit, search, orderBy, order, departmentId, degreeId, level, semester, type` |
| GET | `/api/courses/search` | Private | Search courses | Query: `keyword, page, limit, orderBy, order` |
| GET | `/api/courses/:id` | Private | Get course by ID | Query: `includeAll` |
| GET | `/api/courses/:id/clos` | Private | Get course CLOs | - |
| GET | `/api/courses/department/:departmentId` | Private | Get courses by department | - |
| GET | `/api/courses/degree/:degreeId` | Private | Get courses by degree | - |
| POST | `/api/courses` | Admin | Create new course | Body: `{ course_code, course_title, credit_hours, department_id, degree_id, level?, semester?, course_type?, prerequisite_course_ids?, course_summary? }` |
| PUT | `/api/courses/:id` | Admin/Teacher | Update course | Body: Same as create |
| DELETE | `/api/courses/:id` | Admin | Delete course | - |

### Course Offering Routes (`/api/course-offerings`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/course-offerings` | Private | Get all course offerings | Query: `page, limit, orderBy, order, semesterId, teacherId, courseId, status` |
| GET | `/api/course-offerings/progress` | Private | Get course progress | - |
| GET | `/api/course-offerings/:id` | Private | Get course offering by ID | - |
| GET | `/api/course-offerings/:id/enrollments` | Private | Get course offering enrollments | - |
| POST | `/api/course-offerings` | Admin/Teacher | Create course offering | Body: `{ course_id, semester_id, section?, max_students?, status? }` |
| PUT | `/api/course-offerings/:id` | Admin/Teacher | Update course offering | Body: Same as create |
| DELETE | `/api/course-offerings/:id` | Admin | Delete course offering | - |
| POST | `/api/course-offerings/:id/assign-teacher` | Admin/Teacher | Assign teacher to offering | Body: `{ teacher_id, role?, lessons? }` |
| PUT | `/api/course-offerings/teacher-assignments/:assignmentId` | Admin/Teacher | Update teacher assignment | Body: `{ role?, lessons? }` |
| DELETE | `/api/course-offerings/teacher-assignments/:assignmentId` | Admin/Teacher | Remove teacher assignment | - |

### CLO Routes (`/api/clos`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/clos` | Private | Get all CLOs | Query: `courseId, includeBloomLevel, includePLOMappings, orderBy, order` |
| GET | `/api/clos/:id` | Private | Get CLO by ID | Query: `includePLOMappings, includeAttainment` |
| GET | `/api/clos/course/:courseId/attainment-summary` | Admin/Faculty | Get course CLO attainment summary | Query: `courseOfferingId` |
| GET | `/api/clos/:id/attainment` | Admin/Faculty | Get CLO attainment | Query: `academicSessionId, courseOfferingId` |
| GET | `/api/clos/:id/plos` | Admin/Faculty | Get mapped PLOs | - |
| POST | `/api/clos` | Admin/Faculty | Create new CLO | Body: `{ course_id, CLO_ID, CLO_Description, bloom_taxonomy_level_id?, weight_percentage?, target_attainment? }` |
| PUT | `/api/clos/:id` | Admin/Faculty | Update CLO | Body: Same as create |
| DELETE | `/api/clos/:id` | Admin | Delete CLO | - |
| POST | `/api/clos/:id/map-plo` | Admin/Faculty | Map CLO to PLO | Body: `{ plo_id, correlation_level? }` |
| DELETE | `/api/clos/:id/unmap-plo/:ploId` | Admin/Faculty | Unmap CLO from PLO | - |

---

## 4. Program Outcomes

### PLO Routes (`/api/plos`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/plos` | Private | Get all PLOs | Query: `degreeId, includePEOMappings, includeCLOMappings, orderBy, order` |
| GET | `/api/plos/:id` | Private | Get PLO by ID | - |
| GET | `/api/plos/degree/:degreeId/attainment-summary` | Admin/Faculty | Get degree PLO attainment summary | Query: `academicSessionId` |
| GET | `/api/plos/:id/attainment` | Admin/Faculty | Get PLO attainment | Query: `academicSessionId, degreeId` |
| GET | `/api/plos/:id/peos` | Admin/Faculty | Get mapped PEOs | - |
| GET | `/api/plos/:id/clos` | Admin/Faculty | Get mapped CLOs | - |
| POST | `/api/plos` | Admin | Create new PLO | Body: `{ degree_id, PLO_ID, PLO_Description, weight_percentage?, target_attainment? }` |
| PUT | `/api/plos/:id` | Admin | Update PLO | Body: Same as create |
| DELETE | `/api/plos/:id` | Admin | Delete PLO | - |
| POST | `/api/plos/:id/map-peo` | Admin | Map PLO to PEO | Body: `{ peo_id, correlation_level? }` |
| DELETE | `/api/plos/:id/unmap-peo/:peoId` | Admin | Unmap PLO from PEO | - |

### PEO Routes (`/api/peos`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/peos` | Private | Get all PEOs | Query: `degreeId, includePLOMappings, orderBy, order` |
| GET | `/api/peos/:id` | Private | Get PEO by ID | - |
| GET | `/api/peos/degree/:degreeId/stats` | Admin/Faculty | Get PEO statistics by degree | - |
| GET | `/api/peos/:id/plos` | Admin/Faculty | Get mapped PLOs | - |
| POST | `/api/peos` | Admin | Create new PEO | Body: `{ degree_id, PEO_ID, PEO_Description }` |
| PUT | `/api/peos/:id` | Admin | Update PEO | Body: Same as create |
| DELETE | `/api/peos/:id` | Admin | Delete PEO | - |
| POST | `/api/peos/:id/plos` | Admin | Map PEO to PLO | Body: `{ plo_id, correlation_level? }` |
| POST | `/api/peos/:id/plos/bulk` | Admin | Bulk map PLOs to PEO | Body: `{ mappings: [{ plo_id, correlation_level? }] }` |
| PUT | `/api/peos/:id/plos/:ploId` | Admin | Update PEO-PLO mapping | Body: `{ correlation_level? }` |
| DELETE | `/api/peos/:id/plos/:ploId` | Admin | Remove PLO mapping from PEO | - |

### Bloom Taxonomy Routes (`/api/bloom-taxonomy`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/bloom-taxonomy` | Private | Get all Bloom levels | Query: `search, levelNumber, startLevel, endLevel, orderBy, order` |
| GET | `/api/bloom-taxonomy/:id` | Private | Get Bloom level by ID | - |
| GET | `/api/bloom-taxonomy/name/:name` | Private | Get Bloom level by name | - |
| GET | `/api/bloom-taxonomy/stats/count` | Private | Get Bloom levels count | - |

---

## 5. People Management

### Student Routes (`/api/students`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/students` | Admin/Teacher | Get all students | Query: `page, limit, search, orderBy, order, departmentId, degreeId, academicStatus, batchYear` |
| GET | `/api/students/:id` | Private | Get student by ID | - |
| GET | `/api/students/sid/:sid` | Private | Get student by SID | - |
| GET | `/api/students/department/:departmentId` | Admin/Teacher | Get students by department | - |
| GET | `/api/students/degree/:degreeId` | Admin/Teacher | Get students by degree | - |
| GET | `/api/students/:id/enrollments` | Private | Get student enrollments | Query: `status, academicSessionId, semesterId` |
| GET | `/api/students/:id/results` | Private | Get student results | - |
| GET | `/api/students/:id/attainment` | Private | Get student attainment report | Query: `courseOfferingId, semesterId` |
| POST | `/api/students` | Admin | Create new student | Body: `{ user_id, student_id, faculty_id, department_id, degree_id, batch_year, section?, academic_status? }` |
| PUT | `/api/students/:id` | Admin | Update student | Body: Same as create |
| DELETE | `/api/students/:id` | Admin | Delete student | - |

### Teacher Routes (`/api/teachers`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/teachers` | Private | Get all teachers | Query: `page, limit, search, orderBy, order, withDetails, departmentId` |
| GET | `/api/teachers/:id` | Private | Get teacher by ID | Query: `withDetails` |
| GET | `/api/teachers/department/:departmentId` | Private | Get teachers by department | - |
| GET | `/api/teachers/:id/courses` | Private | Get teacher courses | - |
| POST | `/api/teachers` | Admin | Create new teacher | Body: `{ user_id, faculty_id, department_id, designation_id, employee_id, joining_date, career_obj? }` |
| PUT | `/api/teachers/:id` | Admin | Update teacher | Body: Same as create |
| DELETE | `/api/teachers/:id` | Admin | Delete teacher | - |
| POST | `/api/teachers/:id/courses` | Admin | Assign course to teacher | Body: `{ course_offering_id, role?, lessons? }` |
| PUT | `/api/teachers/:id/courses/:assignmentId` | Admin | Update course assignment | Body: `{ role?, lessons? }` |
| DELETE | `/api/teachers/:id/courses/:assignmentId` | Admin | Remove course assignment | - |

### Enrollment Routes (`/api/enrollments`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| POST | `/api/enrollments` | Admin/Teacher | Enroll student | Body: `{ student_id, course_offering_id, enrollment_date?, status? }` |
| GET | `/api/enrollments/check` | Private | Check enrollment | Query: `student_id, course_offering_id` |
| GET | `/api/enrollments/offering/:id/stats` | Admin/Teacher | Get enrollment statistics | - |
| GET | `/api/enrollments/offering/:id` | Admin/Teacher | Get enrollments by course offering | Query: `status, orderBy, order` |
| GET | `/api/enrollments/student/:id` | Private | Get enrollments by student | Query: `status, orderBy, order` |
| GET | `/api/enrollments/:id` | Private | Get enrollment by ID | - |
| PUT | `/api/enrollments/:id/drop` | Admin/Teacher | Drop enrollment | - |
| PUT | `/api/enrollments/:id/status` | Admin/Teacher | Update enrollment status | Body: `{ status }` |
| DELETE | `/api/enrollments/:id` | Admin | Delete enrollment | - |

---

## 6. Assessment

### Assessment Routes (`/api/assessments`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/assessments/types` | Private | Get assessment types | Query: `category, groupByCategory` |
| GET | `/api/assessments/types/:id` | Private | Get assessment type by ID | - |
| POST | `/api/assessments/types` | Admin | Create assessment type | Body: `{ type_name, category, description? }` |
| PUT | `/api/assessments/types/:id` | Admin | Update assessment type | Body: Same as create |
| DELETE | `/api/assessments/types/:id` | Admin | Delete assessment type | - |
| GET | `/api/assessments/components` | Private | Get assessment components | Query: `courseOfferingId, courseId, semesterId, published` |
| GET | `/api/assessments/components/:id` | Private | Get assessment component by ID | - |
| POST | `/api/assessments/components` | Admin/Teacher | Create assessment component | Body: `{ course_offering_id, assessment_type_id, title, max_marks, weightage, assessment_date, is_published? }` |
| PUT | `/api/assessments/components/:id` | Admin/Teacher | Update assessment component | Body: Same as create |
| DELETE | `/api/assessments/components/:id` | Admin | Delete assessment component | - |

### Question Routes (`/api/questions`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/questions` | Private | Get all questions | Query: `assessmentComponentId, courseOfferingId, difficultyLevel, questionType, includeCLOMapping` |
| GET | `/api/questions/:id` | Private | Get question by ID | Query: `includeCLOMapping, includeBloomLevel, includeAssessment` |
| GET | `/api/questions/assessment/:assessmentComponentId` | Private | Get questions by assessment | - |
| GET | `/api/questions/statistics/:assessmentComponentId` | Private | Get question statistics | - |
| POST | `/api/questions` | Admin/Teacher | Create new question | Body: `{ assessment_component_id, question_number, question_text, question_type, marks, difficulty_level?, bloom_taxonomy_level_id? }` |
| PUT | `/api/questions/:id` | Admin/Teacher | Update question | Body: Same as create |
| DELETE | `/api/questions/:id` | Admin | Delete question | - |
| POST | `/api/questions/:id/map-clo` | Admin/Teacher | Map question to CLO | Body: `{ clo_mappings: [{ course_learning_outcome_id, marks_allocated }] }` |
| GET | `/api/questions/:id/clo-mappings` | Private | Get question CLO mappings | - |

### Rubric Routes (`/api/rubrics`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/rubrics` | Private | Get all rubrics | Query: `cloId, createdBy, includeCriteria, includeLevels` |
| GET | `/api/rubrics/:id` | Private | Get rubric by ID | Query: `includeLevels, includeCLO, includeCreator` |
| GET | `/api/rubrics/clo/:cloId` | Private | Get rubrics by CLO | - |
| POST | `/api/rubrics` | Admin/Teacher | Create new rubric | Body: `{ name, description?, course_learning_outcome_id, created_by }` |
| PUT | `/api/rubrics/:id` | Admin/Teacher | Update rubric | Body: Same as create |
| DELETE | `/api/rubrics/:id` | Admin | Delete rubric | - |
| POST | `/api/rubrics/:id/criteria` | Admin/Teacher | Add criterion to rubric | Body: `{ criterion_name, description?, max_score, weight_percentage, order? }` |
| GET | `/api/rubrics/:id/criteria` | Private | Get rubric criteria | Query: `includeLevels` |
| PUT | `/api/rubrics/criteria/:criteriaId` | Admin/Teacher | Update criterion | Body: Same as add criterion |
| DELETE | `/api/rubrics/criteria/:criteriaId` | Admin | Delete criterion | - |
| POST | `/api/rubrics/criteria/:criteriaId/levels` | Admin/Teacher | Add level to criterion | Body: `{ level_name, level_score, description? }` |
| PUT | `/api/rubrics/levels/:levelId` | Admin/Teacher | Update level | Body: Same as add level |
| DELETE | `/api/rubrics/levels/:levelId` | Admin | Delete level | - |

### Marks Routes (`/api/marks`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| POST | `/api/marks/assessment` | Admin/Teacher | Enter assessment marks | Body: `{ student_id, assessment_component_id, marks_obtained?, is_absent, is_exempted, remarks? }` |
| POST | `/api/marks/question` | Admin/Teacher | Enter question marks | Body: `{ student_id, question_id, marks_obtained, feedback? }` |
| POST | `/api/marks/bulk` | Admin/Teacher | Bulk enter marks | Body: `{ type, marks: [] }` |
| GET | `/api/marks/assessment/:assessmentComponentId` | Private | Get marks by assessment | Query: `includeStudentDetails, includeStatistics, type` |
| GET | `/api/marks/student/:studentId` | Private | Get marks by student | Query: `courseOfferingId, assessmentComponentId, assessmentTypeId, type, includeDetails` |
| GET | `/api/marks/question/:questionId` | Private | Get marks by question | Query: `includeStudentDetails` |
| GET | `/api/marks/statistics/assessment/:assessmentComponentId` | Private | Get assessment statistics | - |
| GET | `/api/marks/statistics/questions/:assessmentComponentId` | Private | Get question statistics | - |
| GET | `/api/marks/student/:studentId/course-offering/:courseOfferingId/total` | Private | Get student total marks for offering | - |
| PUT | `/api/marks/assessment/:marksId` | Admin/Teacher | Update assessment marks | Body: Same as enter |
| PUT | `/api/marks/question/:marksId` | Admin/Teacher | Update question marks | Body: Same as enter |
| DELETE | `/api/marks/assessment/:marksId` | Admin | Delete assessment marks | - |
| DELETE | `/api/marks/question/:marksId` | Admin | Delete question marks | - |

### Rubric Score Routes (`/api/rubric-scores`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| POST | `/api/rubric-scores` | Admin/Teacher | Enter rubric score | Body: `{ student_id, assessment_component_id, rubric_criteria_id, rubric_level_id, score, feedback? }` |
| POST | `/api/rubric-scores/bulk` | Admin/Teacher | Bulk enter rubric scores | Body: `{ scores: [] }` |
| GET | `/api/rubric-scores/student/:studentId` | Private | Get scores by student | Query: `assessment_component_id, rubric_criteria_id` |
| GET | `/api/rubric-scores/assessment/:assessmentComponentId` | Admin/Teacher | Get scores by assessment | Query: `student_id, rubric_criteria_id` |
| GET | `/api/rubric-scores/assessment/:assessmentComponentId/summary` | Admin/Teacher | Get assessment summary | - |
| GET | `/api/rubric-scores/calculate/:studentId/:assessmentComponentId` | Private | Calculate total score | - |
| GET | `/api/rubric-scores/:scoreId` | Private | Get score by ID | - |
| DELETE | `/api/rubric-scores/:scoreId` | Admin/Teacher | Delete rubric score | - |
| DELETE | `/api/rubric-scores/student/:studentId/assessment/:assessmentComponentId` | Admin/Teacher | Delete student assessment scores | - |

---

## 7. Results & Grades

### Grade Routes (`/api/grades`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/grades/scales` | Private | Get all grade scales | Query: `page, limit, search, orderBy, order, activeOnly` |
| GET | `/api/grades/scales/:id` | Private | Get grade scale by ID | Query: `includeGradePoints` |
| POST | `/api/grades/scales` | Admin | Create grade scale | Body: `{ name, is_active? }` |
| PUT | `/api/grades/scales/:id` | Admin | Update grade scale | Body: Same as create |
| DELETE | `/api/grades/scales/:id` | Admin | Delete grade scale | - |
| PATCH | `/api/grades/scales/:id/activate` | Admin | Activate grade scale | - |
| PATCH | `/api/grades/scales/:id/deactivate` | Admin | Deactivate grade scale | - |
| GET | `/api/grades/scales/:scaleId/points` | Private | Get grade points for scale | Query: `orderBy, order` |
| POST | `/api/grades/scales/:scaleId/points` | Admin | Add grade point to scale | Body: `{ grade_letter, min_percentage, max_percentage, grade_point, description? }` |
| PUT | `/api/grades/points/:pointId` | Admin | Update grade point | Body: Same as add |
| DELETE | `/api/grades/points/:pointId` | Admin | Delete grade point | - |

### Course Result Routes (`/api/course-results`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| POST | `/api/course-results/calculate` | Admin/Teacher | Calculate single student result | Body: `{ student_id, course_offering_id }` |
| POST | `/api/course-results/calculate-all` | Admin/Teacher | Calculate all students results | Body: `{ course_offering_id }` |
| PATCH | `/api/course-results/publish/:courseOfferingId` | Admin | Publish/unpublish results | Body: `{ publish_status }` |
| GET | `/api/course-results/statistics/:courseOfferingId` | Admin/Teacher | Get course statistics | - |
| GET | `/api/course-results/student/:studentId` | Private | Get student results | Query: `published_only, semester_id` |
| GET | `/api/course-results/course-offering/:courseOfferingId` | Admin/Teacher | Get course offering results | Query: `published_only` |
| GET | `/api/course-results/:id` | Private | Get result by ID | - |
| PATCH | `/api/course-results/:id/remarks` | Admin/Teacher | Update result remarks | Body: `{ remarks }` |
| DELETE | `/api/course-results/:id` | Admin | Delete result | - |

### Semester Result Routes (`/api/semester-results`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| POST | `/api/semester-results/calculate-sgpa` | Admin/Teacher | Calculate SGPA | Body: `{ student_id, semester_id }` |
| POST | `/api/semester-results/calculate-cgpa` | Admin/Teacher | Calculate CGPA | Body: `{ student_id, semester_id }` |
| POST | `/api/semester-results/calculate` | Admin/Teacher | Calculate semester results | Body: `{ student_id, semester_id }` |
| POST | `/api/semester-results/calculate-all` | Admin | Calculate all student results | Body: `{ semester_id }` |
| PATCH | `/api/semester-results/publish/:semesterId` | Admin | Publish semester results | Body: `{ student_ids?: [] }` |
| PATCH | `/api/semester-results/unpublish/:semesterId` | Admin | Unpublish semester results | Body: `{ student_ids?: [] }` |
| GET | `/api/semester-results/semester/:semesterId/summary` | Admin/Teacher | Get semester summary | - |
| GET | `/api/semester-results/student/:studentId/semester/:semesterId` | Private | Get student semester result | - |
| GET | `/api/semester-results/student/:studentId` | Private | Get student all results | Query: `include_unpublished` |

---

## 8. Attainment & Analysis

### CLO Attainment Routes (`/api/clo-attainment`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/clo-attainment/overview` | Private | Get CLO attainment overview | - |
| POST | `/api/clo-attainment/student/calculate` | Admin/Teacher | Calculate student CLO attainment | Body: `{ student_id, course_offering_id, clo_id? }` |
| POST | `/api/clo-attainment/course/calculate` | Admin/Teacher | Calculate course CLO attainment | Body: `{ course_offering_id }` |
| GET | `/api/clo-attainment/student/:studentId/course-offering/:courseOfferingId` | Admin/Teacher/Student | Get student CLO report | - |
| GET | `/api/clo-attainment/student/:studentId` | Admin/Teacher/Student | Get student all CLO attainment | - |
| GET | `/api/clo-attainment/course/:courseOfferingId` | Admin/Teacher | Get course CLO report | Query: `clo_id, status` |
| GET | `/api/clo-attainment/course/:courseOfferingId/clo/:cloId/details` | Admin/Teacher | Get CLO details | - |
| GET | `/api/clo-attainment/course/:courseId/trends` | Admin/Teacher | Get CLO trends | Query: `limit` |
| POST | `/api/clo-attainment/compare` | Admin/Teacher | Compare course offerings | Body: `{ course_offering_ids: [] }` |
| POST | `/api/clo-attainment/recalculate-session` | Admin | Recalculate session attainment | Body: `{ academic_session_id }` |

### PLO Attainment Routes (`/api/plo-attainment`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/plo-attainment/overview` | Private | Get PLO attainment overview | - |
| POST | `/api/plo-attainment/student/calculate` | Admin/Teacher | Calculate student PLO attainment | Body: `{ student_id, degree_id, plo_id? }` |
| POST | `/api/plo-attainment/program/calculate` | Admin/Teacher | Calculate program PLO attainment | Body: `{ degree_id }` |
| GET | `/api/plo-attainment/student/:studentId/degree/:degreeId` | Admin/Teacher/Student | Get student PLO report | - |
| GET | `/api/plo-attainment/student/:studentId` | Admin/Teacher/Student | Get student all PLO attainment | - |
| GET | `/api/plo-attainment/program/:degreeId` | Admin/Teacher | Get program PLO report | Query: `plo_id, status` |
| GET | `/api/plo-attainment/program/:degreeId/plo/:ploId/details` | Admin/Teacher | Get PLO details | - |
| GET | `/api/plo-attainment/program/:degreeId/trends` | Admin/Teacher | Get PLO trends | Query: `plo_id, limit` |
| GET | `/api/plo-attainment/student/:studentId/degree/:degreeId/plo/:ploId/breakdown` | Admin/Teacher/Student | Get PLO breakdown | - |
| GET | `/api/plo-attainment/program/:degreeId/plo/:ploId/distribution` | Admin/Teacher | Get student distribution | - |
| GET | `/api/plo-attainment/program/:degreeId/stats` | Admin/Teacher | Get program statistics | - |

### Attainment Threshold Routes (`/api/attainment-thresholds`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/attainment-thresholds` | Private | Get all attainment thresholds | Query: `page, limit, search, orderBy, order, thresholdType, degreeId` |
| GET | `/api/attainment-thresholds/degree/:degreeId` | Private | Get thresholds by degree | Query: `thresholdType` |
| GET | `/api/attainment-thresholds/type/:thresholdType` | Private | Get thresholds by type | - |
| POST | `/api/attainment-thresholds/evaluate` | Private | Evaluate attainment level | Body: `{ degree_id, threshold_type, percentage }` |
| GET | `/api/attainment-thresholds/:id` | Private | Get threshold by ID | - |
| POST | `/api/attainment-thresholds` | Admin/Faculty | Create attainment threshold | Body: `{ degree_id, threshold_type, level_name, min_percentage, max_percentage, is_attained? }` |
| PUT | `/api/attainment-thresholds/:id` | Admin/Faculty | Update attainment threshold | Body: Same as create |
| DELETE | `/api/attainment-thresholds/:id` | Admin | Delete attainment threshold | - |
| DELETE | `/api/attainment-thresholds/degree/:degreeId` | Admin | Delete all thresholds for degree | - |

### Indirect Attainment Routes (`/api/indirect-attainment`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| POST | `/api/indirect-attainment/calculate` | Admin/Teacher | Calculate indirect attainment | Body: `{ survey_id, outcome_type, outcome_id? }` |
| POST | `/api/indirect-attainment/recalculate/:surveyId` | Admin/Teacher | Recalculate survey attainment | Body: `{ outcome_type }` |
| GET | `/api/indirect-attainment/survey/:surveyId` | Admin/Teacher | Get attainment by survey | Query: `outcome_type` |
| GET | `/api/indirect-attainment/outcome/:outcomeType/:outcomeId` | Admin/Teacher | Get attainment by outcome | - |
| GET | `/api/indirect-attainment/report/program/:degreeId` | Admin/Teacher | Get program indirect report | - |
| GET | `/api/indirect-attainment/summary` | Admin/Teacher | Get indirect attainment summary | Query: `degree_id, outcome_type` |

---

## 9. Action Plans & Review

### Action Plan Routes (`/api/action-plans`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/action-plans` | Admin/Faculty | Get all action plans | Query: `page, limit, search, orderBy, order, degreeId, status` |
| GET | `/api/action-plans/overdue` | Admin/Faculty | Get overdue action plans | Query: `degreeId` |
| GET | `/api/action-plans/statistics` | Admin/Faculty | Get action plan statistics | Query: `degreeId` |
| GET | `/api/action-plans/status/:status` | Admin/Faculty | Get action plans by status | Query: `degreeId, includeOutcomes` |
| GET | `/api/action-plans/:id` | Admin/Faculty | Get action plan by ID | - |
| GET | `/api/action-plans/:id/outcomes` | Admin/Faculty | Get action plan outcomes | Query: `status, orderBy, order` |
| GET | `/api/action-plans/:id/outcomes/statistics` | Admin/Faculty | Get outcome statistics | - |
| POST | `/api/action-plans` | Admin/Faculty | Create action plan | Body: `{ degree_id, plan_title, description, start_date, target_date, status?, responsible_person? }` |
| PUT | `/api/action-plans/:id` | Admin/Faculty | Update action plan | Body: Same as create |
| DELETE | `/api/action-plans/:id` | Admin | Delete action plan | - |
| POST | `/api/action-plans/:id/outcomes` | Admin/Faculty | Add outcome to action plan | Body: `{ outcome_type, outcome_id, description?, target_value?, current_value?, status? }` |
| POST | `/api/action-plans/:id/outcomes/bulk` | Admin/Faculty | Bulk add outcomes | Body: `{ outcomes: [{ outcome_type, outcome_id, description?, target_value?, current_value?, status? }] }` |
| PUT | `/api/action-plans/outcomes/:outcomeId` | Admin/Faculty | Update action plan outcome | Body: Same as add outcome |
| DELETE | `/api/action-plans/outcomes/:outcomeId` | Admin/Faculty | Delete action plan outcome | - |

### OBE Review Cycle Routes (`/api/obe-review-cycles`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/obe-review-cycles` | Private | Get all review cycles | Query: `page, limit, search, orderBy, order, degreeId, status, reviewType, withDegree` |
| GET | `/api/obe-review-cycles/status/ongoing` | Admin/Faculty | Get ongoing review cycles | - |
| GET | `/api/obe-review-cycles/date-range` | Admin/Faculty | Get review cycles by date range | Query: `start_date, end_date` |
| GET | `/api/obe-review-cycles/:id` | Private | Get review cycle by ID | Query: `withDegree` |
| POST | `/api/obe-review-cycles` | Admin | Create review cycle | Body: `{ degree_id, cycle_name, start_date, end_date, review_type, status?, summary_report? }` |
| PUT | `/api/obe-review-cycles/:id` | Admin | Update review cycle | Body: Same as create |
| PATCH | `/api/obe-review-cycles/:id/status` | Admin/Faculty | Update review cycle status | Body: `{ status }` |
| PATCH | `/api/obe-review-cycles/:id/summary-report` | Admin/Faculty | Update summary report | Body: `{ summary_report }` |
| DELETE | `/api/obe-review-cycles/:id` | Admin | Delete review cycle | - |

---

## 10. Reports & Surveys

### Report Routes (`/api/reports`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/reports/dashboard-stats` | Private | Get dashboard statistics | - |
| GET | `/api/reports/clo-attainment/:courseOfferingId` | Admin/Teacher | Generate CLO attainment report | Query: `includeStudents, includeAssessments` |
| GET | `/api/reports/plo-attainment/:degreeId` | Admin/HOD/Teacher | Generate PLO attainment report | Query: `sessionId, includeCourses, includeTrends` |
| GET | `/api/reports/course/:courseOfferingId` | Admin/Teacher | Generate course report | - |
| GET | `/api/reports/program/:degreeId` | Admin/HOD | Generate program report | Query: `sessionId` |
| POST | `/api/reports/export` | Admin/Teacher/HOD | Export report | Body: `{ reportType, reportId, format, reportData? }` |

### Survey Routes (`/api/surveys`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/surveys` | Private | Get all surveys | Query: `page, limit, type, target_audience, is_active` |
| GET | `/api/surveys/active` | Private | Get active surveys | - |
| GET | `/api/surveys/my-responses` | Private | Get my survey responses | - |
| GET | `/api/surveys/type/:type` | Private | Get surveys by type | - |
| GET | `/api/surveys/:id` | Private | Get survey by ID | Query: `includeQuestions, includeStats` |
| POST | `/api/surveys` | Admin/Faculty/Coordinator | Create new survey | Body: `{ title, description, survey_type, target_audience, start_date, end_date, is_active?, is_anonymous? }` |
| PUT | `/api/surveys/:id` | Admin/Faculty/Coordinator | Update survey | Body: Same as create |
| DELETE | `/api/surveys/:id` | Admin | Delete survey | - |
| POST | `/api/surveys/:id/responses` | Private | Submit survey response | Body: `{ responses: [{ question_id, answer }] }` |
| GET | `/api/surveys/:id/responses` | Admin/Faculty/Coordinator | Get survey responses | - |
| GET | `/api/surveys/:id/analytics` | Admin/Faculty/Coordinator | Get survey analytics | - |
| POST | `/api/surveys/:id/questions` | Admin/Faculty/Coordinator | Add question to survey | Body: `{ question_text, question_type, options?, is_required?, order? }` |

---

## 11. System & Infrastructure

### Audit Log Routes (`/api/audit-logs`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/audit-logs` | Admin | Get all audit logs | Query: `page, limit, orderBy, order, action, table_name, user_id, startDate, endDate, search` |
| GET | `/api/audit-logs/statistics` | Admin | Get audit statistics | Query: `startDate, endDate, user_id, table_name` |
| GET | `/api/audit-logs/recent` | Admin | Get recent activities | Query: `hours, limit, action, table_name, user_id` |
| GET | `/api/audit-logs/user/:userId` | Admin or own logs | Get logs by user | Query: `page, limit, orderBy, order, action, table_name, startDate, endDate` |
| GET | `/api/audit-logs/table/:tableName` | Admin | Get logs by table | Query: `page, limit, orderBy, order, action, record_id, user_id, startDate, endDate` |
| GET | `/api/audit-logs/record/:tableName/:recordId` | Admin/Teacher | Get logs by record | Query: `orderBy, order, action` |
| GET | `/api/audit-logs/:id` | Admin | Get audit log by ID | - |

### Seat Allocation Routes (`/api/seat-allocations`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/seat-allocations` | Private | Get all seat allocations | Query: `page, limit, search, orderBy, order` |
| GET | `/api/seat-allocations/available-rooms` | Private | Get available rooms | - |
| GET | `/api/seat-allocations/statistics/buildings` | Admin/Faculty | Get statistics by building | - |
| GET | `/api/seat-allocations/room/:roomId` | Private | Get allocations by room | - |
| GET | `/api/seat-allocations/room/:roomId/occupancy` | Private | Get room occupancy | - |
| GET | `/api/seat-allocations/student/:studentId` | Private | Get allocation by student | - |
| GET | `/api/seat-allocations/:id` | Private | Get seat allocation by ID | - |
| POST | `/api/seat-allocations/allocate` | Admin/Faculty | Allocate seat | Body: `{ room_id, student_id }` |
| PUT | `/api/seat-allocations/reallocate/:studentId` | Admin/Faculty | Reallocate seat | Body: `{ new_room_id }` |
| DELETE | `/api/seat-allocations/deallocate/:studentId` | Admin/Faculty | Deallocate seat | - |

### Building Routes (`/api/buildings`)

| Method | Endpoint | Access | Description | Query/Body Parameters |
|--------|----------|--------|-------------|----------------------|
| GET | `/api/buildings` | Private | Get all buildings | Query: `page, limit, search, orderBy, order, withFloors` |
| GET | `/api/buildings/:id` | Private | Get building by ID | Query: `withDetails` |
| GET | `/api/buildings/code/:code` | Private | Get building by code | - |
| GET | `/api/buildings/:id/capacity` | Private | Get building capacity | - |
| POST | `/api/buildings` | Admin | Create new building | Body: `{ name, code, address?, description? }` |
| PUT | `/api/buildings/:id` | Admin | Update building | Body: Same as create |
| DELETE | `/api/buildings/:id` | Admin | Delete building | - |
| GET | `/api/buildings/floors` | Private | Get all floors | Query: `page, limit, search, buildingId, orderBy, order` |
| GET | `/api/buildings/floors/:id` | Private | Get floor by ID | - |
| POST | `/api/buildings/:id/floors` | Admin | Create floor | Body: `{ floor_number, floor_name }` |
| PUT | `/api/buildings/floors/:id` | Admin | Update floor | Body: Same as create |
| DELETE | `/api/buildings/floors/:id` | Admin | Delete floor | - |

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

---

## Authentication

For protected routes, include the JWT token in the request header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get your token from the login endpoint and use it for all subsequent requests.

---

## Testing with Postman

### Steps to Test:

1. **Import Collection**: Create a Postman collection with all these endpoints

2. **Set Environment Variables**:
   - `base_url`: http://localhost:5000/api
   - `token`: (will be set after login)

3. **Authentication Flow**:
   - First, call POST `/api/auth/register` or `/api/auth/login`
   - Copy the token from the response
   - Set it as an environment variable or use Postman's Auth tab

4. **Common Headers**:
   - Content-Type: application/json
   - Authorization: Bearer {{token}}

5. **Test Order Recommendation**:
   - Start with authentication
   - Then test academic structure (faculties, departments, degrees)
   - Move to courses and people
   - Test assessments and marks
   - Finally test attainment and reports

---

## Notes

- All dates should be in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
- Pagination defaults: `page=1`, `limit=10`
- Role-based access: admin > teacher/faculty > student
- Some routes allow users to access only their own data
- Query parameters are optional unless specified as required

---

**Last Updated:** February 3, 2026
**API Version:** 1.0
**Documentation Version:** 1.0
