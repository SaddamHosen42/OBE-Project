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

#### Register New User
- **POST** `/api/auth/register`
- **Access:** Public
- **Body:**
```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "role": "admin|teacher|student",
  "phone": "string (optional)",
  "dob": "date (optional)",
  "nationality": "string (optional)",
  "nid_no": "string (optional)",
  "blood_group": "string (optional)"
}
```

#### Login
- **POST** `/api/auth/login`
- **Access:** Public
- **Body:**
```json
{
  "identifier": "email or username",
  "password": "string"
}
```
- **Response:**
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

#### Logout
- **POST** `/api/auth/logout`
- **Access:** Private (authenticated users)
- **Headers:** `Authorization: Bearer <token>`

#### Refresh Token
- **POST** `/api/auth/refresh`
- **Access:** Public
- **Body:**
```json
{
  "refreshToken": "string"
}
```

#### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Access:** Public
- **Body:**
```json
{
  "email": "string"
}
```

#### Reset Password
- **POST** `/api/auth/reset-password`
- **Access:** Public
- **Body:**
```json
{
  "token": "string",
  "password": "string"
}
```

#### Change Password
- **POST** `/api/auth/change-password`
- **Access:** Private
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### User Routes (`/api/users`)

#### Get All Users
- **GET** `/api/users`
- **Access:** Admin only
- **Query Params:** `page`, `limit`, `role`, `search`, `orderBy`, `order`

#### Get User Profile (Own)
- **GET** `/api/users/profile`
- **Access:** Private (any authenticated user)

#### Update Own Profile
- **PUT** `/api/users/profile`
- **Access:** Private (any authenticated user)
- **Body:**
```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "profile_image": "string (optional)",
  "dob": "date (optional)",
  "nationality": "string (optional)",
  "nid_no": "string (optional)",
  "blood_group": "string (optional)",
  "current_password": "string (optional)",
  "new_password": "string (optional)"
}
```

#### Get User by ID
- **GET** `/api/users/:id`
- **Access:** Admin only

#### Update User (Admin)
- **PUT** `/api/users/:id`
- **Access:** Admin only
- **Body:** Same as registration with optional fields

#### Delete User
- **DELETE** `/api/users/:id`
- **Access:** Admin only

---

## 2. Academic Structure

### Faculty Routes (`/api/faculties`)

#### Get All Faculties
- **GET** `/api/faculties`
- **Access:** Private (all authenticated users)
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `withDepartments`

#### Get Faculty by ID
- **GET** `/api/faculties/:id`
- **Access:** Private
- **Query Params:** `withDepartments`

#### Create Faculty
- **POST** `/api/faculties`
- **Access:** Admin only
- **Body:**
```json
{
  "name": "string",
  "short_name": "string",
  "description": "string (optional)",
  "dean_user_id": "number (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "website": "string (optional)",
  "established_date": "date (optional)"
}
```

#### Update Faculty
- **PUT** `/api/faculties/:id`
- **Access:** Admin only

#### Delete Faculty
- **DELETE** `/api/faculties/:id`
- **Access:** Admin only

### Department Routes (`/api/departments`)

#### Get All Departments
- **GET** `/api/departments`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `withDegrees`, `facultyId`

#### Get Department by ID
- **GET** `/api/departments/:id`
- **Access:** Private
- **Query Params:** `withDegrees`

#### Get Department by Code
- **GET** `/api/departments/code/:code`
- **Access:** Private

#### Count Departments by Faculty
- **GET** `/api/departments/count/by-faculty/:facultyId`
- **Access:** Private

#### Create Department
- **POST** `/api/departments`
- **Access:** Admin only
- **Body:**
```json
{
  "name": "string",
  "dept_code": "string",
  "faculty_id": "number",
  "hod_user_id": "number (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "established_date": "date (optional)"
}
```

#### Update Department
- **PUT** `/api/departments/:id`
- **Access:** Admin only

#### Delete Department
- **DELETE** `/api/departments/:id`
- **Access:** Admin only

### Degree Routes (`/api/degrees`)

#### Get All Degrees
- **GET** `/api/degrees`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `withPLOs`, `withPEOs`, `departmentId`

#### Get Degree by ID
- **GET** `/api/degrees/:id`
- **Access:** Private
- **Query Params:** `withPLOs`, `withPEOs`, `withBoth`

#### Count Degrees by Department
- **GET** `/api/degrees/count/by-department/:departmentId`
- **Access:** Private

#### Create Degree
- **POST** `/api/degrees`
- **Access:** Admin only
- **Body:**
```json
{
  "name": "string",
  "faculty_id": "number",
  "department_id": "number",
  "credit_hours": "number (optional)",
  "duration_years": "number (optional)"
}
```

#### Update Degree
- **PUT** `/api/degrees/:id`
- **Access:** Admin only

#### Delete Degree
- **DELETE** `/api/degrees/:id`
- **Access:** Admin only

### Academic Session Routes (`/api/academic-sessions`)

#### Get All Academic Sessions
- **GET** `/api/academic-sessions`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `withSemesters`

#### Get Current Active Session
- **GET** `/api/academic-sessions/active/current`
- **Access:** Private

#### Get Session by ID
- **GET** `/api/academic-sessions/:id`
- **Access:** Private
- **Query Params:** `withSemesters`, `withCourses`

#### Count Semesters in Session
- **GET** `/api/academic-sessions/:id/semesters/count`
- **Access:** Private

#### Create Academic Session
- **POST** `/api/academic-sessions`
- **Access:** Admin only
- **Body:**
```json
{
  "session_name": "string",
  "start_date": "date",
  "end_date": "date",
  "is_active": "boolean (optional)"
}
```

#### Update Academic Session
- **PUT** `/api/academic-sessions/:id`
- **Access:** Admin only

#### Set Active Session
- **PUT** `/api/academic-sessions/:id/set-active`
- **Access:** Admin only

#### Delete Academic Session
- **DELETE** `/api/academic-sessions/:id`
- **Access:** Admin only

### Semester Routes (`/api/semesters`)

#### Get All Semesters
- **GET** `/api/semesters`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `sessionId`, `includeSession`

#### Get Current Active Semester
- **GET** `/api/semesters/active/current`
- **Access:** Private
- **Query Params:** `includeSession`

#### Get Semester by ID
- **GET** `/api/semesters/:id`
- **Access:** Private
- **Query Params:** `includeSession`, `includeCourseOfferings`

#### Count Course Offerings in Semester
- **GET** `/api/semesters/:id/course-offerings/count`
- **Access:** Private

#### Create Semester
- **POST** `/api/semesters`
- **Access:** Admin only
- **Body:**
```json
{
  "academic_session_id": "number",
  "name": "string",
  "semester_number": "number",
  "start_date": "date",
  "end_date": "date",
  "is_active": "boolean (optional)"
}
```

#### Update Semester
- **PUT** `/api/semesters/:id`
- **Access:** Admin only

#### Activate Semester
- **PATCH** `/api/semesters/:id/activate`
- **Access:** Admin only

#### Delete Semester
- **DELETE** `/api/semesters/:id`
- **Access:** Admin only

---

## 3. Course Management

### Course Routes (`/api/courses`)

#### Get All Courses
- **GET** `/api/courses`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `departmentId`, `degreeId`, `level`, `semester`, `type`

#### Search Courses
- **GET** `/api/courses/search`
- **Access:** Private
- **Query Params:** `keyword`, `page`, `limit`, `orderBy`, `order`

#### Get Course by ID
- **GET** `/api/courses/:id`
- **Access:** Private
- **Query Params:** `includeAll`

#### Get Course CLOs
- **GET** `/api/courses/:id/clos`
- **Access:** Private

#### Get Courses by Department
- **GET** `/api/courses/department/:departmentId`
- **Access:** Private

#### Get Courses by Degree
- **GET** `/api/courses/degree/:degreeId`
- **Access:** Private

#### Create Course
- **POST** `/api/courses`
- **Access:** Admin only
- **Body:**
```json
{
  "course_code": "string",
  "course_title": "string",
  "credit_hours": "number",
  "department_id": "number",
  "degree_id": "number",
  "level": "number (optional)",
  "semester": "number (optional)",
  "course_type": "string (optional)",
  "prerequisite_course_ids": "array (optional)",
  "course_summary": "string (optional)"
}
```

#### Update Course
- **PUT** `/api/courses/:id`
- **Access:** Admin/Teacher

#### Delete Course
- **DELETE** `/api/courses/:id`
- **Access:** Admin only

### Course Offering Routes (`/api/course-offerings`)

#### Get All Course Offerings
- **GET** `/api/course-offerings`
- **Access:** Private
- **Query Params:** `page`, `limit`, `orderBy`, `order`, `semesterId`, `teacherId`, `courseId`, `status`

#### Get Course Progress
- **GET** `/api/course-offerings/progress`
- **Access:** Private

#### Get Course Offering by ID
- **GET** `/api/course-offerings/:id`
- **Access:** Private

#### Get Course Offering Enrollments
- **GET** `/api/course-offerings/:id/enrollments`
- **Access:** Private

#### Create Course Offering
- **POST** `/api/course-offerings`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "course_id": "number",
  "semester_id": "number",
  "section": "string (optional)",
  "max_students": "number (optional)",
  "status": "string (optional)"
}
```

#### Update Course Offering
- **PUT** `/api/course-offerings/:id`
- **Access:** Admin/Teacher

#### Delete Course Offering
- **DELETE** `/api/course-offerings/:id`
- **Access:** Admin only

#### Assign Teacher to Course Offering
- **POST** `/api/course-offerings/:id/assign-teacher`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "teacher_id": "number",
  "role": "string (optional)",
  "lessons": "number (optional)"
}
```

#### Update Teacher Assignment
- **PUT** `/api/course-offerings/teacher-assignments/:assignmentId`
- **Access:** Admin/Teacher

#### Remove Teacher Assignment
- **DELETE** `/api/course-offerings/teacher-assignments/:assignmentId`
- **Access:** Admin/Teacher

### CLO Routes (`/api/clos`)

#### Get All CLOs
- **GET** `/api/clos`
- **Access:** Private
- **Query Params:** `courseId`, `includeBloomLevel`, `includePLOMappings`, `orderBy`, `order`

#### Get CLO by ID
- **GET** `/api/clos/:id`
- **Access:** Private
- **Query Params:** `includePLOMappings`, `includeAttainment`

#### Get Course CLO Attainment Summary
- **GET** `/api/clos/course/:courseId/attainment-summary`
- **Access:** Admin/Faculty
- **Query Params:** `courseOfferingId`

#### Get CLO Attainment
- **GET** `/api/clos/:id/attainment`
- **Access:** Admin/Faculty
- **Query Params:** `academicSessionId`, `courseOfferingId`

#### Get Mapped PLOs
- **GET** `/api/clos/:id/plos`
- **Access:** Admin/Faculty

#### Create CLO
- **POST** `/api/clos`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "course_id": "number",
  "CLO_ID": "string",
  "CLO_Description": "string",
  "bloom_taxonomy_level_id": "number (optional)",
  "weight_percentage": "number (optional)",
  "target_attainment": "number (optional)"
}
```

#### Update CLO
- **PUT** `/api/clos/:id`
- **Access:** Admin/Faculty

#### Delete CLO
- **DELETE** `/api/clos/:id`
- **Access:** Admin only

#### Map CLO to PLO
- **POST** `/api/clos/:id/map-plo`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "plo_id": "number",
  "correlation_level": "High|Medium|Low (optional)"
}
```

#### Unmap CLO from PLO
- **DELETE** `/api/clos/:id/unmap-plo/:ploId`
- **Access:** Admin/Faculty

---

## 4. Program Outcomes

### PLO Routes (`/api/plos`)

#### Get All PLOs
- **GET** `/api/plos`
- **Access:** Private
- **Query Params:** `degreeId`, `includePEOMappings`, `includeCLOMappings`, `orderBy`, `order`

#### Get PLO by ID
- **GET** `/api/plos/:id`
- **Access:** Private

#### Get Degree PLO Attainment Summary
- **GET** `/api/plos/degree/:degreeId/attainment-summary`
- **Access:** Admin/Faculty
- **Query Params:** `academicSessionId`

#### Get PLO Attainment
- **GET** `/api/plos/:id/attainment`
- **Access:** Admin/Faculty
- **Query Params:** `academicSessionId`, `degreeId`

#### Get Mapped PEOs
- **GET** `/api/plos/:id/peos`
- **Access:** Admin/Faculty

#### Get Mapped CLOs
- **GET** `/api/plos/:id/clos`
- **Access:** Admin/Faculty

#### Create PLO
- **POST** `/api/plos`
- **Access:** Admin only
- **Body:**
```json
{
  "degree_id": "number",
  "PLO_ID": "string",
  "PLO_Description": "string",
  "weight_percentage": "number (optional)",
  "target_attainment": "number (optional)"
}
```

#### Update PLO
- **PUT** `/api/plos/:id`
- **Access:** Admin only

#### Delete PLO
- **DELETE** `/api/plos/:id`
- **Access:** Admin only

#### Map PLO to PEO
- **POST** `/api/plos/:id/map-peo`
- **Access:** Admin only
- **Body:**
```json
{
  "peo_id": "number",
  "correlation_level": "High|Medium|Low (optional)"
}
```

#### Unmap PLO from PEO
- **DELETE** `/api/plos/:id/unmap-peo/:peoId`
- **Access:** Admin only

### PEO Routes (`/api/peos`)

#### Get All PEOs
- **GET** `/api/peos`
- **Access:** Private
- **Query Params:** `degreeId`, `includePLOMappings`, `orderBy`, `order`

#### Get PEO by ID
- **GET** `/api/peos/:id`
- **Access:** Private

#### Get PEO Statistics by Degree
- **GET** `/api/peos/degree/:degreeId/stats`
- **Access:** Admin/Faculty

#### Get Mapped PLOs
- **GET** `/api/peos/:id/plos`
- **Access:** Admin/Faculty

#### Create PEO
- **POST** `/api/peos`
- **Access:** Admin only
- **Body:**
```json
{
  "degree_id": "number",
  "PEO_ID": "string",
  "PEO_Description": "string"
}
```

#### Update PEO
- **PUT** `/api/peos/:id`
- **Access:** Admin only

#### Delete PEO
- **DELETE** `/api/peos/:id`
- **Access:** Admin only

#### Map PEO to PLO
- **POST** `/api/peos/:id/plos`
- **Access:** Admin only
- **Body:**
```json
{
  "plo_id": "number",
  "correlation_level": "High|Medium|Low (optional)"
}
```

#### Bulk Map PLOs to PEO
- **POST** `/api/peos/:id/plos/bulk`
- **Access:** Admin only
- **Body:**
```json
{
  "mappings": [
    {
      "plo_id": "number",
      "correlation_level": "High|Medium|Low (optional)"
    }
  ]
}
```

#### Update PEO-PLO Mapping
- **PUT** `/api/peos/:id/plos/:ploId`
- **Access:** Admin only

#### Remove PLO Mapping from PEO
- **DELETE** `/api/peos/:id/plos/:ploId`
- **Access:** Admin only

### Bloom Taxonomy Routes (`/api/bloom-taxonomy`)

#### Get All Bloom Levels
- **GET** `/api/bloom-taxonomy`
- **Access:** Private
- **Query Params:** `search`, `levelNumber`, `startLevel`, `endLevel`, `orderBy`, `order`

#### Get Bloom Level by ID
- **GET** `/api/bloom-taxonomy/:id`
- **Access:** Private

#### Get Bloom Level by Name
- **GET** `/api/bloom-taxonomy/name/:name`
- **Access:** Private

#### Get Bloom Levels Count
- **GET** `/api/bloom-taxonomy/stats/count`
- **Access:** Private

---

## 5. People Management

### Student Routes (`/api/students`)

#### Get All Students
- **GET** `/api/students`
- **Access:** Admin/Teacher
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `departmentId`, `degreeId`, `academicStatus`, `batchYear`

#### Get Student by ID
- **GET** `/api/students/:id`
- **Access:** Private

#### Get Student by SID
- **GET** `/api/students/sid/:sid`
- **Access:** Private

#### Get Students by Department
- **GET** `/api/students/department/:departmentId`
- **Access:** Admin/Teacher

#### Get Students by Degree
- **GET** `/api/students/degree/:degreeId`
- **Access:** Admin/Teacher

#### Get Student Enrollments
- **GET** `/api/students/:id/enrollments`
- **Access:** Private
- **Query Params:** `status`, `academicSessionId`, `semesterId`

#### Get Student Results
- **GET** `/api/students/:id/results`
- **Access:** Private

#### Get Student Attainment Report
- **GET** `/api/students/:id/attainment`
- **Access:** Private
- **Query Params:** `courseOfferingId`, `semesterId`

#### Create Student
- **POST** `/api/students`
- **Access:** Admin only
- **Body:**
```json
{
  "user_id": "number",
  "student_id": "string",
  "faculty_id": "number",
  "department_id": "number",
  "degree_id": "number",
  "batch_year": "number",
  "section": "string (optional)",
  "academic_status": "string (optional)"
}
```

#### Update Student
- **PUT** `/api/students/:id`
- **Access:** Admin only

#### Delete Student
- **DELETE** `/api/students/:id`
- **Access:** Admin only

### Teacher Routes (`/api/teachers`)

#### Get All Teachers
- **GET** `/api/teachers`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `withDetails`, `departmentId`

#### Get Teacher by ID
- **GET** `/api/teachers/:id`
- **Access:** Private
- **Query Params:** `withDetails`

#### Get Teachers by Department
- **GET** `/api/teachers/department/:departmentId`
- **Access:** Private

#### Get Teacher Courses
- **GET** `/api/teachers/:id/courses`
- **Access:** Private

#### Create Teacher
- **POST** `/api/teachers`
- **Access:** Admin only
- **Body:**
```json
{
  "user_id": "number",
  "faculty_id": "number",
  "department_id": "number",
  "designation_id": "number",
  "employee_id": "string",
  "joining_date": "date",
  "career_obj": "string (optional)"
}
```

#### Update Teacher
- **PUT** `/api/teachers/:id`
- **Access:** Admin only

#### Delete Teacher
- **DELETE** `/api/teachers/:id`
- **Access:** Admin only

#### Assign Course to Teacher
- **POST** `/api/teachers/:id/courses`
- **Access:** Admin only
- **Body:**
```json
{
  "course_offering_id": "number",
  "role": "string (optional)",
  "lessons": "number (optional)"
}
```

#### Update Course Assignment
- **PUT** `/api/teachers/:id/courses/:assignmentId`
- **Access:** Admin only

#### Remove Course Assignment
- **DELETE** `/api/teachers/:id/courses/:assignmentId`
- **Access:** Admin only

### Enrollment Routes (`/api/enrollments`)

#### Enroll Student
- **POST** `/api/enrollments`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "course_offering_id": "number",
  "enrollment_date": "date (optional)",
  "status": "string (optional)"
}
```

#### Check Enrollment
- **GET** `/api/enrollments/check`
- **Access:** Private
- **Query Params:** `student_id`, `course_offering_id`

#### Get Enrollment Statistics
- **GET** `/api/enrollments/offering/:id/stats`
- **Access:** Admin/Teacher

#### Get Enrollments by Course Offering
- **GET** `/api/enrollments/offering/:id`
- **Access:** Admin/Teacher
- **Query Params:** `status`, `orderBy`, `order`

#### Get Enrollments by Student
- **GET** `/api/enrollments/student/:id`
- **Access:** Private
- **Query Params:** `status`, `orderBy`, `order`

#### Get Enrollment by ID
- **GET** `/api/enrollments/:id`
- **Access:** Private

#### Drop Enrollment
- **PUT** `/api/enrollments/:id/drop`
- **Access:** Admin/Teacher

#### Update Enrollment Status
- **PUT** `/api/enrollments/:id/status`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "status": "string"
}
```

#### Delete Enrollment
- **DELETE** `/api/enrollments/:id`
- **Access:** Admin only

---

## 6. Assessment

### Assessment Routes (`/api/assessments`)

#### Get Assessment Types
- **GET** `/api/assessments/types`
- **Access:** Private
- **Query Params:** `category`, `groupByCategory`

#### Get Assessment Type by ID
- **GET** `/api/assessments/types/:id`
- **Access:** Private

#### Create Assessment Type
- **POST** `/api/assessments/types`
- **Access:** Admin only
- **Body:**
```json
{
  "type_name": "string",
  "category": "Continuous|Terminal",
  "description": "string (optional)"
}
```

#### Update Assessment Type
- **PUT** `/api/assessments/types/:id`
- **Access:** Admin only

#### Delete Assessment Type
- **DELETE** `/api/assessments/types/:id`
- **Access:** Admin only

#### Get Assessment Components
- **GET** `/api/assessments/components`
- **Access:** Private
- **Query Params:** `courseOfferingId`, `courseId`, `semesterId`, `published`

#### Get Assessment Component by ID
- **GET** `/api/assessments/components/:id`
- **Access:** Private

#### Create Assessment Component
- **POST** `/api/assessments/components`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "course_offering_id": "number",
  "assessment_type_id": "number",
  "title": "string",
  "max_marks": "number",
  "weightage": "number",
  "assessment_date": "date",
  "is_published": "boolean (optional)"
}
```

#### Update Assessment Component
- **PUT** `/api/assessments/components/:id`
- **Access:** Admin/Teacher

#### Delete Assessment Component
- **DELETE** `/api/assessments/components/:id`
- **Access:** Admin only

### Question Routes (`/api/questions`)

#### Get All Questions
- **GET** `/api/questions`
- **Access:** Private
- **Query Params:** `assessmentComponentId`, `courseOfferingId`, `difficultyLevel`, `questionType`, `includeCLOMapping`

#### Get Question by ID
- **GET** `/api/questions/:id`
- **Access:** Private
- **Query Params:** `includeCLOMapping`, `includeBloomLevel`, `includeAssessment`

#### Get Questions by Assessment
- **GET** `/api/questions/assessment/:assessmentComponentId`
- **Access:** Private

#### Get Question Statistics
- **GET** `/api/questions/statistics/:assessmentComponentId`
- **Access:** Private

#### Create Question
- **POST** `/api/questions`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "assessment_component_id": "number",
  "question_number": "string",
  "question_text": "string",
  "question_type": "string",
  "marks": "number",
  "difficulty_level": "string (optional)",
  "bloom_taxonomy_level_id": "number (optional)"
}
```

#### Update Question
- **PUT** `/api/questions/:id`
- **Access:** Admin/Teacher

#### Delete Question
- **DELETE** `/api/questions/:id`
- **Access:** Admin only

#### Map Question to CLO
- **POST** `/api/questions/:id/map-clo`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "clo_mappings": [
    {
      "course_learning_outcome_id": "number",
      "marks_allocated": "number"
    }
  ]
}
```

#### Get Question CLO Mappings
- **GET** `/api/questions/:id/clo-mappings`
- **Access:** Private

### Rubric Routes (`/api/rubrics`)

#### Get All Rubrics
- **GET** `/api/rubrics`
- **Access:** Private
- **Query Params:** `cloId`, `createdBy`, `includeCriteria`, `includeLevels`

#### Get Rubric by ID
- **GET** `/api/rubrics/:id`
- **Access:** Private
- **Query Params:** `includeLevels`, `includeCLO`, `includeCreator`

#### Get Rubrics by CLO
- **GET** `/api/rubrics/clo/:cloId`
- **Access:** Private

#### Create Rubric
- **POST** `/api/rubrics`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "course_learning_outcome_id": "number",
  "created_by": "number"
}
```

#### Update Rubric
- **PUT** `/api/rubrics/:id`
- **Access:** Admin/Teacher

#### Delete Rubric
- **DELETE** `/api/rubrics/:id`
- **Access:** Admin only

#### Add Criterion to Rubric
- **POST** `/api/rubrics/:id/criteria`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "criterion_name": "string",
  "description": "string (optional)",
  "max_score": "number",
  "weight_percentage": "number",
  "order": "number (optional)"
}
```

#### Get Rubric Criteria
- **GET** `/api/rubrics/:id/criteria`
- **Access:** Private
- **Query Params:** `includeLevels`

#### Update Criterion
- **PUT** `/api/rubrics/criteria/:criteriaId`
- **Access:** Admin/Teacher

#### Delete Criterion
- **DELETE** `/api/rubrics/criteria/:criteriaId`
- **Access:** Admin only

#### Add Level to Criterion
- **POST** `/api/rubrics/criteria/:criteriaId/levels`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "level_name": "string",
  "level_score": "number",
  "description": "string (optional)"
}
```

#### Update Level
- **PUT** `/api/rubrics/levels/:levelId`
- **Access:** Admin/Teacher

#### Delete Level
- **DELETE** `/api/rubrics/levels/:levelId`
- **Access:** Admin only

### Marks Routes (`/api/marks`)

#### Enter Assessment Marks
- **POST** `/api/marks/assessment`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "assessment_component_id": "number",
  "marks_obtained": "number (nullable)",
  "is_absent": "boolean",
  "is_exempted": "boolean",
  "remarks": "string (optional)"
}
```

#### Enter Question Marks
- **POST** `/api/marks/question`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "question_id": "number",
  "marks_obtained": "number",
  "feedback": "string (optional)"
}
```

#### Bulk Enter Marks
- **POST** `/api/marks/bulk`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "type": "assessment|question",
  "marks": []
}
```

#### Get Marks by Assessment
- **GET** `/api/marks/assessment/:assessmentComponentId`
- **Access:** Private
- **Query Params:** `includeStudentDetails`, `includeStatistics`, `type`

#### Get Marks by Student
- **GET** `/api/marks/student/:studentId`
- **Access:** Private
- **Query Params:** `courseOfferingId`, `assessmentComponentId`, `assessmentTypeId`, `type`, `includeDetails`

#### Get Marks by Question
- **GET** `/api/marks/question/:questionId`
- **Access:** Private
- **Query Params:** `includeStudentDetails`

#### Get Assessment Statistics
- **GET** `/api/marks/statistics/assessment/:assessmentComponentId`
- **Access:** Private

#### Get Question Statistics
- **GET** `/api/marks/statistics/questions/:assessmentComponentId`
- **Access:** Private

#### Get Student Total Marks for Course Offering
- **GET** `/api/marks/student/:studentId/course-offering/:courseOfferingId/total`
- **Access:** Private

#### Update Assessment Marks
- **PUT** `/api/marks/assessment/:marksId`
- **Access:** Admin/Teacher

#### Update Question Marks
- **PUT** `/api/marks/question/:marksId`
- **Access:** Admin/Teacher

#### Delete Assessment Marks
- **DELETE** `/api/marks/assessment/:marksId`
- **Access:** Admin only

#### Delete Question Marks
- **DELETE** `/api/marks/question/:marksId`
- **Access:** Admin only

### Rubric Score Routes (`/api/rubric-scores`)

#### Enter Rubric Score
- **POST** `/api/rubric-scores`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "assessment_component_id": "number",
  "rubric_criteria_id": "number",
  "rubric_level_id": "number",
  "score": "number",
  "feedback": "string (optional)"
}
```

#### Bulk Enter Rubric Scores
- **POST** `/api/rubric-scores/bulk`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "scores": []
}
```

#### Get Scores by Student
- **GET** `/api/rubric-scores/student/:studentId`
- **Access:** Private
- **Query Params:** `assessment_component_id`, `rubric_criteria_id`

#### Get Scores by Assessment
- **GET** `/api/rubric-scores/assessment/:assessmentComponentId`
- **Access:** Admin/Teacher
- **Query Params:** `student_id`, `rubric_criteria_id`

#### Get Assessment Summary
- **GET** `/api/rubric-scores/assessment/:assessmentComponentId/summary`
- **Access:** Admin/Teacher

#### Calculate Total Score
- **GET** `/api/rubric-scores/calculate/:studentId/:assessmentComponentId`
- **Access:** Private

#### Get Score by ID
- **GET** `/api/rubric-scores/:scoreId`
- **Access:** Private

#### Delete Rubric Score
- **DELETE** `/api/rubric-scores/:scoreId`
- **Access:** Admin/Teacher

#### Delete Student Assessment Scores
- **DELETE** `/api/rubric-scores/student/:studentId/assessment/:assessmentComponentId`
- **Access:** Admin/Teacher

---

## 7. Results & Grades

### Grade Routes (`/api/grades`)

#### Get All Grade Scales
- **GET** `/api/grades/scales`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `activeOnly`

#### Get Grade Scale by ID
- **GET** `/api/grades/scales/:id`
- **Access:** Private
- **Query Params:** `includeGradePoints`

#### Create Grade Scale
- **POST** `/api/grades/scales`
- **Access:** Admin only
- **Body:**
```json
{
  "name": "string",
  "is_active": "boolean (optional)"
}
```

#### Update Grade Scale
- **PUT** `/api/grades/scales/:id`
- **Access:** Admin only

#### Delete Grade Scale
- **DELETE** `/api/grades/scales/:id`
- **Access:** Admin only

#### Activate Grade Scale
- **PATCH** `/api/grades/scales/:id/activate`
- **Access:** Admin only

#### Deactivate Grade Scale
- **PATCH** `/api/grades/scales/:id/deactivate`
- **Access:** Admin only

#### Get Grade Points for Scale
- **GET** `/api/grades/scales/:scaleId/points`
- **Access:** Private
- **Query Params:** `orderBy`, `order`

#### Add Grade Point to Scale
- **POST** `/api/grades/scales/:scaleId/points`
- **Access:** Admin only
- **Body:**
```json
{
  "grade_letter": "string",
  "min_percentage": "number",
  "max_percentage": "number",
  "grade_point": "number",
  "description": "string (optional)"
}
```

#### Update Grade Point
- **PUT** `/api/grades/points/:pointId`
- **Access:** Admin only

#### Delete Grade Point
- **DELETE** `/api/grades/points/:pointId`
- **Access:** Admin only

### Course Result Routes (`/api/course-results`)

#### Calculate Single Student Result
- **POST** `/api/course-results/calculate`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "course_offering_id": "number"
}
```

#### Calculate All Students Results
- **POST** `/api/course-results/calculate-all`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "course_offering_id": "number"
}
```

#### Publish/Unpublish Results
- **PATCH** `/api/course-results/publish/:courseOfferingId`
- **Access:** Admin only
- **Body:**
```json
{
  "publish_status": "boolean"
}
```

#### Get Course Statistics
- **GET** `/api/course-results/statistics/:courseOfferingId`
- **Access:** Admin/Teacher

#### Get Student Results
- **GET** `/api/course-results/student/:studentId`
- **Access:** Private
- **Query Params:** `published_only`, `semester_id`

#### Get Course Offering Results
- **GET** `/api/course-results/course-offering/:courseOfferingId`
- **Access:** Admin/Teacher
- **Query Params:** `published_only`

#### Get Result by ID
- **GET** `/api/course-results/:id`
- **Access:** Private

#### Update Result Remarks
- **PATCH** `/api/course-results/:id/remarks`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "remarks": "string"
}
```

#### Delete Result
- **DELETE** `/api/course-results/:id`
- **Access:** Admin only

### Semester Result Routes (`/api/semester-results`)

#### Calculate SGPA
- **POST** `/api/semester-results/calculate-sgpa`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "semester_id": "number"
}
```

#### Calculate CGPA
- **POST** `/api/semester-results/calculate-cgpa`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "semester_id": "number"
}
```

#### Calculate Semester Results
- **POST** `/api/semester-results/calculate`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "semester_id": "number"
}
```

#### Calculate All Student Results
- **POST** `/api/semester-results/calculate-all`
- **Access:** Admin only
- **Body:**
```json
{
  "semester_id": "number"
}
```

#### Publish Semester Results
- **PATCH** `/api/semester-results/publish/:semesterId`
- **Access:** Admin only
- **Body:**
```json
{
  "student_ids": ["number (optional)"]
}
```

#### Unpublish Semester Results
- **PATCH** `/api/semester-results/unpublish/:semesterId`
- **Access:** Admin only
- **Body:**
```json
{
  "student_ids": ["number (optional)"]
}
```

#### Get Semester Summary
- **GET** `/api/semester-results/semester/:semesterId/summary`
- **Access:** Admin/Teacher

#### Get Student Semester Result
- **GET** `/api/semester-results/student/:studentId/semester/:semesterId`
- **Access:** Private

#### Get Student All Results
- **GET** `/api/semester-results/student/:studentId`
- **Access:** Private
- **Query Params:** `include_unpublished`

---

## 8. Attainment & Analysis

### CLO Attainment Routes (`/api/clo-attainment`)

#### Get CLO Attainment Overview
- **GET** `/api/clo-attainment/overview`
- **Access:** Private

#### Calculate Student CLO Attainment
- **POST** `/api/clo-attainment/student/calculate`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "course_offering_id": "number",
  "clo_id": "number (optional)"
}
```

#### Calculate Course CLO Attainment
- **POST** `/api/clo-attainment/course/calculate`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "course_offering_id": "number"
}
```

#### Get Student CLO Report
- **GET** `/api/clo-attainment/student/:studentId/course-offering/:courseOfferingId`
- **Access:** Admin/Teacher/Student

#### Get Student All CLO Attainment
- **GET** `/api/clo-attainment/student/:studentId`
- **Access:** Admin/Teacher/Student

#### Get Course CLO Report
- **GET** `/api/clo-attainment/course/:courseOfferingId`
- **Access:** Admin/Teacher
- **Query Params:** `clo_id`, `status`

#### Get CLO Details
- **GET** `/api/clo-attainment/course/:courseOfferingId/clo/:cloId/details`
- **Access:** Admin/Teacher

#### Get CLO Trends
- **GET** `/api/clo-attainment/course/:courseId/trends`
- **Access:** Admin/Teacher
- **Query Params:** `limit`

#### Compare Course Offerings
- **POST** `/api/clo-attainment/compare`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "course_offering_ids": ["number"]
}
```

#### Recalculate Session Attainment
- **POST** `/api/clo-attainment/recalculate-session`
- **Access:** Admin only
- **Body:**
```json
{
  "academic_session_id": "number"
}
```

### PLO Attainment Routes (`/api/plo-attainment`)

#### Get PLO Attainment Overview
- **GET** `/api/plo-attainment/overview`
- **Access:** Private

#### Calculate Student PLO Attainment
- **POST** `/api/plo-attainment/student/calculate`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "student_id": "number",
  "degree_id": "number",
  "plo_id": "number (optional)"
}
```

#### Calculate Program PLO Attainment
- **POST** `/api/plo-attainment/program/calculate`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "degree_id": "number"
}
```

#### Get Student PLO Report
- **GET** `/api/plo-attainment/student/:studentId/degree/:degreeId`
- **Access:** Admin/Teacher/Student

#### Get Student All PLO Attainment
- **GET** `/api/plo-attainment/student/:studentId`
- **Access:** Admin/Teacher/Student

#### Get Program PLO Report
- **GET** `/api/plo-attainment/program/:degreeId`
- **Access:** Admin/Teacher
- **Query Params:** `plo_id`, `status`

#### Get PLO Details
- **GET** `/api/plo-attainment/program/:degreeId/plo/:ploId/details`
- **Access:** Admin/Teacher

#### Get PLO Trends
- **GET** `/api/plo-attainment/program/:degreeId/trends`
- **Access:** Admin/Teacher
- **Query Params:** `plo_id`, `limit`

#### Get PLO Breakdown
- **GET** `/api/plo-attainment/student/:studentId/degree/:degreeId/plo/:ploId/breakdown`
- **Access:** Admin/Teacher/Student

#### Get Student Distribution
- **GET** `/api/plo-attainment/program/:degreeId/plo/:ploId/distribution`
- **Access:** Admin/Teacher

#### Get Program Statistics
- **GET** `/api/plo-attainment/program/:degreeId/stats`
- **Access:** Admin/Teacher

### Attainment Threshold Routes (`/api/attainment-thresholds`)

#### Get All Attainment Thresholds
- **GET** `/api/attainment-thresholds`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `thresholdType`, `degreeId`

#### Get Thresholds by Degree
- **GET** `/api/attainment-thresholds/degree/:degreeId`
- **Access:** Private
- **Query Params:** `thresholdType`

#### Get Thresholds by Type
- **GET** `/api/attainment-thresholds/type/:thresholdType`
- **Access:** Private

#### Evaluate Attainment Level
- **POST** `/api/attainment-thresholds/evaluate`
- **Access:** Private
- **Body:**
```json
{
  "degree_id": "number",
  "threshold_type": "CLO|PLO|PEO",
  "percentage": "number"
}
```

#### Get Threshold by ID
- **GET** `/api/attainment-thresholds/:id`
- **Access:** Private

#### Create Attainment Threshold
- **POST** `/api/attainment-thresholds`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "degree_id": "number",
  "threshold_type": "CLO|PLO|PEO",
  "level_name": "string",
  "min_percentage": "number",
  "max_percentage": "number",
  "is_attained": "boolean (optional)"
}
```

#### Update Attainment Threshold
- **PUT** `/api/attainment-thresholds/:id`
- **Access:** Admin/Faculty

#### Delete Attainment Threshold
- **DELETE** `/api/attainment-thresholds/:id`
- **Access:** Admin only

#### Delete All Thresholds for Degree
- **DELETE** `/api/attainment-thresholds/degree/:degreeId`
- **Access:** Admin only

### Indirect Attainment Routes (`/api/indirect-attainment`)

#### Calculate Indirect Attainment
- **POST** `/api/indirect-attainment/calculate`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "survey_id": "number",
  "outcome_type": "PLO|CLO",
  "outcome_id": "number (optional)"
}
```

#### Recalculate Survey Attainment
- **POST** `/api/indirect-attainment/recalculate/:surveyId`
- **Access:** Admin/Teacher
- **Body:**
```json
{
  "outcome_type": "PLO|CLO"
}
```

#### Get Attainment by Survey
- **GET** `/api/indirect-attainment/survey/:surveyId`
- **Access:** Admin/Teacher
- **Query Params:** `outcome_type`

#### Get Attainment by Outcome
- **GET** `/api/indirect-attainment/outcome/:outcomeType/:outcomeId`
- **Access:** Admin/Teacher

#### Get Program Indirect Attainment Report
- **GET** `/api/indirect-attainment/report/program/:degreeId`
- **Access:** Admin/Teacher

#### Get Indirect Attainment Summary
- **GET** `/api/indirect-attainment/summary`
- **Access:** Admin/Teacher
- **Query Params:** `degree_id`, `outcome_type`

---

## 9. Action Plans & Review

### Action Plan Routes (`/api/action-plans`)

#### Get All Action Plans
- **GET** `/api/action-plans`
- **Access:** Admin/Faculty
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `degreeId`, `status`

#### Get Overdue Action Plans
- **GET** `/api/action-plans/overdue`
- **Access:** Admin/Faculty
- **Query Params:** `degreeId`

#### Get Action Plan Statistics
- **GET** `/api/action-plans/statistics`
- **Access:** Admin/Faculty
- **Query Params:** `degreeId`

#### Get Action Plans by Status
- **GET** `/api/action-plans/status/:status`
- **Access:** Admin/Faculty
- **Query Params:** `degreeId`, `includeOutcomes`

#### Get Action Plan by ID
- **GET** `/api/action-plans/:id`
- **Access:** Admin/Faculty

#### Get Action Plan Outcomes
- **GET** `/api/action-plans/:id/outcomes`
- **Access:** Admin/Faculty
- **Query Params:** `status`, `orderBy`, `order`

#### Get Outcome Statistics
- **GET** `/api/action-plans/:id/outcomes/statistics`
- **Access:** Admin/Faculty

#### Create Action Plan
- **POST** `/api/action-plans`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "degree_id": "number",
  "plan_title": "string",
  "description": "string",
  "start_date": "date",
  "target_date": "date",
  "status": "string (optional)",
  "responsible_person": "number (optional)"
}
```

#### Update Action Plan
- **PUT** `/api/action-plans/:id`
- **Access:** Admin/Faculty

#### Delete Action Plan
- **DELETE** `/api/action-plans/:id`
- **Access:** Admin only

#### Add Outcome to Action Plan
- **POST** `/api/action-plans/:id/outcomes`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "outcome_type": "string",
  "outcome_id": "number",
  "description": "string (optional)",
  "target_value": "number (optional)",
  "current_value": "number (optional)",
  "status": "string (optional)"
}
```

#### Bulk Add Outcomes
- **POST** `/api/action-plans/:id/outcomes/bulk`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "outcomes": [
    {
      "outcome_type": "string",
      "outcome_id": "number",
      "description": "string (optional)",
      "target_value": "number (optional)",
      "current_value": "number (optional)",
      "status": "string (optional)"
    }
  ]
}
```

#### Update Action Plan Outcome
- **PUT** `/api/action-plans/outcomes/:outcomeId`
- **Access:** Admin/Faculty

#### Delete Action Plan Outcome
- **DELETE** `/api/action-plans/outcomes/:outcomeId`
- **Access:** Admin/Faculty

### OBE Review Cycle Routes (`/api/obe-review-cycles`)

#### Get All Review Cycles
- **GET** `/api/obe-review-cycles`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `degreeId`, `status`, `reviewType`, `withDegree`

#### Get Ongoing Review Cycles
- **GET** `/api/obe-review-cycles/status/ongoing`
- **Access:** Admin/Faculty

#### Get Review Cycles by Date Range
- **GET** `/api/obe-review-cycles/date-range`
- **Access:** Admin/Faculty
- **Query Params:** `start_date`, `end_date`

#### Get Review Cycle by ID
- **GET** `/api/obe-review-cycles/:id`
- **Access:** Private
- **Query Params:** `withDegree`

#### Create Review Cycle
- **POST** `/api/obe-review-cycles`
- **Access:** Admin only
- **Body:**
```json
{
  "degree_id": "number",
  "cycle_name": "string",
  "start_date": "date",
  "end_date": "date",
  "review_type": "string",
  "status": "string (optional)",
  "summary_report": "string (optional)"
}
```

#### Update Review Cycle
- **PUT** `/api/obe-review-cycles/:id`
- **Access:** Admin only

#### Update Review Cycle Status
- **PATCH** `/api/obe-review-cycles/:id/status`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "status": "string"
}
```

#### Update Summary Report
- **PATCH** `/api/obe-review-cycles/:id/summary-report`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "summary_report": "string"
}
```

#### Delete Review Cycle
- **DELETE** `/api/obe-review-cycles/:id`
- **Access:** Admin only

---

## 10. Reports & Surveys

### Report Routes (`/api/reports`)

#### Get Dashboard Statistics
- **GET** `/api/reports/dashboard-stats`
- **Access:** Private

#### Generate CLO Attainment Report
- **GET** `/api/reports/clo-attainment/:courseOfferingId`
- **Access:** Admin/Teacher
- **Query Params:** `includeStudents`, `includeAssessments`

#### Generate PLO Attainment Report
- **GET** `/api/reports/plo-attainment/:degreeId`
- **Access:** Admin/HOD/Teacher
- **Query Params:** `sessionId`, `includeCourses`, `includeTrends`

#### Generate Course Report
- **GET** `/api/reports/course/:courseOfferingId`
- **Access:** Admin/Teacher

#### Generate Program Report
- **GET** `/api/reports/program/:degreeId`
- **Access:** Admin/HOD
- **Query Params:** `sessionId`

#### Export Report
- **POST** `/api/reports/export`
- **Access:** Admin/Teacher/HOD
- **Body:**
```json
{
  "reportType": "clo|plo|course|program",
  "reportId": "number",
  "format": "pdf|excel|csv|json",
  "reportData": "object (optional)"
}
```

### Survey Routes (`/api/surveys`)

#### Get All Surveys
- **GET** `/api/surveys`
- **Access:** Private
- **Query Params:** `page`, `limit`, `type`, `target_audience`, `is_active`

#### Get Active Surveys
- **GET** `/api/surveys/active`
- **Access:** Private

#### Get My Survey Responses
- **GET** `/api/surveys/my-responses`
- **Access:** Private

#### Get Surveys by Type
- **GET** `/api/surveys/type/:type`
- **Access:** Private

#### Get Survey by ID
- **GET** `/api/surveys/:id`
- **Access:** Private
- **Query Params:** `includeQuestions`, `includeStats`

#### Create Survey
- **POST** `/api/surveys`
- **Access:** Admin/Faculty/Coordinator
- **Body:**
```json
{
  "title": "string",
  "description": "string",
  "survey_type": "string",
  "target_audience": "string",
  "start_date": "date",
  "end_date": "date",
  "is_active": "boolean (optional)",
  "is_anonymous": "boolean (optional)"
}
```

#### Update Survey
- **PUT** `/api/surveys/:id`
- **Access:** Admin/Faculty/Coordinator

#### Delete Survey
- **DELETE** `/api/surveys/:id`
- **Access:** Admin only

#### Submit Survey Response
- **POST** `/api/surveys/:id/responses`
- **Access:** Private
- **Body:**
```json
{
  "responses": [
    {
      "question_id": "number",
      "answer": "string|number"
    }
  ]
}
```

#### Get Survey Responses
- **GET** `/api/surveys/:id/responses`
- **Access:** Admin/Faculty/Coordinator

#### Get Survey Analytics
- **GET** `/api/surveys/:id/analytics`
- **Access:** Admin/Faculty/Coordinator

#### Add Question to Survey
- **POST** `/api/surveys/:id/questions`
- **Access:** Admin/Faculty/Coordinator
- **Body:**
```json
{
  "question_text": "string",
  "question_type": "string",
  "options": "array (optional)",
  "is_required": "boolean (optional)",
  "order": "number (optional)"
}
```

---

## 11. System & Infrastructure

### Audit Log Routes (`/api/audit-logs`)

#### Get All Audit Logs
- **GET** `/api/audit-logs`
- **Access:** Admin only
- **Query Params:** `page`, `limit`, `orderBy`, `order`, `action`, `table_name`, `user_id`, `startDate`, `endDate`, `search`

#### Get Audit Statistics
- **GET** `/api/audit-logs/statistics`
- **Access:** Admin only
- **Query Params:** `startDate`, `endDate`, `user_id`, `table_name`

#### Get Recent Activities
- **GET** `/api/audit-logs/recent`
- **Access:** Admin only
- **Query Params:** `hours`, `limit`, `action`, `table_name`, `user_id`

#### Get Logs by User
- **GET** `/api/audit-logs/user/:userId`
- **Access:** Admin or own logs
- **Query Params:** `page`, `limit`, `orderBy`, `order`, `action`, `table_name`, `startDate`, `endDate`

#### Get Logs by Table
- **GET** `/api/audit-logs/table/:tableName`
- **Access:** Admin only
- **Query Params:** `page`, `limit`, `orderBy`, `order`, `action`, `record_id`, `user_id`, `startDate`, `endDate`

#### Get Logs by Record
- **GET** `/api/audit-logs/record/:tableName/:recordId`
- **Access:** Admin/Teacher
- **Query Params:** `orderBy`, `order`, `action`

#### Get Audit Log by ID
- **GET** `/api/audit-logs/:id`
- **Access:** Admin only

### Seat Allocation Routes (`/api/seat-allocations`)

#### Get All Seat Allocations
- **GET** `/api/seat-allocations`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`

#### Get Available Rooms
- **GET** `/api/seat-allocations/available-rooms`
- **Access:** Private

#### Get Statistics by Building
- **GET** `/api/seat-allocations/statistics/buildings`
- **Access:** Admin/Faculty

#### Get Allocations by Room
- **GET** `/api/seat-allocations/room/:roomId`
- **Access:** Private

#### Get Room Occupancy
- **GET** `/api/seat-allocations/room/:roomId/occupancy`
- **Access:** Private

#### Get Allocation by Student
- **GET** `/api/seat-allocations/student/:studentId`
- **Access:** Private

#### Get Seat Allocation by ID
- **GET** `/api/seat-allocations/:id`
- **Access:** Private

#### Allocate Seat
- **POST** `/api/seat-allocations/allocate`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "room_id": "number",
  "student_id": "number"
}
```

#### Reallocate Seat
- **PUT** `/api/seat-allocations/reallocate/:studentId`
- **Access:** Admin/Faculty
- **Body:**
```json
{
  "new_room_id": "number"
}
```

#### Deallocate Seat
- **DELETE** `/api/seat-allocations/deallocate/:studentId`
- **Access:** Admin/Faculty

### Building Routes (`/api/buildings`)

#### Get All Buildings
- **GET** `/api/buildings`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `orderBy`, `order`, `withFloors`

#### Get Building by ID
- **GET** `/api/buildings/:id`
- **Access:** Private
- **Query Params:** `withDetails`

#### Get Building by Code
- **GET** `/api/buildings/code/:code`
- **Access:** Private

#### Get Building Capacity
- **GET** `/api/buildings/:id/capacity`
- **Access:** Private

#### Create Building
- **POST** `/api/buildings`
- **Access:** Admin only
- **Body:**
```json
{
  "name": "string",
  "code": "string",
  "address": "string (optional)",
  "description": "string (optional)"
}
```

#### Update Building
- **PUT** `/api/buildings/:id`
- **Access:** Admin only

#### Delete Building
- **DELETE** `/api/buildings/:id`
- **Access:** Admin only

#### Get All Floors
- **GET** `/api/buildings/floors`
- **Access:** Private
- **Query Params:** `page`, `limit`, `search`, `buildingId`, `orderBy`, `order`

#### Get Floor by ID
- **GET** `/api/buildings/floors/:id`
- **Access:** Private

#### Create Floor
- **POST** `/api/buildings/:id/floors`
- **Access:** Admin only
- **Body:**
```json
{
  "floor_number": "number",
  "floor_name": "string"
}
```

#### Update Floor
- **PUT** `/api/buildings/floors/:id`
- **Access:** Admin only

#### Delete Floor
- **DELETE** `/api/buildings/floors/:id`
- **Access:** Admin only

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
