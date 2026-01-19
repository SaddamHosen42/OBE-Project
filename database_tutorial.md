# 📚 Complete OBE Database Tutorial for Beginners

> **Welcome!** This tutorial will teach you everything about the Outcome Based Education (OBE) database from scratch. No prior database knowledge required!

---

## 📖 Table of Contents

1. [What is a Database?](#1-what-is-a-database)
2. [Understanding Tables, Columns & Rows](#2-understanding-tables-columns--rows)
3. [Keys: The Foundation of Relationships](#3-keys-the-foundation-of-relationships)
4. [What is Outcome Based Education?](#4-what-is-outcome-based-education)
5. [The Big Picture: How Everything Connects](#5-the-big-picture-how-everything-connects)
6. [Module 1: Users & Authentication](#6-module-1-users--authentication)
7. [Module 2: Academic Structure](#7-module-2-academic-structure)
8. [Module 3: Courses & Curriculum](#8-module-3-courses--curriculum)
9. [Module 4: The OBE Hierarchy (Most Important!)](#9-module-4-the-obe-hierarchy-most-important)
10. [Module 5: Assessment & Examinations](#10-module-5-assessment--examinations)
11. [Module 6: Results & Grading](#11-module-6-results--grading)
12. [Module 7: OBE Attainment Tracking](#12-module-7-obe-attainment-tracking)
13. [Module 8: Surveys & Feedback](#13-module-8-surveys--feedback)
14. [Module 9: Continuous Improvement](#14-module-9-continuous-improvement)
15. [Practice Exercises](#15-practice-exercises)
16. [Quick Reference Cheat Sheet](#16-quick-reference-cheat-sheet)

---

# 1. What is a Database?

## 🤔 Simple Explanation

Think of a database as a **digital filing cabinet**. Just like a filing cabinet has:
- **Drawers** (these are like **tables**)
- **Folders** inside drawers (these are like **rows/records**)
- **Information on each folder** (these are like **columns/fields**)

## 📦 Real-World Analogy

Imagine you're managing a university. You need to keep track of:
- Students
- Teachers
- Courses
- Grades

Without a database, you'd have papers everywhere! A database organizes all this information neatly.

```
📁 University Database
├── 📋 Students Table
│   ├── Student 1: Shakil, CSE, 3rd Year
│   ├── Student 2: Rahim, EEE, 2nd Year
│   └── ...
├── 📋 Teachers Table
│   ├── Teacher 1: Dr. Karim, Professor
│   └── ...
├── 📋 Courses Table
│   └── ...
└── 📋 Grades Table
    └── ...
```

---

# 2. Understanding Tables, Columns & Rows

## 📊 What is a Table?

A table is like an Excel spreadsheet with:
- **Columns** = The headings (Name, Email, Phone)
- **Rows** = The actual data (each person's information)

## Example: Students Table

| id | name | email | department |
|----|------|-------|------------|
| 1 | Shakil | shakil@uni.edu | CSE |
| 2 | Rahim | rahim@uni.edu | EEE |
| 3 | Fatima | fatima@uni.edu | CSE |

**Column explanations:**
- `id` → A unique number for each student (like a roll number)
- `name` → The student's name
- `email` → Their email address
- `department` → Which department they belong to

## 📝 Data Types

Each column has a **type** that defines what kind of data it can hold:

| Type | What it means | Example |
|------|---------------|---------|
| `bigint` | Big numbers | 1, 2, 1000000 |
| `varchar` | Text (limited length) | "Shakil", "CSE101" |
| `text` | Longer text | Course descriptions |
| `double` | Decimal numbers | 3.75, 95.5 |
| `boolean` | True or False | true, false |
| `date` | Calendar date | 2024-01-15 |
| `timestamp` | Date + Time | 2024-01-15 10:30:00 |
| `json` | Complex structured data | {"key": "value"} |

---

# 3. Keys: The Foundation of Relationships

## 🔑 Primary Key (PK)

A **Primary Key** is a unique identifier for each row. Think of it like:
- Your **National ID number** - no two people have the same one
- A **student roll number** - unique to each student

```
Students Table
| id (PK) | name   | email           |
|---------|--------|-----------------|
| 1       | Shakil | shakil@uni.edu  |
| 2       | Rahim  | rahim@uni.edu   |
```

☝️ The `id` column is the Primary Key - each value is unique!

## 🔗 Foreign Key (FK)

A **Foreign Key** creates a **relationship** between two tables. It's like saying "this record belongs to that record."

### Example: Connecting Students to Departments

```
Departments Table                    Students Table
| id (PK) | name |                   | id (PK) | name   | department_id (FK) |
|---------|------|                   |---------|--------|-------------------|
| 1       | CSE  |  <──────────────  | 1       | Shakil | 1                 |
| 2       | EEE  |  <──────────────  | 2       | Rahim  | 2                 |
                                     | 3       | Fatima | 1                 |
```

☝️ `department_id` in Students table **references** `id` in Departments table!

- Shakil (department_id=1) → belongs to CSE (id=1)
- Rahim (department_id=2) → belongs to EEE (id=2)
- Fatima (department_id=1) → belongs to CSE (id=1)

## 🎯 Why Use Keys?

1. **No duplicates** - PKs ensure each record is unique
2. **Relationships** - FKs connect related data
3. **Data integrity** - Can't add a student to a non-existent department

---

# 4. What is Outcome Based Education?

## 📚 Traditional vs OBE

### Traditional Education:
- "Did the student attend classes?"
- "Did they memorize the textbook?"
- Focus on **input** (teaching)

### Outcome Based Education:
- "Can the student actually DO something?"
- "Did they achieve specific skills?"
- Focus on **output** (learning outcomes)

## 🎯 The OBE Hierarchy

OBE has a **top-down hierarchy**:

```
🏆 PEO (Program Educational Objectives)
    │   "What graduates should achieve 3-5 years after graduation"
    │   Example: "Be successful professionals in the software industry"
    ▼
📊 PLO (Program Learning Outcomes)
    │   "What students should know/do when they graduate"
    │   Example: "Apply engineering principles to solve problems"
    ▼
📝 CLO (Course Learning Outcomes)
    │   "What students should learn in each course"
    │   Example: "Write efficient sorting algorithms"
    ▼
📋 Assessments
        "How we measure if students achieved CLOs"
        Example: Quizzes, Exams, Projects
```

## 🧠 Bloom's Taxonomy

Bloom's Taxonomy categorizes **levels of thinking**:

| Level | Name | Description | Example Verbs |
|-------|------|-------------|---------------|
| 1 | Remember | Recall facts | List, Define, Name |
| 2 | Understand | Explain ideas | Describe, Explain |
| 3 | Apply | Use knowledge | Implement, Execute |
| 4 | Analyze | Break down info | Compare, Contrast |
| 5 | Evaluate | Make judgments | Critique, Justify |
| 6 | Create | Produce new work | Design, Develop |

Each CLO is tagged with a Bloom's level to ensure courses cover different thinking skills!

---

# 5. The Big Picture: How Everything Connects

## 🗺️ Overall Database Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OBE DATABASE                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │    USERS     │     │  ACADEMIC    │     │   COURSES    │        │
│  │  - students  │────▶│  STRUCTURE   │────▶│ - offerings  │        │
│  │  - teachers  │     │  - faculty   │     │ - CLOs       │        │
│  │  - admins    │     │  - dept      │     │ - contents   │        │
│  └──────────────┘     │  - degree    │     └──────────────┘        │
│         │             └──────────────┘            │                 │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │  ENROLLMENT  │     │     OBE      │     │  ASSESSMENT  │        │
│  │  - course    │     │  HIERARCHY   │────▶│  - exams     │        │
│  │    enroll    │     │  - PEO       │     │  - quizzes   │        │
│  └──────────────┘     │  - PLO       │     │  - projects  │        │
│         │             │  - CLO       │     └──────────────┘        │
│         │             └──────────────┘            │                 │
│         ▼                    │                    ▼                 │
│  ┌──────────────┐            │             ┌──────────────┐        │
│  │   RESULTS    │◀───────────┴────────────▶│  ATTAINMENT  │        │
│  │  - marks     │                          │  - CLO %     │        │
│  │  - grades    │                          │  - PLO %     │        │
│  │  - GPA       │                          └──────────────┘        │
│  └──────────────┘                                 │                 │
│                                                   ▼                 │
│                                           ┌──────────────┐         │
│                                           │ IMPROVEMENT  │         │
│                                           │ - gap analysis│        │
│                                           │ - action plans│        │
│                                           └──────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Table Categories

| Category | # Tables | Purpose |
|----------|----------|---------|
| Users & Auth | 4 | User accounts, login, sessions |
| Personal Info | 2 | Addresses, gender |
| Academic Structure | 5 | Faculty, Department, Degree, Semester |
| Courses | 7 | Course details, CLOs, lesson plans |
| OBE Mapping | 6 | PEO, PLO, CLO relationships |
| Assessment | 5 | Exams, questions, rubrics |
| Rubrics | 3 | Scoring criteria |
| Results | 8 | Marks, grades, GPA |
| Attainment | 8 | OBE achievement tracking |
| Surveys | 5 | Feedback collection |
| Improvement | 3 | Continuous improvement |
| Teachers | 3 | Faculty information |
| Accommodation | 4 | Halls, rooms |
| Reports | 3 | Generated reports, audit logs |
| **TOTAL** | **66** | |

---

# 6. Module 1: Users & Authentication

## 👤 The `users` Table

This is the **central table** for everyone in the system!

```sql
users
├── id (PK)              -- Unique identifier
├── name                 -- Full name
├── email (UNIQUE)       -- Email (no duplicates allowed)
├── username (UNIQUE)    -- Login username
├── password             -- Encrypted password
├── role                 -- "student", "teacher", "admin"
├── phone                -- Contact number
├── profile_image        -- Photo URL
├── dob                  -- Date of birth
├── nationality          -- Country
├── nid_no               -- National ID
├── blood_group          -- A+, B-, O+, etc.
├── created_at           -- When account was created
└── updated_at           -- Last update time
```

### 🔍 Real Example:

| id | name | email | role | phone |
|----|------|-------|------|-------|
| 1 | Dr. Karim | karim@uni.edu | teacher | 01712345678 |
| 2 | Shakil Ahmed | shakil@uni.edu | student | 01812345678 |
| 3 | Admin User | admin@uni.edu | admin | 01912345678 |

## 🔐 The `sessions` Table

Tracks who is currently logged in.

```sql
sessions
├── id (PK)              -- Session identifier
├── user_id (FK)         -- Who is logged in → users.id
├── ip_address           -- From where
├── user_agent           -- Browser/device info
├── payload              -- Session data
└── last_activity        -- Last action time
```

### Why do we need sessions?
- Know who's online
- Security (auto-logout inactive users)
- Track login history

## 🏠 The `addresses` Table

Stores user address information.

```sql
addresses
├── id (PK)
├── user_id (FK)                    → users.id
├── present_division               -- Current: Dhaka, Chittagong, etc.
├── present_district
├── present_upazilla
├── present_area
├── permanent_division             -- Home address
├── permanent_district
├── permanent_upazilla
├── permanent_area
└── permanent_district_distance    -- Distance from university
```

### 🔗 Relationship Diagram:

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │    addresses    │
├─────────────────┤         ├─────────────────┤
│ id (PK)     ────┼────────▶│ user_id (FK)    │
│ name            │         │ present_division│
│ email           │   1:1   │ permanent_area  │
│ ...             │         │ ...             │
└─────────────────┘         └─────────────────┘

One user has ONE address (1:1 relationship)
```

---

# 7. Module 2: Academic Structure

## 🏛️ Understanding the Hierarchy

Universities are organized in levels:

```
🏫 University
    │
    ├── 📚 Faculty of Engineering
    │       ├── 💻 CSE Department
    │       │       ├── 🎓 B.Sc. in CSE (Degree)
    │       │       └── 🎓 M.Sc. in CSE (Degree)
    │       └── ⚡ EEE Department
    │               └── 🎓 B.Sc. in EEE (Degree)
    │
    └── 📚 Faculty of Science
            └── 🔬 Physics Department
                    └── 🎓 B.Sc. in Physics (Degree)
```

## 📋 The `faculties` Table

```sql
faculties
├── id (PK)
├── name            -- "Faculty of Engineering"
├── short_name      -- "FoE"
├── created_at
└── updated_at
```

**Example Data:**
| id | name | short_name |
|----|------|------------|
| 1 | Faculty of Engineering | FoE |
| 2 | Faculty of Science | FoS |
| 3 | Faculty of Business | FoB |

## 🏢 The `departments` Table

```sql
departments
├── id (PK)
├── name            -- "Computer Science & Engineering"
├── dept_code       -- "CSE"
├── faculty_id (FK) → faculties.id
├── created_at
└── updated_at
```

**Example Data:**
| id | name | dept_code | faculty_id |
|----|------|-----------|------------|
| 1 | Computer Science & Engineering | CSE | 1 |
| 2 | Electrical & Electronic Engineering | EEE | 1 |
| 3 | Physics | PHY | 2 |

## 🎓 The `degrees` Table

```sql
degrees
├── id (PK)
├── name              -- "Bachelor of Science in CSE"
├── faculty_id (FK)   → faculties.id
├── department_id (FK) → departments.id
├── credit_hours      -- "160"
├── duration_years    -- 4
├── created_at
└── updated_at
```

## 📅 Academic Sessions & Semesters

### `academic_sessions` Table
```sql
academic_sessions
├── id (PK)
├── session_name     -- "2024-2025"
├── start_date       -- 2024-01-01
├── end_date         -- 2025-12-31
├── is_active        -- true/false
├── created_at
└── updated_at
```

### `semesters` Table
```sql
semesters
├── id (PK)
├── academic_session_id (FK) → academic_sessions.id
├── name              -- "Fall 2024"
├── semester_number   -- 1, 2, 3...
├── start_date
├── end_date
├── is_active
├── created_at
└── updated_at
```

### 🔗 Relationship Diagram:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   faculties  │      │  departments │      │   degrees    │
├──────────────┤      ├──────────────┤      ├──────────────┤
│ id (PK)  ────┼─────▶│ faculty_id   │      │ faculty_id   │
│ name         │  1:N │ id (PK)  ────┼─────▶│ department_id│
│ short_name   │      │ name         │  1:N │ id (PK)      │
└──────────────┘      │ dept_code    │      │ name         │
                      └──────────────┘      │ credit_hours │
                                            └──────────────┘

One Faculty has MANY Departments (1:N)
One Department has MANY Degrees (1:N)
```

---

# 8. Module 3: Courses & Curriculum

## 📖 The `courses` Table

This is one of the most important tables!

```sql
courses
├── id (PK)
├── courseCode (UNIQUE)     -- "CSE101"
├── courseTitle             -- "Introduction to Programming"
├── department_id (FK)      → departments.id
├── degree_id (FK)          → degrees.id
├── credit                  -- 3.0
├── contactHourPerWeek      -- 3.0
├── level                   -- "1" (Year 1)
├── semester                -- "1" (Semester 1)
├── type                    -- "Theory" / "Lab" / "Project"
├── totalMarks              -- "100"
├── instructor              -- Main teacher name
├── prerequisites           -- "None" or "CSE100"
├── summary                 -- Course description
├── created_at
└── updated_at
```

### 🔍 Example:

| courseCode | courseTitle | credit | type | level |
|------------|-------------|--------|------|-------|
| CSE101 | Introduction to Programming | 3.0 | Theory | 1 |
| CSE102 | Programming Lab | 1.5 | Lab | 1 |
| CSE201 | Data Structures | 3.0 | Theory | 2 |

## 📚 Course Offerings

A course can be **offered multiple times** (different semesters, different sections).

```sql
course_offerings
├── id (PK)
├── course_id (FK)       → courses.id
├── semester_id (FK)     → semesters.id
├── section              -- "A", "B", "C"
├── max_students         -- 40
├── status               -- "active" / "closed"
├── created_at
└── updated_at
```

### 💡 Why separate courses and course_offerings?

```
Course (Template)                    Course Offering (Instance)
┌─────────────────────┐              ┌─────────────────────┐
│ CSE101              │              │ CSE101 - Fall 2024  │
│ Intro to Programming│    ─────▶    │ Section A, 40 seats │
│ 3 credits           │              │ Dr. Karim teaches   │
│                     │              ├─────────────────────┤
│                     │    ─────▶    │ CSE101 - Fall 2024  │
│                     │              │ Section B, 35 seats │
│                     │              │ Dr. Rahman teaches  │
└─────────────────────┘              └─────────────────────┘

One course can have MANY offerings!
```

## 🎯 Course Objectives (CO)

What the course **aims to teach**:

```sql
course_objectives
├── id (PK)
├── course_id (FK)     → courses.id
├── CO_ID              -- "CO1", "CO2"
├── CO_Description     -- "Understand basic programming concepts"
├── created_at
└── updated_at
```

### Example for CSE101:
| CO_ID | CO_Description |
|-------|----------------|
| CO1 | Understand fundamental programming concepts |
| CO2 | Learn problem-solving techniques |
| CO3 | Practice coding in Python |

## 🎓 Course Learning Outcomes (CLO)

What students **should be able to do** after the course:

```sql
course_learning_outcomes
├── id (PK)
├── course_id (FK)              → courses.id
├── CLO_ID                      -- "CLO1", "CLO2"
├── CLO_Description             -- "Write programs using loops"
├── bloom_taxonomy_level_id (FK) → bloom_taxonomy_levels.id
├── weight_percentage           -- 25.0 (25% of course grade)
├── target_attainment           -- 60.0 (60% students should achieve)
├── created_at
└── updated_at
```

### Example for CSE101:
| CLO_ID | Description | Bloom Level | Weight |
|--------|-------------|-------------|--------|
| CLO1 | Explain basic programming concepts | Understand (2) | 20% |
| CLO2 | Write programs using loops and conditionals | Apply (3) | 30% |
| CLO3 | Debug and fix code errors | Analyze (4) | 25% |
| CLO4 | Design solutions for simple problems | Create (6) | 25% |

## 📝 Weekly Lesson Plans

```sql
weekly_lesson_plans
├── id (PK)
├── course_id (FK)         → courses.id
├── weekNo                 -- "Week 1", "Week 2"
├── topics                 -- "Introduction to Variables"
├── specificOutcomes       -- "Students will understand variables"
├── teachingStrategy       -- "Lecture + Demo"
├── teachingAid            -- "Slides, IDE"
├── assessmentStrategy     -- "Quiz"
├── CLO_mapping            -- "CLO1"
├── created_at
└── updated_at
```

---

# 9. Module 4: The OBE Hierarchy (Most Important!)

## 🏆 Program Educational Objectives (PEO)

**Long-term goals** (3-5 years after graduation):

```sql
program_educational_objectives
├── id (PK)
├── degree_id (FK)      → degrees.id
├── PEO_No              -- "PEO1", "PEO2"
├── PEO_Description     -- "Graduates will be industry leaders"
├── created_at
└── updated_at
```

### Example PEOs for B.Sc. in CSE:
| PEO_No | Description |
|--------|-------------|
| PEO1 | Excel as software engineers in leading tech companies |
| PEO2 | Pursue higher education and research |
| PEO3 | Demonstrate leadership and ethical practices |
| PEO4 | Contribute to society through technology innovation |

## 📊 Program Learning Outcomes (PLO)

**What students achieve at graduation**:

```sql
program_learning_outcomes
├── id (PK)
├── degree_id (FK)              → degrees.id
├── programName                 -- "B.Sc. in CSE"
├── PLO_No                      -- "PLO1", "PLO2"
├── PLO_Description             -- "Apply engineering knowledge"
├── bloom_taxonomy_level_id (FK) → bloom_taxonomy_levels.id
├── target_attainment           -- 60.0 (60% target)
├── created_at
└── updated_at
```

### Standard PLOs (Based on Accreditation):
| PLO_No | Description | Bloom Level |
|--------|-------------|-------------|
| PLO1 | Engineering Knowledge | Apply (3) |
| PLO2 | Problem Analysis | Analyze (4) |
| PLO3 | Design/Development of Solutions | Create (6) |
| PLO4 | Investigation | Analyze (4) |
| PLO5 | Modern Tool Usage | Apply (3) |
| PLO6 | Engineer and Society | Evaluate (5) |
| PLO7 | Environment and Sustainability | Evaluate (5) |
| PLO8 | Ethics | Apply (3) |
| PLO9 | Individual and Teamwork | Apply (3) |
| PLO10 | Communication | Apply (3) |
| PLO11 | Project Management | Apply (3) |
| PLO12 | Lifelong Learning | Evaluate (5) |

## 🔗 The Mapping Tables

### PEO-PLO Mapping
```sql
peo_plo_mapping
├── id (PK)
├── peo_id (FK)          → program_educational_objectives.id
├── plo_id (FK)          → program_learning_outcomes.id
├── correlation_level    -- "High", "Medium", "Low"
├── created_at
└── updated_at
```

**Example Mapping Matrix:**
|       | PLO1 | PLO2 | PLO3 | PLO4 | PLO5 |
|-------|------|------|------|------|------|
| PEO1  | H    | H    | M    | L    | H    |
| PEO2  | M    | H    | M    | H    | L    |
| PEO3  | L    | L    | L    | L    | L    |

H = High correlation, M = Medium, L = Low

### CLO-PLO Mapping
```sql
course_learning_outcome_program_learning_outcome
├── id (PK)
├── course_learning_outcome_id (FK) → course_learning_outcomes.id
├── program_learning_outcome_id (FK) → program_learning_outcomes.id
├── mapping_level                   -- 1=Low, 2=Medium, 3=High
├── created_at
└── updated_at
```

### 📊 Visual Hierarchy:

```
┌─────────────────────────────────────────────────────────────────┐
│                           DEGREE                                 │
│                    (B.Sc. in CSE)                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│      PEO1       │  │      PEO2       │  │      PEO3       │
│ Industry Leader │  │ Higher Studies  │  │   Leadership    │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └──────────┬─────────┴─────────┬──────────┘
                    ▼                   ▼
         ┌─────────────────────────────────────────┐
         │           PLO1, PLO2, ... PLO12         │
         │        (12 Program Learning Outcomes)   │
         └──────────────────┬──────────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    ▼                       ▼                       ▼
┌────────┐            ┌────────┐            ┌────────┐
│ CSE101 │            │ CSE201 │            │ CSE301 │
│ CLO1-4 │            │ CLO1-5 │            │ CLO1-3 │
└────────┘            └────────┘            └────────┘

Each Course CLO maps to one or more PLOs
Each PLO maps to one or more PEOs
```

---

# 10. Module 5: Assessment & Examinations

## 📝 Assessment Types

```sql
assessment_types
├── id (PK)
├── name           -- "Quiz", "Midterm", "Final", etc.
├── category       -- "Continuous" or "Terminal"
├── description
├── created_at
└── updated_at
```

**Types of Assessment:**
| Name | Category | Description |
|------|----------|-------------|
| Quiz | Continuous | Short tests during semester |
| Assignment | Continuous | Homework and projects |
| Midterm | Terminal | Mid-semester exam |
| Final | Terminal | End-of-semester exam |
| Lab | Continuous | Practical work |
| Presentation | Continuous | Oral presentations |
| Project | Continuous | Semester projects |
| Viva | Terminal | Oral examination |

## 📋 Assessment Components

Specific assessments for a course offering:

```sql
assessment_components
├── id (PK)
├── course_offering_id (FK)  → course_offerings.id
├── assessment_type_id (FK)  → assessment_types.id
├── name                     -- "Quiz 1", "Midterm Exam"
├── total_marks              -- 20.0
├── weight_percentage        -- 10.0 (10% of total grade)
├── scheduled_date           -- 2024-03-15
├── duration_minutes         -- 30
├── instructions             -- "Closed book exam"
├── is_published             -- true/false
├── created_at
└── updated_at
```

### Example: CSE101 Fall 2024 Assessments
| Name | Type | Marks | Weight | Date |
|------|------|-------|--------|------|
| Quiz 1 | Quiz | 20 | 5% | Mar 15 |
| Quiz 2 | Quiz | 20 | 5% | Apr 10 |
| Assignment 1 | Assignment | 30 | 10% | Mar 20 |
| Midterm | Midterm | 50 | 25% | Apr 1 |
| Final | Final | 100 | 40% | Jun 15 |
| Lab Assessment | Lab | 30 | 15% | Ongoing |

## 🔗 Assessment-CLO Mapping

Links assessments to CLOs they measure:

```sql
assessment_clo_mapping
├── id (PK)
├── assessment_component_id (FK)    → assessment_components.id
├── course_learning_outcome_id (FK) → course_learning_outcomes.id
├── marks_allocated                 -- 15.0
├── weight_percentage               -- 50.0
├── created_at
└── updated_at
```

### Example:
| Assessment | CLO | Marks for this CLO |
|------------|-----|-------------------|
| Quiz 1 | CLO1 | 10 |
| Quiz 1 | CLO2 | 10 |
| Midterm | CLO1 | 10 |
| Midterm | CLO2 | 20 |
| Midterm | CLO3 | 20 |

## ❓ Questions Table

Individual exam questions:

```sql
questions
├── id (PK)
├── assessment_component_id (FK)  → assessment_components.id
├── question_number               -- "1a", "2", "3b"
├── question_text                 -- "Write a loop to print 1-10"
├── question_type                 -- "MCQ"/"Short"/"Descriptive"/"Problem"
├── marks                         -- 5.0
├── difficulty_level              -- "Easy"/"Medium"/"Hard"
├── bloom_taxonomy_level_id (FK)  → bloom_taxonomy_levels.id
├── created_at
└── updated_at
```

## 📊 Question-CLO Mapping

Each question measures specific CLOs:

```sql
question_clo_mapping
├── id (PK)
├── question_id (FK)                → questions.id
├── course_learning_outcome_id (FK) → course_learning_outcomes.id
├── marks_allocated                 -- 5.0
├── created_at
└── updated_at
```

### 🔗 The Assessment Flow:

```
Course Offering
      │
      ▼
┌─────────────────┐
│   Assessment    │
│   Components    │
│ (Quiz, Midterm) │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ Q1    │ │ Q2    │  ← Questions
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ CLO1  │ │ CLO2  │  ← CLO Mapping
│ CLO2  │ │ CLO3  │
└───────┘ └───────┘
```

---

# 11. Module 6: Results & Grading

## 📊 Grade Scale System

### `grade_scales` Table
```sql
grade_scales
├── id (PK)
├── name           -- "Standard 4.0 Scale"
├── is_active      -- true
├── created_at
└── updated_at
```

### `grade_points` Table
```sql
grade_points
├── id (PK)
├── grade_scale_id (FK)  → grade_scales.id
├── letter_grade         -- "A+", "A", "B+", etc.
├── grade_point          -- 4.0, 3.75, 3.50, etc.
├── min_percentage       -- 80.0
├── max_percentage       -- 100.0
├── remarks              -- "Outstanding"
├── created_at
└── updated_at
```

### Bangladesh University Standard:
| Letter Grade | Grade Point | Percentage | Remarks |
|-------------|-------------|------------|---------|
| A+ | 4.00 | 80-100 | Outstanding |
| A | 3.75 | 75-79 | Excellent |
| A- | 3.50 | 70-74 | Very Good |
| B+ | 3.25 | 65-69 | Good |
| B | 3.00 | 60-64 | Above Average |
| B- | 2.75 | 55-59 | Average |
| C+ | 2.50 | 50-54 | Below Average |
| C | 2.25 | 45-49 | Pass |
| D | 2.00 | 40-44 | Minimum Pass |
| F | 0.00 | 0-39 | Fail |

## 📝 Student Assessment Marks

```sql
student_assessment_marks
├── id (PK)
├── student_id (FK)             → students.id
├── assessment_component_id (FK) → assessment_components.id
├── marks_obtained              -- 18.5
├── is_absent                   -- false
├── is_exempted                 -- false
├── remarks                     -- "Good work"
├── evaluated_by (FK)           → users.id
├── evaluated_at
├── created_at
└── updated_at
```

### Example:
| Student | Assessment | Marks | Out of | Status |
|---------|------------|-------|--------|--------|
| Shakil | Quiz 1 | 18 | 20 | Present |
| Rahim | Quiz 1 | 15 | 20 | Present |
| Fatima | Quiz 1 | 0 | 20 | Absent |

## 📊 Course Results

Final grades for a course:

```sql
course_results
├── id (PK)
├── student_id (FK)         → students.id
├── course_offering_id (FK) → course_offerings.id
├── total_marks             -- 85.5
├── percentage              -- 85.5
├── grade_point_id (FK)     → grade_points.id
├── letter_grade            -- "A+"
├── grade_point             -- 4.00
├── credit_earned           -- 3.0
├── status                  -- "Pass"/"Fail"/"Incomplete"
├── is_published            -- true
├── remarks
├── created_at
└── updated_at
```

## 📈 Semester Results

```sql
semester_results
├── id (PK)
├── student_id (FK)          → students.id
├── semester_id (FK)         → semesters.id
├── total_credits_attempted  -- 18.0
├── total_credits_earned     -- 18.0
├── total_grade_points       -- 67.5
├── sgpa                     -- 3.75 (Semester GPA)
├── cgpa                     -- 3.68 (Cumulative GPA)
├── status                   -- "Regular"/"Dean's List"/"Probation"
├── is_published             -- true
├── created_at
└── updated_at
```

### 📊 GPA Calculation Example:

| Course | Credit | Grade | GP | Credit × GP |
|--------|--------|-------|-----|-------------|
| CSE101 | 3 | A+ | 4.00 | 12.00 |
| CSE102 | 1.5 | A | 3.75 | 5.625 |
| MAT101 | 3 | B+ | 3.25 | 9.75 |
| PHY101 | 3 | A- | 3.50 | 10.50 |
| **Total** | **10.5** | | | **37.875** |

**SGPA = 37.875 ÷ 10.5 = 3.607**

---

# 12. Module 7: OBE Attainment Tracking

## 🎯 What is Attainment?

**Attainment** = Did students achieve the learning outcomes?

- If target is **60%** of students should achieve CLO1
- And **65%** actually achieved it
- Then CLO1 is **attained** ✅

## 📊 Student CLO Attainment

Individual student's achievement for each CLO:

```sql
student_clo_attainment
├── id (PK)
├── student_id (FK)                  → students.id
├── course_offering_id (FK)          → course_offerings.id
├── course_learning_outcome_id (FK)  → course_learning_outcomes.id
├── total_marks_possible             -- 50.0
├── marks_obtained                   -- 42.0
├── attainment_percentage            -- 84.0
├── attainment_level                 -- "Exceeded"/"Met"/"Approaching"/"Not Met"
├── is_attained                      -- true
├── created_at
└── updated_at
```

### Example: Shakil's CLO Attainment in CSE101
| CLO | Possible | Obtained | % | Level | Attained? |
|-----|----------|----------|---|-------|-----------|
| CLO1 | 30 | 27 | 90% | Exceeded | ✅ |
| CLO2 | 40 | 32 | 80% | Met | ✅ |
| CLO3 | 20 | 10 | 50% | Not Met | ❌ |
| CLO4 | 10 | 8 | 80% | Met | ✅ |

## 📈 Course CLO Attainment Summary

Overall class performance for each CLO:

```sql
course_clo_attainment_summary
├── id (PK)
├── course_offering_id (FK)          → course_offerings.id
├── course_learning_outcome_id (FK)  → course_learning_outcomes.id
├── total_students                   -- 40
├── students_attained                -- 32
├── average_attainment_percentage    -- 75.5
├── attainment_rate                  -- 80.0 (32/40 = 80%)
├── target_attainment                -- 60.0
├── is_target_met                    -- true
├── created_at
└── updated_at
```

### Example: CSE101 Fall 2024 CLO Summary
| CLO | Students | Attained | Rate | Target | Met? |
|-----|----------|----------|------|--------|------|
| CLO1 | 40 | 36 | 90% | 60% | ✅ |
| CLO2 | 40 | 32 | 80% | 60% | ✅ |
| CLO3 | 40 | 20 | 50% | 60% | ❌ |
| CLO4 | 40 | 35 | 87.5% | 60% | ✅ |

## 🏆 Student PLO Attainment

Aggregated from all courses contributing to each PLO:

```sql
student_plo_attainment
├── id (PK)
├── student_id (FK)                   → students.id
├── program_learning_outcome_id (FK)  → program_learning_outcomes.id
├── semester_id (FK)                  → semesters.id
├── cumulative_attainment_percentage  -- 78.5
├── attainment_level                  -- "Met"
├── is_attained                       -- true
├── created_at
└── updated_at
```

### How PLO Attainment is Calculated:

```
PLO1 (Engineering Knowledge) is measured by:
├── CSE101 → CLO1 (mapping level: 3/High)
├── CSE201 → CLO2 (mapping level: 2/Medium)
├── MAT101 → CLO3 (mapping level: 2/Medium)
└── PHY101 → CLO1 (mapping level: 1/Low)

Weighted Average:
PLO1 Attainment = (CLO attainments × mapping weights) / total weight
```

## 📊 Attainment Thresholds

Define what "attained" means:

```sql
attainment_thresholds
├── id (PK)
├── degree_id (FK)      → degrees.id
├── threshold_type      -- "CLO"/"PLO"/"PEO"
├── level_name          -- "Exceeded"/"Met"/"Approaching"/"Not Met"
├── min_percentage      -- 80.0
├── max_percentage      -- 100.0
├── is_attained         -- true
├── created_at
└── updated_at
```

### Example Thresholds:
| Level | Min % | Max % | Attained? |
|-------|-------|-------|-----------|
| Exceeded | 80 | 100 | ✅ |
| Met | 60 | 79 | ✅ |
| Approaching | 40 | 59 | ❌ |
| Not Met | 0 | 39 | ❌ |

---

# 13. Module 8: Surveys & Feedback

## 📋 Why Surveys?

Surveys provide **indirect assessment** - student perceptions of their learning.

## 📝 The `surveys` Table

```sql
surveys
├── id (PK)
├── title                    -- "CSE101 Course Exit Survey"
├── survey_type              -- "Course Exit"/"Graduate Exit"/"Alumni"/"Employer"
├── degree_id (FK)           → degrees.id
├── course_offering_id (FK)  → course_offerings.id (nullable)
├── start_date
├── end_date
├── is_active                -- true
├── is_anonymous             -- true
├── created_by (FK)          → users.id
├── created_at
└── updated_at
```

### Survey Types:
| Type | Purpose | Timing |
|------|---------|--------|
| Course Exit | Student feedback on course | End of course |
| Graduate Exit | Feedback from graduating students | Graduation |
| Alumni | Feedback from former students | 1-5 years after |
| Employer | Feedback from employers | Ongoing |

## ❓ Survey Questions

```sql
survey_questions
├── id (PK)
├── survey_id (FK)        → surveys.id
├── question_text         -- "I can now write programs using loops"
├── question_type         -- "Likert"/"Text"/"MCQ"/"Rating"
├── is_required           -- true
├── order                 -- 1, 2, 3...
├── clo_id (FK)           → course_learning_outcomes.id (nullable)
├── plo_id (FK)           → program_learning_outcomes.id (nullable)
├── created_at
└── updated_at
```

### Example Questions for Course Exit Survey:
| # | Question | Type | Maps to |
|---|----------|------|---------|
| 1 | I can explain basic programming concepts | Likert | CLO1 |
| 2 | I can write programs using loops | Likert | CLO2 |
| 3 | I can debug code effectively | Likert | CLO3 |
| 4 | What was the best part of this course? | Text | - |
| 5 | Overall course rating | Rating (1-5) | - |

## 📊 Survey Responses & Answers

```sql
survey_responses
├── id (PK)
├── survey_id (FK)        → surveys.id
├── respondent_id (FK)    → users.id (nullable if anonymous)
├── respondent_type       -- "Student"/"Alumni"/"Employer"
├── submitted_at
├── created_at
└── updated_at

survey_answers
├── id (PK)
├── survey_response_id (FK)  → survey_responses.id
├── survey_question_id (FK)  → survey_questions.id
├── answer_text              -- For text questions
├── rating_value             -- 1-5 for Likert/Rating
├── created_at
└── updated_at
```

## 📈 Indirect Attainment Results

Calculated from survey responses:

```sql
indirect_attainment_results
├── id (PK)
├── survey_id (FK)          → surveys.id
├── outcome_type            -- "CLO"/"PLO"
├── outcome_id              -- References CLO or PLO id
├── average_rating          -- 4.2 (out of 5)
├── attainment_percentage   -- 84.0 (4.2/5 × 100)
├── total_responses         -- 35
├── created_at
└── updated_at
```

---

# 14. Module 9: Continuous Improvement

## 🔄 The Improvement Cycle

OBE requires continuous improvement:

```
┌────────────────────────────────────────────────────────┐
│                  IMPROVEMENT CYCLE                      │
│                                                         │
│    ┌─────────┐      ┌─────────┐      ┌─────────┐      │
│    │ ASSESS  │ ──▶  │ ANALYZE │ ──▶  │  PLAN   │      │
│    │         │      │  GAPS   │      │ ACTIONS │      │
│    └─────────┘      └─────────┘      └────┬────┘      │
│         ▲                                  │           │
│         │                                  ▼           │
│    ┌─────────┐                       ┌─────────┐      │
│    │ MEASURE │ ◀─────────────────── │IMPLEMENT│      │
│    │ RESULTS │                       │         │      │
│    └─────────┘                       └─────────┘      │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## 📝 Action Plans

When a CLO/PLO is not attained, create an action plan:

```sql
action_plans
├── id (PK)
├── degree_id (FK)            → degrees.id
├── course_offering_id (FK)   → course_offerings.id (nullable)
├── academic_session_id (FK)  → academic_sessions.id
├── outcome_type              -- "CLO"/"PLO"
├── outcome_id                -- Which CLO/PLO failed
├── identified_gap            -- "Students struggle with recursion"
├── root_cause                -- "Insufficient practice problems"
├── proposed_action           -- "Add 5 more lab exercises on recursion"
├── responsible_person (FK)   → users.id
├── target_date               -- 2024-09-01
├── status                    -- "Planned"/"In Progress"/"Completed"
├── created_at
└── updated_at
```

### Example Action Plan:
| Field | Value |
|-------|-------|
| Course | CSE101 |
| CLO | CLO3 (Debug code) |
| Gap | Only 50% attainment (target: 60%) |
| Root Cause | Not enough hands-on debugging practice |
| Action | Add debugging workshop + more debugging assignments |
| Responsible | Dr. Karim |
| Target Date | Next semester |
| Status | Planned |

## 📊 Action Plan Outcomes

Track if the action worked:

```sql
action_plan_outcomes
├── id (PK)
├── action_plan_id (FK)         → action_plans.id
├── outcome_description         -- "Implemented debugging workshop"
├── improvement_achieved        -- "CLO3 attainment increased"
├── new_attainment_percentage   -- 72.0 (was 50%, now 72%)
├── verified_by (FK)            → users.id
├── verified_at
├── created_at
└── updated_at
```

## 🔄 OBE Review Cycles

Regular review periods:

```sql
obe_review_cycles
├── id (PK)
├── degree_id (FK)      → degrees.id
├── cycle_name          -- "Annual Review 2024"
├── start_date
├── end_date
├── review_type         -- "Annual"/"Biennial"/"Accreditation"
├── status              -- "Planned"/"Ongoing"/"Completed"
├── summary_report      -- Detailed findings
├── created_at
└── updated_at
```

---

# 15. Practice Exercises

## Exercise 1: Basic Understanding

**Question:** Identify the relationship type between these tables:
1. `users` and `addresses` - ?
2. `faculties` and `departments` - ?
3. `courses` and `course_learning_outcomes` - ?
4. `students` and `courses` (through enrollments) - ?

<details>
<summary>Click for Answer</summary>

1. **One-to-One (1:1)** - Each user has one address
2. **One-to-Many (1:N)** - One faculty has many departments
3. **One-to-Many (1:N)** - One course has many CLOs
4. **Many-to-Many (M:N)** - Many students can enroll in many courses

</details>

---

## Exercise 2: Trace the Path

**Question:** Trace how a quiz mark contributes to PLO attainment:

Quiz Mark → ? → ? → ? → PLO Attainment

<details>
<summary>Click for Answer</summary>

```
Quiz Mark (student_assessment_marks)
    ↓
Question Marks (student_question_marks)
    ↓
Question-CLO Mapping (question_clo_mapping)
    ↓
Student CLO Attainment (student_clo_attainment)
    ↓
CLO-PLO Mapping (clo_plo_mapping)
    ↓
Student PLO Attainment (student_plo_attainment)
```

</details>

---

## Exercise 3: Design a Query Scenario

**Scenario:** You want to find all students who:
- Are in the CSE department
- Have not attained CLO3 of CSE101
- Have CGPA above 3.0

**Question:** Which tables would you need to join?

<details>
<summary>Click for Answer</summary>

Tables needed:
1. `students` - For department and basic info
2. `cgpas` - For CGPA filter
3. `course_enrollments` - To find CSE101 enrollment
4. `course_offerings` - To identify CSE101 offering
5. `courses` - To filter by course code
6. `student_clo_attainment` - For CLO3 attainment status
7. `course_learning_outcomes` - To identify CLO3

</details>

---

## Exercise 4: Calculate SGPA

**Given:**
| Course | Credit | Letter Grade |
|--------|--------|--------------|
| CSE201 | 3 | A (3.75) |
| CSE202 | 1.5 | A+ (4.00) |
| MAT201 | 3 | B+ (3.25) |
| HUM201 | 2 | A- (3.50) |

**Calculate the SGPA:**

<details>
<summary>Click for Answer</summary>

| Course | Credit | GP | Credit × GP |
|--------|--------|-----|-------------|
| CSE201 | 3 | 3.75 | 11.25 |
| CSE202 | 1.5 | 4.00 | 6.00 |
| MAT201 | 3 | 3.25 | 9.75 |
| HUM201 | 2 | 3.50 | 7.00 |
| **Total** | **9.5** | | **34.00** |

**SGPA = 34.00 ÷ 9.5 = 3.58**

</details>

---

## Exercise 5: OBE Mapping

**Given CLO:**
> "CLO2: Students will be able to **implement** sorting algorithms in Python"

**Questions:**
1. What Bloom's Taxonomy level is this?
2. Which PLO might this map to?
3. What assessment type would best measure this?

<details>
<summary>Click for Answer</summary>

1. **Bloom's Level: 3 (Apply)** - "Implement" is an application-level verb
2. **Likely maps to:**
   - PLO1 (Engineering Knowledge)
   - PLO3 (Design/Development of Solutions)
   - PLO5 (Modern Tool Usage)
3. **Best assessments:**
   - Lab practical exam
   - Programming assignment
   - Project with coding component

</details>

---

# 16. Quick Reference Cheat Sheet

## 🔑 Key Acronyms

| Acronym | Full Form | Meaning |
|---------|-----------|---------|
| OBE | Outcome Based Education | Education focused on outcomes |
| PEO | Program Educational Objectives | Long-term career goals |
| PLO | Program Learning Outcomes | Graduation competencies |
| CLO | Course Learning Outcomes | Course-level competencies |
| CO | Course Objectives | What the course aims to teach |
| SGPA | Semester Grade Point Average | Semester performance |
| CGPA | Cumulative Grade Point Average | Overall performance |
| PK | Primary Key | Unique identifier |
| FK | Foreign Key | Links to another table |

## 📊 Table Count by Category

```
Users & Auth ............... 4 tables
Personal Info .............. 2 tables
Academic Structure ......... 5 tables
Courses & Curriculum ....... 7 tables
OBE Mapping ................ 6 tables
Assessment ................. 5 tables
Rubrics .................... 3 tables
Results & Marks ............ 8 tables
Attainment Tracking ........ 8 tables
Surveys & Feedback ......... 5 tables
Continuous Improvement ..... 3 tables
Teachers ................... 3 tables
Halls & Accommodation ...... 4 tables
Reports & Audit ............ 3 tables
─────────────────────────────────
TOTAL ..................... 66 tables
```

## 🔗 Key Relationships

```
users ─┬─▶ students ──▶ course_enrollments ──▶ course_offerings
       │
       └─▶ teachers ──▶ teacher_course ───────────────┘
                                                       │
faculties ──▶ departments ──▶ degrees ──▶ courses ────┘
                                 │
                                 └──▶ PLOs ──▶ PEOs
                                       ▲
courses ──▶ CLOs ──────────────────────┘
              │
              └──▶ assessments ──▶ questions ──▶ student_marks
                                                      │
                                                      └──▶ attainment
```

## 📝 Bloom's Taxonomy Quick Reference

| Level | Name | Key Verbs |
|-------|------|-----------|
| 1 | Remember | List, Define, Recall, State |
| 2 | Understand | Explain, Describe, Summarize |
| 3 | Apply | Implement, Use, Execute, Solve |
| 4 | Analyze | Compare, Contrast, Examine |
| 5 | Evaluate | Judge, Critique, Justify |
| 6 | Create | Design, Develop, Produce |

## ✅ Attainment Calculation Formula

```
CLO Attainment % = (Marks Obtained for CLO / Total Possible for CLO) × 100

Attainment Rate = (Students who attained / Total Students) × 100

Target Met? = Attainment Rate ≥ Target Attainment %
```

---

## 🎉 Congratulations!

You've completed the OBE Database Tutorial! You now understand:

- ✅ Database fundamentals (tables, keys, relationships)
- ✅ Academic structure (faculty → department → degree)
- ✅ OBE hierarchy (PEO → PLO → CLO)
- ✅ Assessment and grading systems
- ✅ Attainment tracking and calculation
- ✅ Continuous improvement process

**Next Steps:**
1. Review the main [database.md](database.md) for complete table definitions
2. Check [er_diagrams.md](er_diagrams.md) for visual relationships
3. Practice writing queries against this schema
4. Try implementing this in your preferred database (MySQL, PostgreSQL, etc.)

---

> 💡 **Tip:** Keep this tutorial handy while working on your project. Understanding the "why" behind each table makes implementation much easier!

---

*Created for university project learning purposes*
*Last updated: January 2026*
