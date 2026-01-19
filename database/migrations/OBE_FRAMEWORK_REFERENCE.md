# OBE Framework Tables - Quick Reference

## 📋 Table Overview

### 1. bloom_taxonomy_levels
Stores the 6 cognitive levels of Bloom's Taxonomy.

**Key Fields:**
- `level_number` (1-6)
- `name` (Remember, Understand, Apply, Analyze, Evaluate, Create)
- `keywords` (Action verbs for each level)

**Usage:** Referenced by CLOs and PLOs to indicate cognitive complexity

---

### 2. program_educational_objectives (PEOs)
Broad statements describing what graduates should achieve 3-5 years after graduation.

**Key Fields:**
- `degree_id` → degrees
- `PEO_No` (e.g., PEO1, PEO2)
- `PEO_Description`

**Example:** "Graduates will have successful careers in computer science"

---

### 3. program_learning_outcomes (PLOs)
Knowledge, skills, and attitudes students should acquire by graduation.

**Key Fields:**
- `degree_id` → degrees
- `PLO_No` (e.g., PLO1, PLO2)
- `PLO_Description`
- `bloom_taxonomy_level_id` → bloom_taxonomy_levels
- `target_attainment` (e.g., 60% of students should achieve)

**Example:** "Apply knowledge of computing and mathematics to solve complex problems"

---

### 4. peo_plo_mapping
Shows how PLOs support PEOs (many-to-many relationship).

**Key Fields:**
- `peo_id` → program_educational_objectives
- `plo_id` → program_learning_outcomes
- `correlation_level` (High/Medium/Low)

**Purpose:** Demonstrates alignment between long-term objectives and program outcomes

---

### 5. course_learning_outcome_program_learning_outcome
Maps individual course outcomes to program-level outcomes.

**Key Fields:**
- `course_learning_outcome_id` → course_learning_outcomes
- `program_learning_outcome_id` → program_learning_outcomes
- `mapping_level` (1=Low, 2=Medium, 3=High)

**Purpose:** Shows how each course contributes to achieving program outcomes

---

### 6. clo_co_mapping
Links Course Learning Outcomes to Course Objectives.

**Key Fields:**
- `course_learning_outcome_id` → course_learning_outcomes
- `course_objective_id` → course_objectives

**Purpose:** Aligns measurable outcomes with stated objectives

---

## 🔄 OBE Hierarchy Flow

```
┌─────────────────────────────────────────┐
│  PEO (Program Educational Objectives)   │
│  "What graduates achieve in 3-5 years"  │
└──────────────┬──────────────────────────┘
               │ peo_plo_mapping
               │ (High/Medium/Low)
               ↓
┌─────────────────────────────────────────┐
│  PLO (Program Learning Outcomes)        │
│  "What students learn by graduation"    │
│  + Bloom Level + Target Attainment      │
└──────────────┬──────────────────────────┘
               │ course_learning_outcome_
               │ program_learning_outcome
               │ (1/2/3 mapping strength)
               ↓
┌─────────────────────────────────────────┐
│  CLO (Course Learning Outcomes)         │
│  "What students achieve in this course" │
└──────────────┬──────────────────────────┘
               │ clo_co_mapping
               ↓
┌─────────────────────────────────────────┐
│  CO (Course Objectives)                 │
│  "What the course aims to teach"        │
└─────────────────────────────────────────┘
```

---

## 📊 Bloom's Taxonomy Reference

| Level | Name | Sample Keywords | Use For |
|-------|------|-----------------|---------|
| 1 | Remember | define, list, recall | Basic recall |
| 2 | Understand | explain, describe, discuss | Comprehension |
| 3 | Apply | solve, implement, execute | Problem-solving |
| 4 | Analyze | compare, examine, differentiate | Critical thinking |
| 5 | Evaluate | judge, critique, defend | Assessment |
| 6 | Create | design, develop, construct | Innovation |

---

## 🔍 Common Queries

### Get All PLOs for a Degree
```sql
SELECT plo.PLO_No, plo.PLO_Description, btl.name AS bloom_level
FROM program_learning_outcomes plo
LEFT JOIN bloom_taxonomy_levels btl ON plo.bloom_taxonomy_level_id = btl.id
WHERE plo.degree_id = ?
ORDER BY plo.PLO_No;
```

### Get PEO-PLO Relationships
```sql
SELECT 
    peo.PEO_No,
    peo.PEO_Description,
    plo.PLO_No,
    plo.PLO_Description,
    ppm.correlation_level
FROM peo_plo_mapping ppm
JOIN program_educational_objectives peo ON ppm.peo_id = peo.id
JOIN program_learning_outcomes plo ON ppm.plo_id = plo.id
WHERE peo.degree_id = ?
ORDER BY peo.PEO_No, plo.PLO_No;
```

### Get Course-to-Program Alignment
```sql
SELECT 
    c.courseCode,
    c.courseTitle,
    clo.CLO_ID,
    plo.PLO_No,
    clpm.mapping_level,
    CASE 
        WHEN clpm.mapping_level = 1 THEN 'Low'
        WHEN clpm.mapping_level = 2 THEN 'Medium'
        WHEN clpm.mapping_level = 3 THEN 'High'
    END AS strength
FROM course_learning_outcome_program_learning_outcome clpm
JOIN course_learning_outcomes clo ON clpm.course_learning_outcome_id = clo.id
JOIN courses c ON clo.course_id = c.id
JOIN program_learning_outcomes plo ON clpm.program_learning_outcome_id = plo.id
WHERE c.id = ?;
```

---

## ✅ Validation Checklist

- [x] All 6 tables created successfully
- [x] Foreign key relationships established
- [x] Unique constraints prevent duplicates
- [x] Check constraints validate data
- [x] Cascade delete works properly
- [x] Bloom's Taxonomy data pre-populated
- [x] Test data inserted and verified
- [x] All 11 tests passed

---

## 🎯 Best Practices

1. **Define PEOs First**
   - Broad, long-term career objectives
   - Typically 3-5 PEOs per program

2. **Create PLOs**
   - Specific, measurable outcomes
   - Map to appropriate Bloom level
   - Set realistic target attainments (60-70%)

3. **Map PEOs to PLOs**
   - Each PEO should be supported by multiple PLOs
   - Use High correlation for direct support

4. **Link CLOs to PLOs**
   - Each course should contribute to 2-4 PLOs
   - Use mapping strength to indicate contribution level

5. **Align CLOs with COs**
   - Outcomes (CLOs) should align with Objectives (COs)
   - Multiple CLOs can map to one CO

---

## 📞 Support

For questions about OBE framework implementation:
- Review ER diagrams in `er_diagrams.md`
- See full schema in `database.md`
- Check completion document `STEP_2.5_COMPLETION.md`
