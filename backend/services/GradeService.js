const pool = require('../config/database');

/**
 * GradeService - Handles grade calculations and conversions
 */
class GradeService {
  /**
   * Calculate final grade for a student in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Grade calculation result
   */
  async calculateFinalGrade(studentId, courseOfferingId) {
    try {
      // Get all assessments for this course offering
      const [assessments] = await pool.query(`
        SELECT 
          a.assessment_id,
          a.assessment_title,
          a.assessment_type_id,
          a.total_marks,
          a.weightage,
          at.type_name
        FROM assessments a
        INNER JOIN assessment_types at ON a.assessment_type_id = at.assessment_type_id
        WHERE a.course_offering_id = ?
        ORDER BY a.assessment_date
      `, [courseOfferingId]);

      if (assessments.length === 0) {
        return { 
          success: false, 
          message: 'No assessments found for this course offering' 
        };
      }

      let totalWeightedMarks = 0;
      let totalWeightage = 0;
      const assessmentDetails = [];

      for (const assessment of assessments) {
        // Get all questions for this assessment
        const [questions] = await pool.query(`
          SELECT question_id, max_marks
          FROM questions
          WHERE assessment_id = ?
        `, [assessment.assessment_id]);

        let totalObtained = 0;
        let totalPossible = 0;

        for (const question of questions) {
          // Get student's marks for this question
          const [marks] = await pool.query(`
            SELECT obtained_marks
            FROM marks
            WHERE question_id = ? AND student_id = ?
          `, [question.question_id, studentId]);

          totalPossible += question.max_marks;
          totalObtained += marks.length > 0 ? (marks[0].obtained_marks || 0) : 0;
        }

        // Calculate percentage and apply weightage
        const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
        const weightedScore = (percentage * assessment.weightage) / 100;

        totalWeightedMarks += weightedScore;
        totalWeightage += assessment.weightage;

        assessmentDetails.push({
          assessment_id: assessment.assessment_id,
          assessment_title: assessment.assessment_title,
          type: assessment.type_name,
          obtained: totalObtained,
          total: totalPossible,
          percentage: percentage,
          weightage: assessment.weightage,
          weighted_score: weightedScore
        });
      }

      // Calculate final percentage
      const finalPercentage = totalWeightage > 0 ? totalWeightedMarks : 0;

      // Get letter grade and GPA
      const gradeInfo = await this.getLetterGrade(finalPercentage);

      // Save course result
      await this.saveCourseResult(studentId, courseOfferingId, {
        total_marks: finalPercentage,
        percentage: finalPercentage,
        letter_grade: gradeInfo.grade,
        grade_points: gradeInfo.gradePoints
      });

      return {
        success: true,
        data: {
          student_id: studentId,
          course_offering_id: courseOfferingId,
          assessments: assessmentDetails,
          final_percentage: finalPercentage,
          letter_grade: gradeInfo.grade,
          grade_points: gradeInfo.gradePoints,
          remarks: gradeInfo.remarks
        }
      };
    } catch (error) {
      console.error('Error calculating final grade:', error);
      throw error;
    }
  }

  /**
   * Get letter grade based on percentage
   * @param {number} percentage - Percentage score
   * @returns {Promise<Object>} Grade information
   */
  async getLetterGrade(percentage) {
    try {
      const [grades] = await pool.query(`
        SELECT 
          gp.grade,
          gp.grade_points,
          gp.remarks,
          gs.min_percentage,
          gs.max_percentage
        FROM grade_scales gs
        INNER JOIN grade_points gp ON gs.grade_point_id = gp.grade_point_id
        WHERE ? >= gs.min_percentage AND ? <= gs.max_percentage
        ORDER BY gs.min_percentage DESC
        LIMIT 1
      `, [percentage, percentage]);

      if (grades.length > 0) {
        return {
          grade: grades[0].grade,
          gradePoints: grades[0].grade_points,
          remarks: grades[0].remarks
        };
      }

      // Default to F if no matching grade found
      return {
        grade: 'F',
        gradePoints: 0.0,
        remarks: 'Fail'
      };
    } catch (error) {
      console.error('Error getting letter grade:', error);
      return {
        grade: 'F',
        gradePoints: 0.0,
        remarks: 'Error'
      };
    }
  }

  /**
   * Save course result to database
   */
  async saveCourseResult(studentId, courseOfferingId, gradeData) {
    try {
      await pool.query(`
        INSERT INTO course_results
        (student_id, course_offering_id, total_marks, percentage, letter_grade, grade_points)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_marks = VALUES(total_marks),
          percentage = VALUES(percentage),
          letter_grade = VALUES(letter_grade),
          grade_points = VALUES(grade_points),
          updated_at = CURRENT_TIMESTAMP
      `, [
        studentId,
        courseOfferingId,
        gradeData.total_marks,
        gradeData.percentage,
        gradeData.letter_grade,
        gradeData.grade_points
      ]);
    } catch (error) {
      console.error('Error saving course result:', error);
      throw error;
    }
  }

  /**
   * Calculate semester GPA for a student
   * @param {number} studentId - Student ID
   * @param {number} semesterId - Semester ID
   * @returns {Promise<Object>} GPA calculation result
   */
  async calculateSemesterGPA(studentId, semesterId) {
    try {
      // Get all course enrollments for this semester
      const [enrollments] = await pool.query(`
        SELECT 
          ce.course_offering_id,
          co.course_id,
          c.course_code,
          c.course_name,
          c.credit_hours,
          cr.grade_points,
          cr.letter_grade
        FROM course_enrollments ce
        INNER JOIN course_offerings co ON ce.course_offering_id = co.course_offering_id
        INNER JOIN courses c ON co.course_id = c.course_id
        LEFT JOIN course_results cr ON ce.student_id = cr.student_id 
          AND ce.course_offering_id = cr.course_offering_id
        WHERE ce.student_id = ? AND co.semester_id = ?
      `, [studentId, semesterId]);

      if (enrollments.length === 0) {
        return { 
          success: false, 
          message: 'No enrollments found for this semester' 
        };
      }

      let totalGradePoints = 0;
      let totalCreditHours = 0;
      const courseResults = [];

      for (const enrollment of enrollments) {
        if (enrollment.grade_points !== null) {
          const weightedPoints = enrollment.grade_points * enrollment.credit_hours;
          totalGradePoints += weightedPoints;
          totalCreditHours += enrollment.credit_hours;

          courseResults.push({
            course_code: enrollment.course_code,
            course_name: enrollment.course_name,
            credit_hours: enrollment.credit_hours,
            letter_grade: enrollment.letter_grade,
            grade_points: enrollment.grade_points
          });
        }
      }

      const semesterGPA = totalCreditHours > 0 
        ? (totalGradePoints / totalCreditHours).toFixed(2)
        : 0;

      // Save semester result
      await this.saveSemesterResult(studentId, semesterId, {
        total_credit_hours: totalCreditHours,
        gpa: semesterGPA
      });

      return {
        success: true,
        data: {
          student_id: studentId,
          semester_id: semesterId,
          courses: courseResults,
          total_credit_hours: totalCreditHours,
          semester_gpa: parseFloat(semesterGPA)
        }
      };
    } catch (error) {
      console.error('Error calculating semester GPA:', error);
      throw error;
    }
  }

  /**
   * Save semester result to database
   */
  async saveSemesterResult(studentId, semesterId, resultData) {
    try {
      await pool.query(`
        INSERT INTO semester_results
        (student_id, semester_id, total_credit_hours, gpa)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_credit_hours = VALUES(total_credit_hours),
          gpa = VALUES(gpa),
          updated_at = CURRENT_TIMESTAMP
      `, [
        studentId,
        semesterId,
        resultData.total_credit_hours,
        resultData.gpa
      ]);
    } catch (error) {
      console.error('Error saving semester result:', error);
      throw error;
    }
  }

  /**
   * Calculate cumulative CGPA for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} CGPA calculation result
   */
  async calculateCGPA(studentId) {
    try {
      // Get all semester results
      const [semesters] = await pool.query(`
        SELECT 
          sr.semester_id,
          s.semester_name,
          sr.total_credit_hours,
          sr.gpa
        FROM semester_results sr
        INNER JOIN semesters s ON sr.semester_id = s.semester_id
        WHERE sr.student_id = ?
        ORDER BY s.semester_name
      `, [studentId]);

      if (semesters.length === 0) {
        return { 
          success: false, 
          message: 'No semester results found for this student' 
        };
      }

      let totalWeightedGPA = 0;
      let totalCreditHours = 0;

      for (const semester of semesters) {
        totalWeightedGPA += semester.gpa * semester.total_credit_hours;
        totalCreditHours += semester.total_credit_hours;
      }

      const cgpa = totalCreditHours > 0 
        ? (totalWeightedGPA / totalCreditHours).toFixed(2)
        : 0;

      return {
        success: true,
        data: {
          student_id: studentId,
          semesters: semesters,
          total_credit_hours: totalCreditHours,
          cgpa: parseFloat(cgpa)
        }
      };
    } catch (error) {
      console.error('Error calculating CGPA:', error);
      throw error;
    }
  }

  /**
   * Get grade distribution for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Grade distribution
   */
  async getGradeDistribution(courseOfferingId) {
    try {
      const [distribution] = await pool.query(`
        SELECT 
          letter_grade,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM course_results WHERE course_offering_id = ?)), 2) as percentage
        FROM course_results
        WHERE course_offering_id = ?
        GROUP BY letter_grade
        ORDER BY letter_grade
      `, [courseOfferingId, courseOfferingId]);

      // Get statistics
      const [stats] = await pool.query(`
        SELECT 
          COUNT(*) as total_students,
          ROUND(AVG(percentage), 2) as avg_percentage,
          ROUND(MAX(percentage), 2) as max_percentage,
          ROUND(MIN(percentage), 2) as min_percentage,
          ROUND(AVG(grade_points), 2) as avg_gpa
        FROM course_results
        WHERE course_offering_id = ?
      `, [courseOfferingId]);

      return {
        success: true,
        data: {
          course_offering_id: courseOfferingId,
          distribution: distribution,
          statistics: stats[0]
        }
      };
    } catch (error) {
      console.error('Error getting grade distribution:', error);
      throw error;
    }
  }

  /**
   * Batch calculate grades for all students in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Batch calculation result
   */
  async batchCalculateGrades(courseOfferingId) {
    try {
      // Get all enrolled students
      const [students] = await pool.query(`
        SELECT DISTINCT s.student_id, s.registration_no, s.full_name
        FROM students s
        INNER JOIN course_enrollments ce ON s.student_id = ce.student_id
        WHERE ce.course_offering_id = ?
      `, [courseOfferingId]);

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const student of students) {
        try {
          const gradeResult = await this.calculateFinalGrade(
            student.student_id,
            courseOfferingId
          );

          if (gradeResult.success) {
            successCount++;
            results.push({
              student_id: student.student_id,
              registration_no: student.registration_no,
              full_name: student.full_name,
              success: true,
              grade: gradeResult.data.letter_grade,
              percentage: gradeResult.data.final_percentage
            });
          } else {
            failCount++;
            results.push({
              student_id: student.student_id,
              registration_no: student.registration_no,
              full_name: student.full_name,
              success: false,
              error: gradeResult.message
            });
          }
        } catch (error) {
          failCount++;
          results.push({
            student_id: student.student_id,
            registration_no: student.registration_no,
            full_name: student.full_name,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        data: {
          course_offering_id: courseOfferingId,
          total_students: students.length,
          success_count: successCount,
          fail_count: failCount,
          results: results
        }
      };
    } catch (error) {
      console.error('Error in batch grade calculation:', error);
      throw error;
    }
  }
}

module.exports = new GradeService();
