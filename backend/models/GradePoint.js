const BaseModel = require('./BaseModel');

/**
 * GradePoint Model for managing grade points within a grading scale
 * Handles grade point CRUD operations and grade calculations
 */
class GradePoint extends BaseModel {
  constructor() {
    super('grade_points');
  }

  /**
   * Get all grade points for a specific grade scale
   * @param {number} scaleId - Grade scale ID
   * @param {Object} options - Query options
   * @param {string} options.orderBy - Column to order by (default: 'min_percentage')
   * @param {string} options.order - Order direction (default: 'DESC')
   * @returns {Promise<Array>} Array of grade points for the scale
   */
  async getByScale(scaleId, options = {}) {
    try {
      const {
        orderBy = 'min_percentage',
        order = 'DESC'
      } = options;

      const query = `
        SELECT 
          id,
          grade_scale_id,
          letter_grade,
          grade_point,
          min_percentage,
          max_percentage,
          remarks,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE grade_scale_id = ?
        ORDER BY ${orderBy} ${order}
      `;

      const [results] = await this.db.execute(query, [scaleId]);
      return results;
    } catch (error) {
      throw new Error(`Error getting grade points by scale: ${error.message}`);
    }
  }

  /**
   * Calculate grade based on percentage for a specific grade scale
   * @param {number} percentage - The percentage score
   * @param {number} scaleId - Grade scale ID (default: 1 for standard scale)
   * @returns {Promise<Object|null>} Grade information or null if not found
   */
  async calculateGrade(percentage, scaleId = 1) {
    try {
      if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
      }

      const query = `
        SELECT 
          id,
          grade_scale_id,
          letter_grade,
          grade_point,
          min_percentage,
          max_percentage,
          remarks,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE grade_scale_id = ?
          AND ? >= min_percentage
          AND ? <= max_percentage
        LIMIT 1
      `;

      const [results] = await this.db.execute(query, [scaleId, percentage, percentage]);

      if (results.length === 0) {
        return null;
      }

      return results[0];
    } catch (error) {
      throw new Error(`Error calculating grade: ${error.message}`);
    }
  }

  /**
   * Get grade point by letter grade for a specific scale
   * @param {string} letterGrade - Letter grade (e.g., 'A+', 'B', 'C')
   * @param {number} scaleId - Grade scale ID (default: 1)
   * @returns {Promise<Object|null>} Grade point information or null
   */
  async getByLetterGrade(letterGrade, scaleId = 1) {
    try {
      const query = `
        SELECT 
          id,
          grade_scale_id,
          letter_grade,
          grade_point,
          min_percentage,
          max_percentage,
          remarks,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE grade_scale_id = ?
          AND letter_grade = ?
        LIMIT 1
      `;

      const [results] = await this.db.execute(query, [scaleId, letterGrade]);

      if (results.length === 0) {
        return null;
      }

      return results[0];
    } catch (error) {
      throw new Error(`Error getting grade point by letter grade: ${error.message}`);
    }
  }

  /**
   * Create a new grade point
   * @param {Object} data - Grade point data
   * @param {number} data.grade_scale_id - Grade scale ID
   * @param {string} data.letter_grade - Letter grade
   * @param {number} data.grade_point - Grade point value
   * @param {number} data.min_percentage - Minimum percentage
   * @param {number} data.max_percentage - Maximum percentage
   * @param {string} data.remarks - Optional remarks
   * @returns {Promise<Object>} Created grade point
   */
  async create(data) {
    const {
      grade_scale_id,
      letter_grade,
      grade_point,
      min_percentage,
      max_percentage,
      remarks = null
    } = data;

    // Validation
    if (!grade_scale_id || !letter_grade || grade_point === undefined || 
        min_percentage === undefined || max_percentage === undefined) {
      throw new Error('All required fields must be provided');
    }

    if (min_percentage < 0 || max_percentage > 100 || min_percentage > max_percentage) {
      throw new Error('Invalid percentage range');
    }

    if (grade_point < 0) {
      throw new Error('Grade point cannot be negative');
    }

    try {
      // Check for overlapping ranges in the same scale
      const overlapQuery = `
        SELECT id FROM ${this.tableName}
        WHERE grade_scale_id = ?
          AND id != ?
          AND (
            (? BETWEEN min_percentage AND max_percentage)
            OR (? BETWEEN min_percentage AND max_percentage)
            OR (min_percentage BETWEEN ? AND ?)
          )
      `;

      const [overlaps] = await this.db.execute(overlapQuery, [
        grade_scale_id, 0, min_percentage, max_percentage, min_percentage, max_percentage
      ]);

      if (overlaps.length > 0) {
        throw new Error('Grade point range overlaps with existing range');
      }

      const query = `
        INSERT INTO ${this.tableName} 
        (grade_scale_id, letter_grade, grade_point, min_percentage, max_percentage, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        grade_scale_id,
        letter_grade,
        grade_point,
        min_percentage,
        max_percentage,
        remarks
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating grade point: ${error.message}`);
    }
  }

  /**
   * Update a grade point
   * @param {number} id - Grade point ID
   * @param {Object} data - Updated grade point data
   * @returns {Promise<Object|null>} Updated grade point or null
   */
  async update(id, data) {
    const {
      letter_grade,
      grade_point,
      min_percentage,
      max_percentage,
      remarks
    } = data;

    try {
      // Validate percentage range if provided
      if (min_percentage !== undefined && max_percentage !== undefined) {
        if (min_percentage < 0 || max_percentage > 100 || min_percentage > max_percentage) {
          throw new Error('Invalid percentage range');
        }

        // Get current grade point to check scale_id
        const current = await this.findById(id);
        if (!current) {
          throw new Error('Grade point not found');
        }

        // Check for overlapping ranges (excluding current record)
        const overlapQuery = `
          SELECT id FROM ${this.tableName}
          WHERE grade_scale_id = ?
            AND id != ?
            AND (
              (? BETWEEN min_percentage AND max_percentage)
              OR (? BETWEEN min_percentage AND max_percentage)
              OR (min_percentage BETWEEN ? AND ?)
            )
        `;

        const [overlaps] = await this.db.execute(overlapQuery, [
          current.grade_scale_id, id, min_percentage, max_percentage, min_percentage, max_percentage
        ]);

        if (overlaps.length > 0) {
          throw new Error('Grade point range overlaps with existing range');
        }
      }

      const updateFields = [];
      const params = [];

      if (letter_grade !== undefined) {
        updateFields.push('letter_grade = ?');
        params.push(letter_grade);
      }

      if (grade_point !== undefined) {
        if (grade_point < 0) {
          throw new Error('Grade point cannot be negative');
        }
        updateFields.push('grade_point = ?');
        params.push(grade_point);
      }

      if (min_percentage !== undefined) {
        updateFields.push('min_percentage = ?');
        params.push(min_percentage);
      }

      if (max_percentage !== undefined) {
        updateFields.push('max_percentage = ?');
        params.push(max_percentage);
      }

      if (remarks !== undefined) {
        updateFields.push('remarks = ?');
        params.push(remarks);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(id);

      const query = `
        UPDATE ${this.tableName}
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.db.execute(query, params);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating grade point: ${error.message}`);
    }
  }

  /**
   * Delete a grade point (with validation)
   * @param {number} id - Grade point ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    try {
      // Check if grade point exists
      const gradePoint = await this.findById(id);
      if (!gradePoint) {
        throw new Error('Grade point not found');
      }

      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const [result] = await this.db.execute(query, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting grade point: ${error.message}`);
    }
  }

  /**
   * Calculate CGPA from an array of grade points
   * @param {Array<number>} gradePoints - Array of grade point values
   * @param {Array<number>} creditHours - Array of credit hours (optional, assumes equal weight)
   * @returns {number} Calculated CGPA
   */
  calculateCGPA(gradePoints, creditHours = null) {
    try {
      if (!Array.isArray(gradePoints) || gradePoints.length === 0) {
        throw new Error('Grade points array is required and must not be empty');
      }

      if (creditHours && creditHours.length !== gradePoints.length) {
        throw new Error('Credit hours array must match grade points array length');
      }

      if (creditHours) {
        // Weighted CGPA calculation
        let totalPoints = 0;
        let totalCredits = 0;

        for (let i = 0; i < gradePoints.length; i++) {
          totalPoints += gradePoints[i] * creditHours[i];
          totalCredits += creditHours[i];
        }

        if (totalCredits === 0) {
          throw new Error('Total credit hours cannot be zero');
        }

        return parseFloat((totalPoints / totalCredits).toFixed(2));
      } else {
        // Simple average
        const sum = gradePoints.reduce((acc, gp) => acc + gp, 0);
        return parseFloat((sum / gradePoints.length).toFixed(2));
      }
    } catch (error) {
      throw new Error(`Error calculating CGPA: ${error.message}`);
    }
  }
}

module.exports = GradePoint;
