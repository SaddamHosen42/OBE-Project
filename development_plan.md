# OBE Desktop Software Development Plan

## 📋 Project Overview

**Technology Stack:**
- **Backend:** Node.js with Express.js (MVC Pattern), MySQL with mysql2
- **Frontend:** Electron.js, React.js, Tailwind CSS
- **Database:** MySQL

**Project Structure:**
```
obe-system/
├── backend/                 # Node.js Express API (MVC)
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   └── app.js
├── frontend/                # Electron + React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   ├── electron/
│   └── package.json
└── database/
    └── migrations/
```

---

## 🚀 Phase 1: Project Setup & Infrastructure ✅

### Step 1.1: Initialize Project Root ✅
- [x] Create main project folder `obe-system`
- [x] Initialize git repository
- [x] Create `.gitignore` file

### Step 1.2: Backend Folder Structure ✅
- [x] Create `backend` folder
- [x] Run `npm init -y` in backend folder
- [x] Create folder structure: `config`, `controllers`, `models`, `routes`, `middlewares`, `services`, `utils`

### Step 1.3: Install Backend Dependencies ✅
- [x] Install express: `npm install express`
- [x] Install mysql2: `npm install mysql2`
- [x] Install cors: `npm install cors`
- [x] Install dotenv: `npm install dotenv`
- [x] Install bcryptjs: `npm install bcryptjs`
- [x] Install jsonwebtoken: `npm install jsonwebtoken`
- [x] Install express-validator: `npm install express-validator`
- [x] Install nodemon (dev): `npm install -D nodemon`

### Step 1.4: Frontend Folder Structure ✅
- [x] Create `frontend` folder
- [x] Initialize React with Vite: `npm create vite@latest . -- --template react`
- [x] Install Electron: `npm install electron electron-builder --save-dev`
- [x] Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [x] Initialize Tailwind: `npx tailwindcss init -p`

### Step 1.5: Install Frontend Dependencies ✅
- [x] Install React Router: `npm install react-router-dom`
- [x] Install Axios: `npm install axios`
- [x] Install React Query: `npm install @tanstack/react-query`
- [x] Install React Hook Form: `npm install react-hook-form`
- [x] Install Zustand (state management): `npm install zustand`
- [x] Install React Icons: `npm install react-icons`
- [x] Install Chart.js: `npm install chart.js react-chartjs-2`

### Step 1.6: Database Setup
- [ x] Create MySQL database named `obe_system`
- [ x] Create `database/migrations` folder
- [x ] Create migration files for all tables

---

## 🗄️ Phase 2: Database Implementation

### Step 2.1: Core User Tables
- [x] Create migration for `users` table
- [x] Create migration for `sessions` table
- [x] Create migration for `password_reset_tokens` table
- [x] Run migrations and test

### Step 2.2: Personal Information Tables
- [x ] Create migration for `addresses` table
- [x ] Create migration for `genders` table
- [x ] Run migrations and test

### Step 2.3: Academic Structure Tables
- [ x] Create migration for `faculties` table
- [ x] Create migration for `departments` table
- [ x] Create migration for `degrees` table
- [ x] Create migration for `academic_sessions` table
- [ x] Create migration for `semesters` table
- [x] Run migrations and test

### Step 2.4: Course Tables ✅
- [x] Create migration for `courses` table
- [x] Create migration for `course_offerings` table
- [x] Create migration for `course_enrollments` table
- [x] Create migration for `course_objectives` table
- [x] Create migration for `course_learning_outcomes` table
- [x] Create migration for `course_contents` table
- [x] Create migration for `weekly_lesson_plans` table
- [x] Run migrations and test

### Step 2.5: OBE Framework Tables
- [x ] Create migration for `bloom_taxonomy_levels` table
- [x ] Create migration for `program_educational_objectives` table
- [ x] Create migration for `program_learning_outcomes` table
- [x ] Create migration for `peo_plo_mapping` table
- [x ] Create migration for `course_learning_outcome_program_learning_outcome` table
- [x ] Create migration for `clo_co_mapping` table
- [x ] Run migrations and test

### Step 2.6: Assessment Tables ✅
- [x] Create migration for `assessment_types` table
- [x] Create migration for `assessment_components` table
- [x] Create migration for `assessment_clo_mapping` table
- [x] Create migration for `rubrics` table
- [x] Create migration for `rubric_criteria` table
- [x] Create migration for `rubric_levels` table
- [x] Create migration for `questions` table
- [x] Create migration for `question_clo_mapping` table
- [x] Run migrations and test

### Step 2.7: Results & Grades Tables ✅
- [x] Create migration for `grade_scales` table
- [x] Create migration for `grade_points` table
- [x] Create migration for `student_assessment_marks` table
- [x] Create migration for `student_question_marks` table
- [x] Create migration for `student_rubric_scores` table
- [x] Create migration for `course_results` table
- [x] Create migration for `semester_results` table
- [x] Create migration for `improvement_retake_records` table
- [x] Run migrations and test

### Step 2.8: OBE Attainment Tables ✅
- [x] Create migration for `student_clo_attainment` table
- [x] Create migration for `course_clo_attainment_summary` table
- [x] Create migration for `student_plo_attainment` table
- [x] Create migration for `program_plo_attainment_summary` table
- [x] Create migration for `attainment_thresholds` table
- [x] Create migration for `direct_attainment_methods` table
- [x] Create migration for `indirect_attainment_methods` table
- [x] Run migrations and test

### Step 2.9: Survey Tables ✅
- [x] Create migration for `surveys` table
- [x] Create migration for `survey_questions` table
- [x] Create migration for `survey_responses` table
- [x] Create migration for `survey_answers` table
- [x] Create migration for `indirect_attainment_results` table
- [x] Run migrations and test

### Step 2.10: Continuous Improvement Tables ✅
- [x] Create migration for `action_plans` table
- [x] Create migration for `action_plan_outcomes` table
- [x] Create migration for `obe_review_cycles` table
- [x] Run migrations and test

### Step 2.11: Student & Teacher Tables ✅
- [x] Create migration for `students` table
- [x] Create migration for `cgpas` table
- [x] Create migration for `guardians` table
- [x] Create migration for `teachers` table
- [x] Create migration for `designations` table
- [x] Create migration for `teacher_course` table
- [x] Run migrations and test

### Step 2.12: Infrastructure Tables ✅
- [x] Create migration for `buildings` table
- [x] Create migration for `floors` table
- [x] Create migration for `rooms` table
- [x] Create migration for `seat_allocations` table
- [x] Run migrations and test

### Step 2.13: Reports & Audit Tables
- [ ] Create migration for `obe_reports` table
- [ ] Create migration for `audit_logs` table
- [ ] Create migration for `result_publications` table
- [ ] Run migrations and test

### Step 2.14: Seed Data
- [ ] Create seeder for `bloom_taxonomy_levels` (6 levels)
- [ ] Create seeder for `assessment_types`
- [ ] Create seeder for `grade_scales` and `grade_points`
- [ ] Create seeder for `designations`
- [ ] Create seeder for admin user
- [ ] Run all seeders

---

## ⚙️ Phase 3: Backend Development (MVC)

### Step 3.1: Configuration Setup
- [ ] Create `config/database.js` - MySQL connection pool
- [ ] Create `config/auth.js` - JWT configuration
- [ ] Create `config/app.js` - App constants
- [ ] Create `.env` file with environment variables
- [ ] Create `.env.example` template

### Step 3.2: Base Model Setup
- [ ] Create `models/BaseModel.js` with CRUD operations
- [ ] Implement `findAll()` method
- [ ] Implement `findById()` method
- [ ] Implement `create()` method
- [ ] Implement `update()` method
- [ ] Implement `delete()` method
- [ ] Implement `findWhere()` method

### Step 3.3: Authentication Module

#### Step 3.3.1: Auth Models
- [ ] Create `models/User.js`
- [ ] Add method `findByEmail()`
- [ ] Add method `findByUsername()`
- [ ] Add method `createUser()`
- [ ] Add method `updatePassword()`

#### Step 3.3.2: Auth Controller
- [ ] Create `controllers/AuthController.js`
- [ ] Implement `register()` method
- [ ] Implement `login()` method
- [ ] Implement `logout()` method
- [ ] Implement `refreshToken()` method
- [ ] Implement `forgotPassword()` method
- [ ] Implement `resetPassword()` method
- [ ] Implement `getCurrentUser()` method

#### Step 3.3.3: Auth Middleware
- [ ] Create `middlewares/authMiddleware.js`
- [ ] Implement JWT verification
- [ ] Implement role-based authorization
- [ ] Create `middlewares/roleMiddleware.js`

#### Step 3.3.4: Auth Routes
- [ ] Create `routes/authRoutes.js`
- [ ] Add POST `/api/auth/register`
- [ ] Add POST `/api/auth/login`
- [ ] Add POST `/api/auth/logout`
- [ ] Add POST `/api/auth/refresh`
- [ ] Add POST `/api/auth/forgot-password`
- [ ] Add POST `/api/auth/reset-password`
- [ ] Add GET `/api/auth/me`

### Step 3.4: User Management Module

#### Step 3.4.1: User Model Enhancement
- [ ] Add method `getAllWithPagination()`
- [ ] Add method `updateProfile()`
- [ ] Add method `uploadProfileImage()`

#### Step 3.4.2: User Controller
- [ ] Create `controllers/UserController.js`
- [ ] Implement `index()` - list all users
- [ ] Implement `show()` - get single user
- [ ] Implement `update()` - update user
- [ ] Implement `destroy()` - delete user
- [ ] Implement `updateProfile()` - update own profile

#### Step 3.4.3: User Routes
- [ ] Create `routes/userRoutes.js`
- [ ] Add GET `/api/users`
- [ ] Add GET `/api/users/:id`
- [ ] Add PUT `/api/users/:id`
- [ ] Add DELETE `/api/users/:id`
- [ ] Add PUT `/api/users/profile`

### Step 3.5: Faculty Module

#### Step 3.5.1: Faculty Model
- [ ] Create `models/Faculty.js`
- [ ] Add method `getAllWithDepartments()`

#### Step 3.5.2: Faculty Controller
- [ ] Create `controllers/FacultyController.js`
- [ ] Implement `index()`
- [ ] Implement `show()`
- [ ] Implement `store()`
- [ ] Implement `update()`
- [ ] Implement `destroy()`

#### Step 3.5.3: Faculty Routes
- [ ] Create `routes/facultyRoutes.js`
- [ ] Add CRUD routes for faculties

### Step 3.6: Department Module

#### Step 3.6.1: Department Model
- [ ] Create `models/Department.js`
- [ ] Add method `getByFaculty()`
- [ ] Add method `getWithDegrees()`

#### Step 3.6.2: Department Controller
- [ ] Create `controllers/DepartmentController.js`
- [ ] Implement all CRUD methods

#### Step 3.6.3: Department Routes
- [ ] Create `routes/departmentRoutes.js`
- [ ] Add CRUD routes for departments

### Step 3.7: Degree Module

#### Step 3.7.1: Degree Model
- [ ] Create `models/Degree.js`
- [ ] Add method `getByDepartment()`
- [ ] Add method `getWithPLOs()`
- [ ] Add method `getWithPEOs()`

#### Step 3.7.2: Degree Controller
- [ ] Create `controllers/DegreeController.js`
- [ ] Implement all CRUD methods

#### Step 3.7.3: Degree Routes
- [ ] Create `routes/degreeRoutes.js`
- [ ] Add CRUD routes for degrees

### Step 3.8: Academic Session Module

#### Step 3.8.1: Academic Session Model
- [ ] Create `models/AcademicSession.js`
- [ ] Add method `getActive()`
- [ ] Add method `getWithSemesters()`

#### Step 3.8.2: Academic Session Controller
- [ ] Create `controllers/AcademicSessionController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `setActive()` method

#### Step 3.8.3: Academic Session Routes
- [ ] Create `routes/academicSessionRoutes.js`
- [ ] Add CRUD routes

### Step 3.9: Semester Module

#### Step 3.9.1: Semester Model
- [ ] Create `models/Semester.js`
- [ ] Add method `getBySession()`
- [ ] Add method `getActive()`

#### Step 3.9.2: Semester Controller
- [ ] Create `controllers/SemesterController.js`
- [ ] Implement all CRUD methods

#### Step 3.9.3: Semester Routes
- [ ] Create `routes/semesterRoutes.js`
- [ ] Add CRUD routes

### Step 3.10: Course Module

#### Step 3.10.1: Course Model
- [ ] Create `models/Course.js`
- [ ] Add method `getByDepartment()`
- [ ] Add method `getByDegree()`
- [ ] Add method `getWithCLOs()`
- [ ] Add method `getWithObjectives()`

#### Step 3.10.2: Course Controller
- [ ] Create `controllers/CourseController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `getCLOs()` method
- [ ] Implement `getObjectives()` method

#### Step 3.10.3: Course Routes
- [ ] Create `routes/courseRoutes.js`
- [ ] Add CRUD routes
- [ ] Add GET `/api/courses/:id/clos`
- [ ] Add GET `/api/courses/:id/objectives`

### Step 3.11: Course Offering Module

#### Step 3.11.1: Course Offering Model
- [ ] Create `models/CourseOffering.js`
- [ ] Add method `getBySemester()`
- [ ] Add method `getByTeacher()`
- [ ] Add method `getEnrollments()`

#### Step 3.11.2: Course Offering Controller
- [ ] Create `controllers/CourseOfferingController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `getEnrollments()` method
- [ ] Implement `assignTeacher()` method

#### Step 3.11.3: Course Offering Routes
- [ ] Create `routes/courseOfferingRoutes.js`
- [ ] Add CRUD routes

### Step 3.12: CLO Module

#### Step 3.12.1: CLO Model
- [ ] Create `models/CourseLearningOutcome.js`
- [ ] Add method `getByCourse()`
- [ ] Add method `getMappedPLOs()`
- [ ] Add method `getAttainment()`

#### Step 3.12.2: CLO Controller
- [ ] Create `controllers/CLOController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `mapToPLO()` method
- [ ] Implement `unmapFromPLO()` method

#### Step 3.12.3: CLO Routes
- [ ] Create `routes/cloRoutes.js`
- [ ] Add CRUD routes
- [ ] Add POST `/api/clos/:id/map-plo`
- [ ] Add DELETE `/api/clos/:id/unmap-plo/:ploId`

### Step 3.13: PLO Module

#### Step 3.13.1: PLO Model
- [ ] Create `models/ProgramLearningOutcome.js`
- [ ] Add method `getByDegree()`
- [ ] Add method `getMappedCLOs()`
- [ ] Add method `getMappedPEOs()`
- [ ] Add method `getAttainment()`

#### Step 3.13.2: PLO Controller
- [ ] Create `controllers/PLOController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `mapToPEO()` method

#### Step 3.13.3: PLO Routes
- [ ] Create `routes/ploRoutes.js`
- [ ] Add CRUD routes

### Step 3.14: PEO Module

#### Step 3.14.1: PEO Model
- [ ] Create `models/ProgramEducationalObjective.js`
- [ ] Add method `getByDegree()`
- [ ] Add method `getMappedPLOs()`

#### Step 3.14.2: PEO Controller
- [ ] Create `controllers/PEOController.js`
- [ ] Implement all CRUD methods

#### Step 3.14.3: PEO Routes
- [ ] Create `routes/peoRoutes.js`
- [ ] Add CRUD routes

### Step 3.15: Bloom's Taxonomy Module

#### Step 3.15.1: Bloom Model
- [ ] Create `models/BloomTaxonomyLevel.js`

#### Step 3.15.2: Bloom Controller
- [ ] Create `controllers/BloomTaxonomyController.js`
- [ ] Implement `index()` method

#### Step 3.15.3: Bloom Routes
- [ ] Create `routes/bloomRoutes.js`
- [ ] Add GET `/api/bloom-taxonomy`

### Step 3.16: Student Module

#### Step 3.16.1: Student Model
- [ ] Create `models/Student.js`
- [ ] Add method `getByDepartment()`
- [ ] Add method `getByDegree()`
- [ ] Add method `getEnrollments()`
- [ ] Add method `getCGPA()`
- [ ] Add method `getCLOAttainment()`
- [ ] Add method `getPLOAttainment()`

#### Step 3.16.2: Student Controller
- [ ] Create `controllers/StudentController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `getEnrollments()` method
- [ ] Implement `getResults()` method
- [ ] Implement `getAttainmentReport()` method

#### Step 3.16.3: Student Routes
- [ ] Create `routes/studentRoutes.js`
- [ ] Add CRUD routes
- [ ] Add GET `/api/students/:id/enrollments`
- [ ] Add GET `/api/students/:id/results`
- [ ] Add GET `/api/students/:id/attainment`

### Step 3.17: Teacher Module

#### Step 3.17.1: Teacher Model
- [ ] Create `models/Teacher.js`
- [ ] Add method `getByDepartment()`
- [ ] Add method `getCourses()`

#### Step 3.17.2: Teacher Controller
- [ ] Create `controllers/TeacherController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `assignCourse()` method
- [ ] Implement `getCourses()` method

#### Step 3.17.3: Teacher Routes
- [ ] Create `routes/teacherRoutes.js`
- [ ] Add CRUD routes

### Step 3.18: Enrollment Module

#### Step 3.18.1: Enrollment Model
- [ ] Create `models/CourseEnrollment.js`
- [ ] Add method `enrollStudent()`
- [ ] Add method `dropStudent()`
- [ ] Add method `getByStudent()`
- [ ] Add method `getByCourseOffering()`

#### Step 3.18.2: Enrollment Controller
- [ ] Create `controllers/EnrollmentController.js`
- [ ] Implement `enroll()` method
- [ ] Implement `drop()` method
- [ ] Implement `getByOffering()` method

#### Step 3.18.3: Enrollment Routes
- [ ] Create `routes/enrollmentRoutes.js`
- [ ] Add enrollment routes

### Step 3.19: Assessment Module

#### Step 3.19.1: Assessment Type Model
- [ ] Create `models/AssessmentType.js`

#### Step 3.19.2: Assessment Component Model
- [ ] Create `models/AssessmentComponent.js`
- [ ] Add method `getByCourseOffering()`
- [ ] Add method `getCLOMapping()`

#### Step 3.19.3: Assessment Controller
- [ ] Create `controllers/AssessmentController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `mapToCLO()` method
- [ ] Implement `unmapFromCLO()` method

#### Step 3.19.4: Assessment Routes
- [ ] Create `routes/assessmentRoutes.js`
- [ ] Add CRUD routes
- [ ] Add CLO mapping routes

### Step 3.20: Question Module

#### Step 3.20.1: Question Model
- [ ] Create `models/Question.js`
- [ ] Add method `getByAssessment()`
- [ ] Add method `getCLOMapping()`

#### Step 3.20.2: Question Controller
- [ ] Create `controllers/QuestionController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `mapToCLO()` method

#### Step 3.20.3: Question Routes
- [ ] Create `routes/questionRoutes.js`
- [ ] Add CRUD routes

### Step 3.21: Rubric Module

#### Step 3.21.1: Rubric Model
- [ ] Create `models/Rubric.js`
- [ ] Add method `getWithCriteria()`

#### Step 3.21.2: Rubric Criteria Model
- [ ] Create `models/RubricCriteria.js`
- [ ] Add method `getWithLevels()`

#### Step 3.21.3: Rubric Level Model
- [ ] Create `models/RubricLevel.js`

#### Step 3.21.4: Rubric Controller
- [ ] Create `controllers/RubricController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `addCriteria()` method
- [ ] Implement `addLevel()` method

#### Step 3.21.5: Rubric Routes
- [ ] Create `routes/rubricRoutes.js`
- [ ] Add CRUD routes

### Step 3.22: Marks Entry Module

#### Step 3.22.1: Student Assessment Marks Model
- [ ] Create `models/StudentAssessmentMark.js`
- [ ] Add method `enterMarks()`
- [ ] Add method `bulkEnterMarks()`
- [ ] Add method `getByStudent()`
- [ ] Add method `getByAssessment()`

#### Step 3.22.2: Student Question Marks Model
- [ ] Create `models/StudentQuestionMark.js`
- [ ] Add method `enterMarks()`
- [ ] Add method `bulkEnterMarks()`

#### Step 3.22.3: Marks Controller
- [ ] Create `controllers/MarksController.js`
- [ ] Implement `enterAssessmentMarks()` method
- [ ] Implement `enterQuestionMarks()` method
- [ ] Implement `bulkEnterMarks()` method
- [ ] Implement `getMarksByAssessment()` method
- [ ] Implement `getMarksByStudent()` method

#### Step 3.22.4: Marks Routes
- [ ] Create `routes/marksRoutes.js`
- [ ] Add marks entry routes

### Step 3.23: Rubric Scoring Module

#### Step 3.23.1: Student Rubric Score Model
- [ ] Create `models/StudentRubricScore.js`
- [ ] Add method `enterScore()`
- [ ] Add method `getByStudent()`

#### Step 3.23.2: Rubric Score Controller
- [ ] Create `controllers/RubricScoreController.js`
- [ ] Implement `enterScore()` method
- [ ] Implement `getScoresByAssessment()` method

#### Step 3.23.3: Rubric Score Routes
- [ ] Create `routes/rubricScoreRoutes.js`
- [ ] Add scoring routes

### Step 3.24: Grade Module

#### Step 3.24.1: Grade Scale Model
- [ ] Create `models/GradeScale.js`
- [ ] Add method `getActive()`

#### Step 3.24.2: Grade Point Model
- [ ] Create `models/GradePoint.js`
- [ ] Add method `getByScale()`
- [ ] Add method `calculateGrade()`

#### Step 3.24.3: Grade Controller
- [ ] Create `controllers/GradeController.js`
- [ ] Implement CRUD methods

#### Step 3.24.4: Grade Routes
- [ ] Create `routes/gradeRoutes.js`
- [ ] Add CRUD routes

### Step 3.25: Course Results Module

#### Step 3.25.1: Course Result Model
- [ ] Create `models/CourseResult.js`
- [ ] Add method `calculateResult()`
- [ ] Add method `getByStudent()`
- [ ] Add method `getByCourseOffering()`

#### Step 3.25.2: Course Result Controller
- [ ] Create `controllers/CourseResultController.js`
- [ ] Implement `calculateResults()` method
- [ ] Implement `publishResults()` method
- [ ] Implement `getResults()` method

#### Step 3.25.3: Course Result Routes
- [ ] Create `routes/courseResultRoutes.js`
- [ ] Add result routes

### Step 3.26: Semester Results Module

#### Step 3.26.1: Semester Result Model
- [ ] Create `models/SemesterResult.js`
- [ ] Add method `calculateSGPA()`
- [ ] Add method `calculateCGPA()`

#### Step 3.26.2: Semester Result Controller
- [ ] Create `controllers/SemesterResultController.js`
- [ ] Implement `calculateResults()` method
- [ ] Implement `publishResults()` method

#### Step 3.26.3: Semester Result Routes
- [ ] Create `routes/semesterResultRoutes.js`
- [ ] Add result routes

### Step 3.27: CLO Attainment Module

#### Step 3.27.1: Student CLO Attainment Model
- [ ] Create `models/StudentCLOAttainment.js`
- [ ] Add method `calculateAttainment()`
- [ ] Add method `getByStudent()`
- [ ] Add method `getByCourseOffering()`

#### Step 3.27.2: Course CLO Attainment Summary Model
- [ ] Create `models/CourseCLOAttainmentSummary.js`
- [ ] Add method `calculateSummary()`

#### Step 3.27.3: CLO Attainment Controller
- [ ] Create `controllers/CLOAttainmentController.js`
- [ ] Implement `calculateStudentAttainment()` method
- [ ] Implement `calculateCourseAttainment()` method
- [ ] Implement `getStudentReport()` method
- [ ] Implement `getCourseReport()` method

#### Step 3.27.4: CLO Attainment Routes
- [ ] Create `routes/cloAttainmentRoutes.js`
- [ ] Add attainment routes

### Step 3.28: PLO Attainment Module

#### Step 3.28.1: Student PLO Attainment Model
- [ ] Create `models/StudentPLOAttainment.js`
- [ ] Add method `calculateAttainment()`
- [ ] Add method `getByStudent()`

#### Step 3.28.2: Program PLO Attainment Summary Model
- [ ] Create `models/ProgramPLOAttainmentSummary.js`
- [ ] Add method `calculateSummary()`

#### Step 3.28.3: PLO Attainment Controller
- [ ] Create `controllers/PLOAttainmentController.js`
- [ ] Implement `calculateStudentAttainment()` method
- [ ] Implement `calculateProgramAttainment()` method
- [ ] Implement `getStudentReport()` method
- [ ] Implement `getProgramReport()` method

#### Step 3.28.4: PLO Attainment Routes
- [ ] Create `routes/ploAttainmentRoutes.js`
- [ ] Add attainment routes

### Step 3.29: Attainment Threshold Module

#### Step 3.29.1: Attainment Threshold Model
- [ ] Create `models/AttainmentThreshold.js`
- [ ] Add method `getByDegree()`

#### Step 3.29.2: Attainment Threshold Controller
- [ ] Create `controllers/AttainmentThresholdController.js`
- [ ] Implement CRUD methods

#### Step 3.29.3: Attainment Threshold Routes
- [ ] Create `routes/attainmentThresholdRoutes.js`
- [ ] Add CRUD routes

### Step 3.30: Survey Module

#### Step 3.30.1: Survey Model
- [ ] Create `models/Survey.js`
- [ ] Add method `getActive()`
- [ ] Add method `getWithQuestions()`

#### Step 3.30.2: Survey Question Model
- [ ] Create `models/SurveyQuestion.js`

#### Step 3.30.3: Survey Response Model
- [ ] Create `models/SurveyResponse.js`
- [ ] Add method `submitResponse()`

#### Step 3.30.4: Survey Answer Model
- [ ] Create `models/SurveyAnswer.js`

#### Step 3.30.5: Survey Controller
- [ ] Create `controllers/SurveyController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `addQuestion()` method
- [ ] Implement `submitResponse()` method
- [ ] Implement `getResponses()` method
- [ ] Implement `getAnalytics()` method

#### Step 3.30.6: Survey Routes
- [ ] Create `routes/surveyRoutes.js`
- [ ] Add CRUD routes
- [ ] Add response routes

### Step 3.31: Indirect Attainment Module

#### Step 3.31.1: Indirect Attainment Model
- [ ] Create `models/IndirectAttainmentResult.js`
- [ ] Add method `calculateFromSurvey()`

#### Step 3.31.2: Indirect Attainment Controller
- [ ] Create `controllers/IndirectAttainmentController.js`
- [ ] Implement `calculateAttainment()` method
- [ ] Implement `getReport()` method

#### Step 3.31.3: Indirect Attainment Routes
- [ ] Create `routes/indirectAttainmentRoutes.js`
- [ ] Add attainment routes

### Step 3.32: Action Plan Module

#### Step 3.32.1: Action Plan Model
- [ ] Create `models/ActionPlan.js`
- [ ] Add method `getByDegree()`
- [ ] Add method `getByStatus()`

#### Step 3.32.2: Action Plan Outcome Model
- [ ] Create `models/ActionPlanOutcome.js`

#### Step 3.32.3: Action Plan Controller
- [ ] Create `controllers/ActionPlanController.js`
- [ ] Implement all CRUD methods
- [ ] Implement `addOutcome()` method
- [ ] Implement `updateStatus()` method

#### Step 3.32.4: Action Plan Routes
- [ ] Create `routes/actionPlanRoutes.js`
- [ ] Add CRUD routes

### Step 3.33: OBE Review Cycle Module

#### Step 3.33.1: Review Cycle Model
- [ ] Create `models/OBEReviewCycle.js`

#### Step 3.33.2: Review Cycle Controller
- [ ] Create `controllers/OBEReviewCycleController.js`
- [ ] Implement all CRUD methods

#### Step 3.33.3: Review Cycle Routes
- [ ] Create `routes/obeReviewCycleRoutes.js`
- [ ] Add CRUD routes

### Step 3.34: Reports Module

#### Step 3.34.1: OBE Report Model
- [ ] Create `models/OBEReport.js`
- [ ] Add method `generateCLOReport()`
- [ ] Add method `generatePLOReport()`
- [ ] Add method `generateCourseReport()`
- [ ] Add method `generateProgramReport()`

#### Step 3.34.2: Report Controller
- [ ] Create `controllers/ReportController.js`
- [ ] Implement `generateCLOAttainmentReport()` method
- [ ] Implement `generatePLOAttainmentReport()` method
- [ ] Implement `generateCourseReport()` method
- [ ] Implement `generateProgramReport()` method
- [ ] Implement `exportReport()` method

#### Step 3.34.3: Report Routes
- [ ] Create `routes/reportRoutes.js`
- [ ] Add report generation routes

### Step 3.35: Audit Log Module

#### Step 3.35.1: Audit Log Model
- [ ] Create `models/AuditLog.js`
- [ ] Add method `log()`
- [ ] Add method `getByUser()`
- [ ] Add method `getByTable()`

#### Step 3.35.2: Audit Middleware
- [ ] Create `middlewares/auditMiddleware.js`
- [ ] Implement automatic logging

#### Step 3.35.3: Audit Controller
- [ ] Create `controllers/AuditLogController.js`
- [ ] Implement `getLogs()` method

#### Step 3.35.4: Audit Routes
- [ ] Create `routes/auditLogRoutes.js`
- [ ] Add log retrieval routes

### Step 3.36: Building/Hall Module

#### Step 3.36.1: Building Model
- [ ] Create `models/Building.js`

#### Step 3.36.2: Floor Model
- [ ] Create `models/Floor.js`

#### Step 3.36.3: Room Model
- [ ] Create `models/Room.js`

#### Step 3.36.4: Building Controller
- [ ] Create `controllers/BuildingController.js`
- [ ] Implement all CRUD methods

#### Step 3.36.5: Building Routes
- [ ] Create `routes/buildingRoutes.js`
- [ ] Add CRUD routes

### Step 3.37: Seat Allocation Module

#### Step 3.37.1: Seat Allocation Model
- [ ] Create `models/SeatAllocation.js`

#### Step 3.37.2: Seat Allocation Controller
- [ ] Create `controllers/SeatAllocationController.js`
- [ ] Implement `allocate()` method
- [ ] Implement `deallocate()` method

#### Step 3.37.3: Seat Allocation Routes
- [ ] Create `routes/seatAllocationRoutes.js`
- [ ] Add allocation routes

### Step 3.38: Main Application Setup

#### Step 3.38.1: Create Main App File
- [ ] Create `app.js` with Express setup
- [ ] Configure middleware (cors, json parser)
- [ ] Configure error handling middleware
- [ ] Import and use all routes

#### Step 3.38.2: Create Route Index
- [ ] Create `routes/index.js`
- [ ] Import and export all routes

### Step 3.39: Utility Functions

#### Step 3.39.1: Create Utilities
- [ ] Create `utils/pagination.js`
- [ ] Create `utils/validation.js`
- [ ] Create `utils/fileUpload.js`
- [ ] Create `utils/dateHelper.js`
- [ ] Create `utils/mathHelper.js` (for attainment calculations)

### Step 3.40: Services Layer

#### Step 3.40.1: Create Services
- [ ] Create `services/AttainmentService.js` - CLO/PLO calculations
- [ ] Create `services/GradeService.js` - Grade calculations
- [ ] Create `services/ReportService.js` - Report generation
- [ ] Create `services/EmailService.js` - Email notifications

---

## 🖥️ Phase 4: Frontend Development (Electron + React)

### Step 4.1: Electron Setup

#### Step 4.1.1: Create Electron Main Process
- [ ] Create `electron/main.js`
- [ ] Configure window creation
- [ ] Configure app lifecycle events
- [ ] Configure IPC handlers

#### Step 4.1.2: Create Electron Preload
- [ ] Create `electron/preload.js`
- [ ] Expose IPC to renderer

#### Step 4.1.3: Update Package.json
- [ ] Add electron main entry
- [ ] Add electron start scripts
- [ ] Add electron build configuration

### Step 4.2: React Base Setup

#### Step 4.2.1: Configure Tailwind CSS
- [ ] Update `tailwind.config.js`
- [ ] Create `src/styles/globals.css`
- [ ] Import Tailwind directives

#### Step 4.2.2: Configure API Service
- [ ] Create `src/services/api.js` - Axios instance
- [ ] Configure base URL
- [ ] Configure interceptors for auth

#### Step 4.2.3: Configure State Management
- [ ] Create `src/store/authStore.js`
- [ ] Create `src/store/appStore.js`

#### Step 4.2.4: Configure React Query
- [ ] Create `src/services/queryClient.js`
- [ ] Configure default options

### Step 4.3: Layout Components

#### Step 4.3.1: Create Base Layout
- [ ] Create `src/components/layout/MainLayout.jsx`
- [ ] Create `src/components/layout/Sidebar.jsx`
- [ ] Create `src/components/layout/Header.jsx`
- [ ] Create `src/components/layout/Footer.jsx`

#### Step 4.3.2: Create Auth Layout
- [ ] Create `src/components/layout/AuthLayout.jsx`

### Step 4.4: Common Components

#### Step 4.4.1: Create UI Components
- [ ] Create `src/components/ui/Button.jsx`
- [ ] Create `src/components/ui/Input.jsx`
- [ ] Create `src/components/ui/Select.jsx`
- [ ] Create `src/components/ui/Modal.jsx`
- [ ] Create `src/components/ui/Table.jsx`
- [ ] Create `src/components/ui/Card.jsx`
- [ ] Create `src/components/ui/Alert.jsx`
- [ ] Create `src/components/ui/Badge.jsx`
- [ ] Create `src/components/ui/Tabs.jsx`
- [ ] Create `src/components/ui/Dropdown.jsx`
- [ ] Create `src/components/ui/Pagination.jsx`
- [ ] Create `src/components/ui/Loading.jsx`
- [ ] Create `src/components/ui/ConfirmDialog.jsx`

#### Step 4.4.2: Create Form Components
- [ ] Create `src/components/form/FormInput.jsx`
- [ ] Create `src/components/form/FormSelect.jsx`
- [ ] Create `src/components/form/FormTextarea.jsx`
- [ ] Create `src/components/form/FormCheckbox.jsx`
- [ ] Create `src/components/form/FormDatePicker.jsx`

#### Step 4.4.3: Create Data Components
- [ ] Create `src/components/data/DataTable.jsx`
- [ ] Create `src/components/data/SearchBar.jsx`
- [ ] Create `src/components/data/FilterPanel.jsx`
- [ ] Create `src/components/data/ExportButton.jsx`

### Step 4.5: Chart Components

#### Step 4.5.1: Create Chart Components
- [ ] Create `src/components/charts/BarChart.jsx`
- [ ] Create `src/components/charts/LineChart.jsx`
- [ ] Create `src/components/charts/PieChart.jsx`
- [ ] Create `src/components/charts/RadarChart.jsx`
- [ ] Create `src/components/charts/AttainmentChart.jsx`

### Step 4.6: Authentication Pages

#### Step 4.6.1: Create Auth Pages
- [ ] Create `src/pages/auth/Login.jsx`
- [ ] Create `src/pages/auth/ForgotPassword.jsx`
- [ ] Create `src/pages/auth/ResetPassword.jsx`

#### Step 4.6.2: Create Auth Hooks
- [ ] Create `src/hooks/useAuth.js`
- [ ] Create `src/hooks/useLogin.js`
- [ ] Create `src/hooks/useLogout.js`

### Step 4.7: Dashboard Pages

#### Step 4.7.1: Create Dashboard Components
- [ ] Create `src/pages/dashboard/Dashboard.jsx`
- [ ] Create `src/components/dashboard/StatsCard.jsx`
- [ ] Create `src/components/dashboard/RecentActivity.jsx`
- [ ] Create `src/components/dashboard/AttainmentOverview.jsx`
- [ ] Create `src/components/dashboard/CourseProgress.jsx`

### Step 4.8: User Management Pages

#### Step 4.8.1: Create User Pages
- [ ] Create `src/pages/users/UserList.jsx`
- [ ] Create `src/pages/users/UserCreate.jsx`
- [ ] Create `src/pages/users/UserEdit.jsx`
- [ ] Create `src/pages/users/UserProfile.jsx`

#### Step 4.8.2: Create User Hooks
- [ ] Create `src/hooks/useUsers.js`
- [ ] Create `src/hooks/useUser.js`
- [ ] Create `src/hooks/useCreateUser.js`
- [ ] Create `src/hooks/useUpdateUser.js`
- [ ] Create `src/hooks/useDeleteUser.js`

### Step 4.9: Faculty Management Pages

#### Step 4.9.1: Create Faculty Pages
- [ ] Create `src/pages/faculties/FacultyList.jsx`
- [ ] Create `src/pages/faculties/FacultyCreate.jsx`
- [ ] Create `src/pages/faculties/FacultyEdit.jsx`
- [ ] Create `src/pages/faculties/FacultyView.jsx`

#### Step 4.9.2: Create Faculty Hooks
- [ ] Create `src/hooks/useFaculties.js`
- [ ] Create `src/hooks/useFaculty.js`
- [ ] Create `src/hooks/useCreateFaculty.js`
- [ ] Create `src/hooks/useUpdateFaculty.js`
- [ ] Create `src/hooks/useDeleteFaculty.js`

### Step 4.10: Department Management Pages

#### Step 4.10.1: Create Department Pages
- [ ] Create `src/pages/departments/DepartmentList.jsx`
- [ ] Create `src/pages/departments/DepartmentCreate.jsx`
- [ ] Create `src/pages/departments/DepartmentEdit.jsx`
- [ ] Create `src/pages/departments/DepartmentView.jsx`

#### Step 4.10.2: Create Department Hooks
- [ ] Create `src/hooks/useDepartments.js`

### Step 4.11: Degree Management Pages

#### Step 4.11.1: Create Degree Pages
- [ ] Create `src/pages/degrees/DegreeList.jsx`
- [ ] Create `src/pages/degrees/DegreeCreate.jsx`
- [ ] Create `src/pages/degrees/DegreeEdit.jsx`
- [ ] Create `src/pages/degrees/DegreeView.jsx`

#### Step 4.11.2: Create Degree Hooks
- [ ] Create `src/hooks/useDegrees.js`

### Step 4.12: Academic Session Pages

#### Step 4.12.1: Create Session Pages
- [ ] Create `src/pages/sessions/SessionList.jsx`
- [ ] Create `src/pages/sessions/SessionCreate.jsx`
- [ ] Create `src/pages/sessions/SessionEdit.jsx`

#### Step 4.12.2: Create Session Hooks
- [ ] Create `src/hooks/useSessions.js`

### Step 4.13: Semester Pages

#### Step 4.13.1: Create Semester Pages
- [ ] Create `src/pages/semesters/SemesterList.jsx`
- [ ] Create `src/pages/semesters/SemesterCreate.jsx`
- [ ] Create `src/pages/semesters/SemesterEdit.jsx`

#### Step 4.13.2: Create Semester Hooks
- [ ] Create `src/hooks/useSemesters.js`

### Step 4.14: Course Management Pages

#### Step 4.14.1: Create Course Pages
- [ ] Create `src/pages/courses/CourseList.jsx`
- [ ] Create `src/pages/courses/CourseCreate.jsx`
- [ ] Create `src/pages/courses/CourseEdit.jsx`
- [ ] Create `src/pages/courses/CourseView.jsx`

#### Step 4.14.2: Create Course Hooks
- [ ] Create `src/hooks/useCourses.js`
- [ ] Create `src/hooks/useCourse.js`

### Step 4.15: Course Offering Pages

#### Step 4.15.1: Create Course Offering Pages
- [ ] Create `src/pages/offerings/OfferingList.jsx`
- [ ] Create `src/pages/offerings/OfferingCreate.jsx`
- [ ] Create `src/pages/offerings/OfferingEdit.jsx`
- [ ] Create `src/pages/offerings/OfferingView.jsx`

#### Step 4.15.2: Create Offering Hooks
- [ ] Create `src/hooks/useOfferings.js`

### Step 4.16: CLO Management Pages

#### Step 4.16.1: Create CLO Pages
- [ ] Create `src/pages/clos/CLOList.jsx`
- [ ] Create `src/pages/clos/CLOCreate.jsx`
- [ ] Create `src/pages/clos/CLOEdit.jsx`
- [ ] Create `src/pages/clos/CLOMapping.jsx`

#### Step 4.16.2: Create CLO Components
- [ ] Create `src/components/clo/CLOCard.jsx`
- [ ] Create `src/components/clo/CLOMappingMatrix.jsx`
- [ ] Create `src/components/clo/CLOBloomSelector.jsx`

#### Step 4.16.3: Create CLO Hooks
- [ ] Create `src/hooks/useCLOs.js`
- [ ] Create `src/hooks/useCLO.js`

### Step 4.17: PLO Management Pages

#### Step 4.17.1: Create PLO Pages
- [ ] Create `src/pages/plos/PLOList.jsx`
- [ ] Create `src/pages/plos/PLOCreate.jsx`
- [ ] Create `src/pages/plos/PLOEdit.jsx`
- [ ] Create `src/pages/plos/PLOMapping.jsx`

#### Step 4.17.2: Create PLO Components
- [ ] Create `src/components/plo/PLOCard.jsx`
- [ ] Create `src/components/plo/PLOMappingMatrix.jsx`
- [ ] Create `src/components/plo/CLO_PLO_Matrix.jsx`

#### Step 4.17.3: Create PLO Hooks
- [ ] Create `src/hooks/usePLOs.js`

### Step 4.18: PEO Management Pages

#### Step 4.18.1: Create PEO Pages
- [ ] Create `src/pages/peos/PEOList.jsx`
- [ ] Create `src/pages/peos/PEOCreate.jsx`
- [ ] Create `src/pages/peos/PEOEdit.jsx`
- [ ] Create `src/pages/peos/PEOMapping.jsx`

#### Step 4.18.2: Create PEO Components
- [ ] Create `src/components/peo/PEOCard.jsx`
- [ ] Create `src/components/peo/PEO_PLO_Matrix.jsx`

#### Step 4.18.3: Create PEO Hooks
- [ ] Create `src/hooks/usePEOs.js`

### Step 4.19: OBE Mapping Dashboard

#### Step 4.19.1: Create OBE Mapping Pages
- [ ] Create `src/pages/obe/OBEDashboard.jsx`
- [ ] Create `src/pages/obe/PEO_PLO_Mapping.jsx`
- [ ] Create `src/pages/obe/CLO_PLO_Mapping.jsx`
- [ ] Create `src/pages/obe/CLO_CO_Mapping.jsx`

#### Step 4.19.2: Create OBE Components
- [ ] Create `src/components/obe/MappingMatrix.jsx`
- [ ] Create `src/components/obe/OBEHierarchy.jsx`
- [ ] Create `src/components/obe/BloomTaxonomyChart.jsx`

### Step 4.20: Student Management Pages

#### Step 4.20.1: Create Student Pages
- [ ] Create `src/pages/students/StudentList.jsx`
- [ ] Create `src/pages/students/StudentCreate.jsx`
- [ ] Create `src/pages/students/StudentEdit.jsx`
- [ ] Create `src/pages/students/StudentView.jsx`
- [ ] Create `src/pages/students/StudentProfile.jsx`

#### Step 4.20.2: Create Student Components
- [ ] Create `src/components/student/StudentCard.jsx`
- [ ] Create `src/components/student/EnrollmentList.jsx`
- [ ] Create `src/components/student/ResultSummary.jsx`
- [ ] Create `src/components/student/AttainmentProgress.jsx`

#### Step 4.20.3: Create Student Hooks
- [ ] Create `src/hooks/useStudents.js`
- [ ] Create `src/hooks/useStudent.js`

### Step 4.21: Teacher Management Pages

#### Step 4.21.1: Create Teacher Pages
- [ ] Create `src/pages/teachers/TeacherList.jsx`
- [ ] Create `src/pages/teachers/TeacherCreate.jsx`
- [ ] Create `src/pages/teachers/TeacherEdit.jsx`
- [ ] Create `src/pages/teachers/TeacherView.jsx`

#### Step 4.21.2: Create Teacher Components
- [ ] Create `src/components/teacher/TeacherCard.jsx`
- [ ] Create `src/components/teacher/CourseAssignment.jsx`

#### Step 4.21.3: Create Teacher Hooks
- [ ] Create `src/hooks/useTeachers.js`

### Step 4.22: Enrollment Pages

#### Step 4.22.1: Create Enrollment Pages
- [ ] Create `src/pages/enrollments/EnrollmentList.jsx`
- [ ] Create `src/pages/enrollments/BulkEnrollment.jsx`
- [ ] Create `src/pages/enrollments/EnrollmentManage.jsx`

#### Step 4.22.2: Create Enrollment Hooks
- [ ] Create `src/hooks/useEnrollments.js`

### Step 4.23: Assessment Management Pages

#### Step 4.23.1: Create Assessment Pages
- [ ] Create `src/pages/assessments/AssessmentList.jsx`
- [ ] Create `src/pages/assessments/AssessmentCreate.jsx`
- [ ] Create `src/pages/assessments/AssessmentEdit.jsx`
- [ ] Create `src/pages/assessments/AssessmentView.jsx`
- [ ] Create `src/pages/assessments/AssessmentCLOMapping.jsx`

#### Step 4.23.2: Create Assessment Components
- [ ] Create `src/components/assessment/AssessmentCard.jsx`
- [ ] Create `src/components/assessment/CLOMappingForm.jsx`
- [ ] Create `src/components/assessment/AssessmentTypeSelector.jsx`

#### Step 4.23.3: Create Assessment Hooks
- [ ] Create `src/hooks/useAssessments.js`
- [ ] Create `src/hooks/useAssessment.js`

### Step 4.24: Question Management Pages

#### Step 4.24.1: Create Question Pages
- [ ] Create `src/pages/questions/QuestionList.jsx`
- [ ] Create `src/pages/questions/QuestionCreate.jsx`
- [ ] Create `src/pages/questions/QuestionEdit.jsx`
- [ ] Create `src/pages/questions/QuestionBank.jsx`

#### Step 4.24.2: Create Question Components
- [ ] Create `src/components/question/QuestionCard.jsx`
- [ ] Create `src/components/question/QuestionForm.jsx`
- [ ] Create `src/components/question/BloomLevelBadge.jsx`

#### Step 4.24.3: Create Question Hooks
- [ ] Create `src/hooks/useQuestions.js`

### Step 4.25: Rubric Management Pages

#### Step 4.25.1: Create Rubric Pages
- [ ] Create `src/pages/rubrics/RubricList.jsx`
- [ ] Create `src/pages/rubrics/RubricCreate.jsx`
- [ ] Create `src/pages/rubrics/RubricEdit.jsx`
- [ ] Create `src/pages/rubrics/RubricView.jsx`

#### Step 4.25.2: Create Rubric Components
- [ ] Create `src/components/rubric/RubricBuilder.jsx`
- [ ] Create `src/components/rubric/RubricCriteriaForm.jsx`
- [ ] Create `src/components/rubric/RubricLevelForm.jsx`
- [ ] Create `src/components/rubric/RubricPreview.jsx`

#### Step 4.25.3: Create Rubric Hooks
- [ ] Create `src/hooks/useRubrics.js`

### Step 4.26: Marks Entry Pages

#### Step 4.26.1: Create Marks Pages
- [ ] Create `src/pages/marks/MarksEntry.jsx`
- [ ] Create `src/pages/marks/BulkMarksEntry.jsx`
- [ ] Create `src/pages/marks/QuestionWiseMarks.jsx`
- [ ] Create `src/pages/marks/MarksSheet.jsx`

#### Step 4.26.2: Create Marks Components
- [ ] Create `src/components/marks/MarksTable.jsx`
- [ ] Create `src/components/marks/MarksEntryForm.jsx`
- [ ] Create `src/components/marks/BulkUpload.jsx`
- [ ] Create `src/components/marks/MarksImport.jsx`

#### Step 4.26.3: Create Marks Hooks
- [ ] Create `src/hooks/useMarks.js`
- [ ] Create `src/hooks/useEnterMarks.js`

### Step 4.27: Rubric Scoring Pages

#### Step 4.27.1: Create Rubric Scoring Pages
- [ ] Create `src/pages/scoring/RubricScoring.jsx`
- [ ] Create `src/pages/scoring/StudentScoring.jsx`

#### Step 4.27.2: Create Rubric Scoring Components
- [ ] Create `src/components/scoring/RubricScoreCard.jsx`
- [ ] Create `src/components/scoring/ScoreLevelSelector.jsx`

#### Step 4.27.3: Create Scoring Hooks
- [ ] Create `src/hooks/useRubricScoring.js`

### Step 4.28: Grade Management Pages

#### Step 4.28.1: Create Grade Pages
- [ ] Create `src/pages/grades/GradeScaleList.jsx`
- [ ] Create `src/pages/grades/GradeScaleCreate.jsx`
- [ ] Create `src/pages/grades/GradeScaleEdit.jsx`

#### Step 4.28.2: Create Grade Components
- [ ] Create `src/components/grades/GradeScaleTable.jsx`
- [ ] Create `src/components/grades/GradePointForm.jsx`

#### Step 4.28.3: Create Grade Hooks
- [ ] Create `src/hooks/useGradeScales.js`

### Step 4.29: Course Results Pages

#### Step 4.29.1: Create Course Result Pages
- [ ] Create `src/pages/results/CourseResultList.jsx`
- [ ] Create `src/pages/results/CourseResultCalculate.jsx`
- [ ] Create `src/pages/results/CourseResultPublish.jsx`
- [ ] Create `src/pages/results/CourseResultView.jsx`

#### Step 4.29.2: Create Course Result Components
- [ ] Create `src/components/results/ResultTable.jsx`
- [ ] Create `src/components/results/GradeDistribution.jsx`
- [ ] Create `src/components/results/ResultStats.jsx`

#### Step 4.29.3: Create Course Result Hooks
- [ ] Create `src/hooks/useCourseResults.js`

### Step 4.30: Semester Results Pages

#### Step 4.30.1: Create Semester Result Pages
- [ ] Create `src/pages/results/SemesterResultList.jsx`
- [ ] Create `src/pages/results/SemesterResultCalculate.jsx`
- [ ] Create `src/pages/results/SemesterResultPublish.jsx`
- [ ] Create `src/pages/results/Transcript.jsx`

#### Step 4.30.2: Create Semester Result Components
- [ ] Create `src/components/results/SGPACard.jsx`
- [ ] Create `src/components/results/CGPAChart.jsx`
- [ ] Create `src/components/results/TranscriptTemplate.jsx`

#### Step 4.30.3: Create Semester Result Hooks
- [ ] Create `src/hooks/useSemesterResults.js`

### Step 4.31: CLO Attainment Pages

#### Step 4.31.1: Create CLO Attainment Pages
- [ ] Create `src/pages/attainment/CLOAttainmentDashboard.jsx`
- [ ] Create `src/pages/attainment/StudentCLOAttainment.jsx`
- [ ] Create `src/pages/attainment/CourseCLOAttainment.jsx`
- [ ] Create `src/pages/attainment/CLOAttainmentReport.jsx`

#### Step 4.31.2: Create CLO Attainment Components
- [ ] Create `src/components/attainment/CLOAttainmentTable.jsx`
- [ ] Create `src/components/attainment/CLOAttainmentChart.jsx`
- [ ] Create `src/components/attainment/AttainmentProgressBar.jsx`
- [ ] Create `src/components/attainment/AttainmentLevelBadge.jsx`

#### Step 4.31.3: Create CLO Attainment Hooks
- [ ] Create `src/hooks/useCLOAttainment.js`

### Step 4.32: PLO Attainment Pages

#### Step 4.32.1: Create PLO Attainment Pages
- [ ] Create `src/pages/attainment/PLOAttainmentDashboard.jsx`
- [ ] Create `src/pages/attainment/StudentPLOAttainment.jsx`
- [ ] Create `src/pages/attainment/ProgramPLOAttainment.jsx`
- [ ] Create `src/pages/attainment/PLOAttainmentReport.jsx`

#### Step 4.32.2: Create PLO Attainment Components
- [ ] Create `src/components/attainment/PLOAttainmentTable.jsx`
- [ ] Create `src/components/attainment/PLOAttainmentRadar.jsx`
- [ ] Create `src/components/attainment/PLOTrendChart.jsx`

#### Step 4.32.3: Create PLO Attainment Hooks
- [ ] Create `src/hooks/usePLOAttainment.js`

### Step 4.33: Attainment Threshold Pages

#### Step 4.33.1: Create Threshold Pages
- [ ] Create `src/pages/thresholds/ThresholdList.jsx`
- [ ] Create `src/pages/thresholds/ThresholdCreate.jsx`
- [ ] Create `src/pages/thresholds/ThresholdEdit.jsx`

#### Step 4.33.2: Create Threshold Components
- [ ] Create `src/components/thresholds/ThresholdForm.jsx`
- [ ] Create `src/components/thresholds/ThresholdPreview.jsx`

#### Step 4.33.3: Create Threshold Hooks
- [ ] Create `src/hooks/useThresholds.js`

### Step 4.34: Survey Management Pages

#### Step 4.34.1: Create Survey Pages
- [ ] Create `src/pages/surveys/SurveyList.jsx`
- [ ] Create `src/pages/surveys/SurveyCreate.jsx`
- [ ] Create `src/pages/surveys/SurveyEdit.jsx`
- [ ] Create `src/pages/surveys/SurveyBuilder.jsx`
- [ ] Create `src/pages/surveys/SurveyResponse.jsx`
- [ ] Create `src/pages/surveys/SurveyAnalytics.jsx`

#### Step 4.34.2: Create Survey Components
- [ ] Create `src/components/survey/SurveyCard.jsx`
- [ ] Create `src/components/survey/QuestionBuilder.jsx`
- [ ] Create `src/components/survey/QuestionTypes.jsx`
- [ ] Create `src/components/survey/ResponseForm.jsx`
- [ ] Create `src/components/survey/ResponseChart.jsx`

#### Step 4.34.3: Create Survey Hooks
- [ ] Create `src/hooks/useSurveys.js`
- [ ] Create `src/hooks/useSurveyResponses.js`

### Step 4.35: Indirect Attainment Pages

#### Step 4.35.1: Create Indirect Attainment Pages
- [ ] Create `src/pages/attainment/IndirectAttainment.jsx`
- [ ] Create `src/pages/attainment/IndirectAttainmentReport.jsx`

#### Step 4.35.2: Create Indirect Attainment Components
- [ ] Create `src/components/attainment/IndirectAttainmentChart.jsx`
- [ ] Create `src/components/attainment/SurveyAttainmentTable.jsx`

#### Step 4.35.3: Create Indirect Attainment Hooks
- [ ] Create `src/hooks/useIndirectAttainment.js`

### Step 4.36: Action Plan Pages

#### Step 4.36.1: Create Action Plan Pages
- [ ] Create `src/pages/actionplans/ActionPlanList.jsx`
- [ ] Create `src/pages/actionplans/ActionPlanCreate.jsx`
- [ ] Create `src/pages/actionplans/ActionPlanEdit.jsx`
- [ ] Create `src/pages/actionplans/ActionPlanView.jsx`

#### Step 4.36.2: Create Action Plan Components
- [ ] Create `src/components/actionplan/ActionPlanCard.jsx`
- [ ] Create `src/components/actionplan/ActionPlanTimeline.jsx`
- [ ] Create `src/components/actionplan/OutcomeForm.jsx`
- [ ] Create `src/components/actionplan/StatusBadge.jsx`

#### Step 4.36.3: Create Action Plan Hooks
- [ ] Create `src/hooks/useActionPlans.js`

### Step 4.37: Continuous Improvement Dashboard

#### Step 4.37.1: Create CI Pages
- [ ] Create `src/pages/improvement/CIDashboard.jsx`
- [ ] Create `src/pages/improvement/GapAnalysis.jsx`
- [ ] Create `src/pages/improvement/ImprovementTracking.jsx`

#### Step 4.37.2: Create CI Components
- [ ] Create `src/components/improvement/GapChart.jsx`
- [ ] Create `src/components/improvement/ImprovementTimeline.jsx`
- [ ] Create `src/components/improvement/CycleProgress.jsx`

### Step 4.38: OBE Review Cycle Pages

#### Step 4.38.1: Create Review Cycle Pages
- [ ] Create `src/pages/review/ReviewCycleList.jsx`
- [ ] Create `src/pages/review/ReviewCycleCreate.jsx`
- [ ] Create `src/pages/review/ReviewCycleView.jsx`

#### Step 4.38.2: Create Review Cycle Components
- [ ] Create `src/components/review/ReviewCycleCard.jsx`
- [ ] Create `src/components/review/ReviewTimeline.jsx`

#### Step 4.38.3: Create Review Cycle Hooks
- [ ] Create `src/hooks/useReviewCycles.js`

### Step 4.39: Reports Pages

#### Step 4.39.1: Create Report Pages
- [ ] Create `src/pages/reports/ReportDashboard.jsx`
- [ ] Create `src/pages/reports/CLOAttainmentReport.jsx`
- [ ] Create `src/pages/reports/PLOAttainmentReport.jsx`
- [ ] Create `src/pages/reports/CourseReport.jsx`
- [ ] Create `src/pages/reports/ProgramReport.jsx`
- [ ] Create `src/pages/reports/StudentReport.jsx`
- [ ] Create `src/pages/reports/BatchReport.jsx`

#### Step 4.39.2: Create Report Components
- [ ] Create `src/components/reports/ReportCard.jsx`
- [ ] Create `src/components/reports/ReportFilter.jsx`
- [ ] Create `src/components/reports/ReportExport.jsx`
- [ ] Create `src/components/reports/ReportTemplate.jsx`
- [ ] Create `src/components/reports/PrintLayout.jsx`

#### Step 4.39.3: Create Report Hooks
- [ ] Create `src/hooks/useReports.js`
- [ ] Create `src/hooks/useGenerateReport.js`

### Step 4.40: Audit Log Pages

#### Step 4.40.1: Create Audit Pages
- [ ] Create `src/pages/audit/AuditLogList.jsx`
- [ ] Create `src/pages/audit/AuditLogView.jsx`

#### Step 4.40.2: Create Audit Components
- [ ] Create `src/components/audit/AuditLogTable.jsx`
- [ ] Create `src/components/audit/AuditLogFilter.jsx`
- [ ] Create `src/components/audit/ChangesDiff.jsx`

#### Step 4.40.3: Create Audit Hooks
- [ ] Create `src/hooks/useAuditLogs.js`

### Step 4.41: Settings Pages

#### Step 4.41.1: Create Settings Pages
- [ ] Create `src/pages/settings/Settings.jsx`
- [ ] Create `src/pages/settings/ProfileSettings.jsx`
- [ ] Create `src/pages/settings/SystemSettings.jsx`
- [ ] Create `src/pages/settings/ThemeSettings.jsx`

### Step 4.42: Building/Hall Pages

#### Step 4.42.1: Create Building Pages
- [ ] Create `src/pages/buildings/BuildingList.jsx`
- [ ] Create `src/pages/buildings/BuildingCreate.jsx`
- [ ] Create `src/pages/buildings/BuildingEdit.jsx`

#### Step 4.42.2: Create Floor Pages
- [ ] Create `src/pages/floors/FloorList.jsx`
- [ ] Create `src/pages/floors/FloorManage.jsx`

#### Step 4.42.3: Create Room Pages
- [ ] Create `src/pages/rooms/RoomList.jsx`
- [ ] Create `src/pages/rooms/RoomManage.jsx`

### Step 4.43: Seat Allocation Pages

#### Step 4.43.1: Create Seat Allocation Pages
- [ ] Create `src/pages/allocation/SeatAllocationList.jsx`
- [ ] Create `src/pages/allocation/SeatAllocationManage.jsx`

### Step 4.44: Router Configuration

#### Step 4.44.1: Setup React Router
- [ ] Create `src/router/index.jsx`
- [ ] Define all routes with lazy loading
- [ ] Create protected route wrapper
- [ ] Create role-based route wrapper

#### Step 4.44.2: Route Groups
- [ ] Create auth routes group
- [ ] Create admin routes group
- [ ] Create teacher routes group
- [ ] Create student routes group

### Step 4.45: App Entry Point

#### Step 4.45.1: Setup Main App
- [ ] Update `src/App.jsx`
- [ ] Configure providers (QueryClient, Router, Store)
- [ ] Add toast notifications
- [ ] Add global loading state

#### Step 4.45.2: Update Main Entry
- [ ] Update `src/main.jsx`
- [ ] Import global styles

---

## 🧪 Phase 5: Testing

### Step 5.1: Backend Unit Tests

#### Step 5.1.1: Setup Testing
- [ ] Install Jest: `npm install -D jest`
- [ ] Install supertest: `npm install -D supertest`
- [ ] Configure Jest

#### Step 5.1.2: Write Model Tests
- [ ] Write tests for User model
- [ ] Write tests for Course model
- [ ] Write tests for CLO model
- [ ] Write tests for PLO model
- [ ] Write tests for Assessment model
- [ ] Write tests for Attainment models

#### Step 5.1.3: Write Controller Tests
- [ ] Write tests for AuthController
- [ ] Write tests for CourseController
- [ ] Write tests for CLOController
- [ ] Write tests for MarksController
- [ ] Write tests for AttainmentController

### Step 5.2: Frontend Unit Tests

#### Step 5.2.1: Setup Testing
- [ ] Install Vitest: `npm install -D vitest`
- [ ] Install React Testing Library: `npm install -D @testing-library/react`
- [ ] Configure Vitest

#### Step 5.2.2: Write Component Tests
- [ ] Write tests for UI components
- [ ] Write tests for form components
- [ ] Write tests for data components

#### Step 5.2.3: Write Hook Tests
- [ ] Write tests for custom hooks

### Step 5.3: Integration Tests
- [ ] Write API integration tests
- [ ] Write database integration tests
- [ ] Write attainment calculation tests

### Step 5.4: E2E Tests
- [ ] Install Playwright
- [ ] Write E2E tests for authentication flow
- [ ] Write E2E tests for course management flow
- [ ] Write E2E tests for marks entry flow
- [ ] Write E2E tests for attainment calculation flow

---

## 📦 Phase 6: Build & Deployment

### Step 6.1: Backend Preparation
- [ ] Create production environment configuration
- [ ] Add database migration scripts
- [ ] Add database seeder scripts
- [ ] Create startup script

### Step 6.2: Frontend Build
- [ ] Configure Vite for production build
- [ ] Optimize assets
- [ ] Configure code splitting

### Step 6.3: Electron Packaging
- [ ] Configure electron-builder
- [ ] Setup auto-updater
- [ ] Create Windows installer configuration
- [ ] Create macOS DMG configuration
- [ ] Create Linux AppImage configuration

### Step 6.4: Build Scripts
- [ ] Create build script for Windows
- [ ] Create build script for macOS
- [ ] Create build script for Linux

### Step 6.5: Documentation
- [ ] Write user manual
- [ ] Write API documentation
- [ ] Write installation guide
- [ ] Write developer guide

---

## 📅 Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Setup | 1-2 days | Project initialization |
| Phase 2: Database | 3-5 days | All migrations & seeders |
| Phase 3: Backend | 15-20 days | All API endpoints |
| Phase 4: Frontend | 25-35 days | All UI components & pages |
| Phase 5: Testing | 5-7 days | Unit, integration, E2E tests |
| Phase 6: Build | 3-5 days | Packaging & documentation |

**Total Estimated Time: 52-74 days (2-3 months)**

---

## 📝 Notes

1. **Development Approach:** Follow incremental development - complete one module fully before moving to the next
2. **Code Quality:** Use ESLint, Prettier for code formatting
3. **Version Control:** Commit after completing each step
4. **Documentation:** Document APIs using Swagger/OpenAPI
5. **Security:** Implement proper authentication, authorization, and input validation
6. **Performance:** Use pagination, caching, and query optimization
7. **Accessibility:** Follow WCAG guidelines for UI components

---

## 🔧 Key Configuration Files to Create

### Backend
- `.env` - Environment variables
- `package.json` - Dependencies
- `nodemon.json` - Development server config

### Frontend
- `.env` - Environment variables
- `package.json` - Dependencies
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind configuration
- `electron-builder.yml` - Electron build configuration

---

## 📚 References

- [Express.js Documentation](https://expressjs.com/)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OBE Implementation Guidelines](https://www.aicte-india.org/)
