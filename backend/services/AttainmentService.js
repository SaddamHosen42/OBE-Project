const pool = require('../config/database');

/**
 * AttainmentService - Handles CLO and PLO attainment calculations
 */
class AttainmentService {
  /**
   * Calculate CLO attainment for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} CLO attainment results
   */
  async calculateCLOAttainment(courseOfferingId) {
    try {
      // Get all CLOs for this course offering
      const [clos] = await pool.query(`
        SELECT clo.clo_id, clo.clo_code, clo.clo_description
        FROM course_learning_outcomes clo
        INNER JOIN course_offerings co ON clo.course_id = co.course_id
        WHERE co.course_offering_id = ?
        ORDER BY clo.clo_code
      `, [courseOfferingId]);

      if (clos.length === 0) {
        return { success: false, message: 'No CLOs found for this course offering' };
      }

      // Get attainment threshold
      const [thresholds] = await pool.query(`
        SELECT passing_percentage
        FROM attainment_thresholds
        WHERE is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
      `);

      const threshold = thresholds.length > 0 ? thresholds[0].passing_percentage : 50;

      const cloAttainments = [];

      for (const clo of clos) {
        // Calculate direct attainment (from assessments)
        const directAttainment = await this.calculateDirectCLOAttainment(
          courseOfferingId,
          clo.clo_id,
          threshold
        );

        // Calculate indirect attainment (from surveys)
        const indirectAttainment = await this.calculateIndirectCLOAttainment(
          courseOfferingId,
          clo.clo_id
        );

        // Combine direct (80%) and indirect (20%) attainment
        const combinedAttainment = (directAttainment * 0.8) + (indirectAttainment * 0.2);

        cloAttainments.push({
          clo_id: clo.clo_id,
          clo_code: clo.clo_code,
          clo_description: clo.clo_description,
          direct_attainment: directAttainment,
          indirect_attainment: indirectAttainment,
          combined_attainment: combinedAttainment,
          is_attained: combinedAttainment >= threshold
        });

        // Save to database
        await this.saveCLOAttainment(courseOfferingId, clo.clo_id, {
          direct_attainment: directAttainment,
          indirect_attainment: indirectAttainment,
          combined_attainment: combinedAttainment,
          threshold: threshold
        });
      }

      return {
        success: true,
        data: {
          course_offering_id: courseOfferingId,
          threshold: threshold,
          clo_attainments: cloAttainments
        }
      };
    } catch (error) {
      console.error('Error calculating CLO attainment:', error);
      throw error;
    }
  }

  /**
   * Calculate direct CLO attainment from assessment marks
   * @param {number} courseOfferingId 
   * @param {number} cloId 
   * @param {number} threshold 
   * @returns {Promise<number>} Direct attainment percentage
   */
  async calculateDirectCLOAttainment(courseOfferingId, cloId, threshold) {
    try {
      // Get all questions mapped to this CLO
      const [questions] = await pool.query(`
        SELECT DISTINCT q.question_id, q.max_marks
        FROM questions q
        INNER JOIN assessments a ON q.assessment_id = a.assessment_id
        WHERE a.course_offering_id = ? AND q.clo_id = ?
      `, [courseOfferingId, cloId]);

      if (questions.length === 0) {
        return 0;
      }

      let totalStudents = 0;
      let studentsAttained = 0;

      // Get enrolled students
      const [students] = await pool.query(`
        SELECT DISTINCT s.student_id
        FROM students s
        INNER JOIN course_enrollments ce ON s.student_id = ce.student_id
        WHERE ce.course_offering_id = ?
      `, [courseOfferingId]);

      for (const student of students) {
        let totalMarks = 0;
        let obtainedMarks = 0;

        for (const question of questions) {
          // Get marks for this question
          const [marks] = await pool.query(`
            SELECT obtained_marks
            FROM marks
            WHERE question_id = ? AND student_id = ?
          `, [question.question_id, student.student_id]);

          totalMarks += question.max_marks;
          obtainedMarks += marks.length > 0 ? (marks[0].obtained_marks || 0) : 0;
        }

        if (totalMarks > 0) {
          const percentage = (obtainedMarks / totalMarks) * 100;
          if (percentage >= threshold) {
            studentsAttained++;
          }
          totalStudents++;
        }
      }

      return totalStudents > 0 ? (studentsAttained / totalStudents) * 100 : 0;
    } catch (error) {
      console.error('Error calculating direct CLO attainment:', error);
      return 0;
    }
  }

  /**
   * Calculate indirect CLO attainment from surveys
   * @param {number} courseOfferingId 
   * @param {number} cloId 
   * @returns {Promise<number>} Indirect attainment percentage
   */
  async calculateIndirectCLOAttainment(courseOfferingId, cloId) {
    try {
      const [results] = await pool.query(`
        SELECT AVG(average_score) as avg_score
        FROM indirect_attainment_results
        WHERE course_offering_id = ? AND clo_id = ?
      `, [courseOfferingId, cloId]);

      if (results.length > 0 && results[0].avg_score) {
        // Convert to percentage (assuming 5-point scale)
        return (results[0].avg_score / 5) * 100;
      }

      return 0;
    } catch (error) {
      console.error('Error calculating indirect CLO attainment:', error);
      return 0;
    }
  }

  /**
   * Save CLO attainment to database
   */
  async saveCLOAttainment(courseOfferingId, cloId, attainmentData) {
    try {
      await pool.query(`
        INSERT INTO course_clo_attainment_summary 
        (course_offering_id, clo_id, direct_attainment, indirect_attainment, 
         combined_attainment, threshold, attained)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          direct_attainment = VALUES(direct_attainment),
          indirect_attainment = VALUES(indirect_attainment),
          combined_attainment = VALUES(combined_attainment),
          threshold = VALUES(threshold),
          attained = VALUES(attained),
          updated_at = CURRENT_TIMESTAMP
      `, [
        courseOfferingId,
        cloId,
        attainmentData.direct_attainment,
        attainmentData.indirect_attainment,
        attainmentData.combined_attainment,
        attainmentData.threshold,
        attainmentData.combined_attainment >= attainmentData.threshold
      ]);
    } catch (error) {
      console.error('Error saving CLO attainment:', error);
      throw error;
    }
  }

  /**
   * Calculate PLO attainment for a program
   * @param {number} degreeId - Degree/Program ID
   * @param {number} academicSessionId - Academic session ID
   * @returns {Promise<Object>} PLO attainment results
   */
  async calculatePLOAttainment(degreeId, academicSessionId) {
    try {
      // Get all PLOs for this program
      const [plos] = await pool.query(`
        SELECT plo_id, plo_code, plo_description
        FROM program_learning_outcomes
        WHERE degree_id = ?
        ORDER BY plo_code
      `, [degreeId]);

      if (plos.length === 0) {
        return { success: false, message: 'No PLOs found for this program' };
      }

      // Get attainment threshold
      const [thresholds] = await pool.query(`
        SELECT passing_percentage
        FROM attainment_thresholds
        WHERE is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
      `);

      const threshold = thresholds.length > 0 ? thresholds[0].passing_percentage : 50;

      const ploAttainments = [];

      for (const plo of plos) {
        // Get all CLOs mapped to this PLO
        const [cloMappings] = await pool.query(`
          SELECT clo.clo_id, clo.course_id, mapping_strength
          FROM course_learning_outcomes clo
          INNER JOIN clo_plo_mapping cpm ON clo.clo_id = cpm.clo_id
          WHERE cpm.plo_id = ?
        `, [plo.plo_id]);

        if (cloMappings.length === 0) {
          continue;
        }

        let totalWeightedAttainment = 0;
        let totalWeight = 0;

        for (const mapping of cloMappings) {
          // Get latest CLO attainment for courses in this academic session
          const [cloAttainment] = await pool.query(`
            SELECT combined_attainment
            FROM course_clo_attainment_summary ccas
            INNER JOIN course_offerings co ON ccas.course_offering_id = co.course_offering_id
            WHERE ccas.clo_id = ? 
            AND co.academic_session_id = ?
            ORDER BY co.created_at DESC
            LIMIT 1
          `, [mapping.clo_id, academicSessionId]);

          if (cloAttainment.length > 0) {
            // Weight by mapping strength (1=Low, 2=Medium, 3=High)
            const weight = mapping.mapping_strength || 2;
            totalWeightedAttainment += cloAttainment[0].combined_attainment * weight;
            totalWeight += weight;
          }
        }

        const ploAttainmentValue = totalWeight > 0 
          ? totalWeightedAttainment / totalWeight 
          : 0;

        ploAttainments.push({
          plo_id: plo.plo_id,
          plo_code: plo.plo_code,
          plo_description: plo.plo_description,
          attainment: ploAttainmentValue,
          is_attained: ploAttainmentValue >= threshold
        });

        // Save to database
        await this.savePLOAttainment(degreeId, academicSessionId, plo.plo_id, {
          attainment: ploAttainmentValue,
          threshold: threshold
        });
      }

      return {
        success: true,
        data: {
          degree_id: degreeId,
          academic_session_id: academicSessionId,
          threshold: threshold,
          plo_attainments: ploAttainments
        }
      };
    } catch (error) {
      console.error('Error calculating PLO attainment:', error);
      throw error;
    }
  }

  /**
   * Save PLO attainment to database
   */
  async savePLOAttainment(degreeId, academicSessionId, ploId, attainmentData) {
    try {
      await pool.query(`
        INSERT INTO program_plo_attainment_summary
        (degree_id, academic_session_id, plo_id, attainment, threshold, attained)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          attainment = VALUES(attainment),
          threshold = VALUES(threshold),
          attained = VALUES(attained),
          updated_at = CURRENT_TIMESTAMP
      `, [
        degreeId,
        academicSessionId,
        ploId,
        attainmentData.attainment,
        attainmentData.threshold,
        attainmentData.attainment >= attainmentData.threshold
      ]);
    } catch (error) {
      console.error('Error saving PLO attainment:', error);
      throw error;
    }
  }

  /**
   * Get CLO attainment summary for a course offering
   */
  async getCLOAttainmentSummary(courseOfferingId) {
    try {
      const [results] = await pool.query(`
        SELECT 
          ccas.*,
          clo.clo_code,
          clo.clo_description
        FROM course_clo_attainment_summary ccas
        INNER JOIN course_learning_outcomes clo ON ccas.clo_id = clo.clo_id
        WHERE ccas.course_offering_id = ?
        ORDER BY clo.clo_code
      `, [courseOfferingId]);

      return { success: true, data: results };
    } catch (error) {
      console.error('Error getting CLO attainment summary:', error);
      throw error;
    }
  }

  /**
   * Get PLO attainment summary for a program
   */
  async getPLOAttainmentSummary(degreeId, academicSessionId) {
    try {
      const [results] = await pool.query(`
        SELECT 
          ppas.*,
          plo.plo_code,
          plo.plo_description
        FROM program_plo_attainment_summary ppas
        INNER JOIN program_learning_outcomes plo ON ppas.plo_id = plo.plo_id
        WHERE ppas.degree_id = ? AND ppas.academic_session_id = ?
        ORDER BY plo.plo_code
      `, [degreeId, academicSessionId]);

      return { success: true, data: results };
    } catch (error) {
      console.error('Error getting PLO attainment summary:', error);
      throw error;
    }
  }
}

module.exports = new AttainmentService();
