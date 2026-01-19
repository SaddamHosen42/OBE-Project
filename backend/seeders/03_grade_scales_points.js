const db = require('../config/database');

/**
 * Seed Grade Scales and Grade Points
 * Standard grading system used in Bangladeshi universities (4.0 scale)
 */
const seedGradeScalesAndPoints = async () => {
  try {
    console.log('🌱 Seeding Grade Scales and Grade Points...');

    // Check if grade scale already exists
    const [existingScale] = await db.query('SELECT COUNT(*) as count FROM grade_scales');
    
    if (existingScale[0].count > 0) {
      console.log('⚠️  Grade Scales already seeded. Skipping...');
      return;
    }

    // Insert grade scale
    const [scaleResult] = await db.query(`
      INSERT INTO grade_scales 
      (name, is_active, created_at, updated_at) 
      VALUES ('Standard 4.0 Scale', 1, NOW(), NOW())
    `);

    const gradeScaleId = scaleResult.insertId;

    // Grade points based on standard Bangladeshi university system
    const gradePoints = [
      {
        letter_grade: 'A+',
        grade_point: 4.00,
        min_percentage: 80.00,
        max_percentage: 100.00,
        remarks: 'Outstanding'
      },
      {
        letter_grade: 'A',
        grade_point: 3.75,
        min_percentage: 75.00,
        max_percentage: 79.99,
        remarks: 'Excellent'
      },
      {
        letter_grade: 'A-',
        grade_point: 3.50,
        min_percentage: 70.00,
        max_percentage: 74.99,
        remarks: 'Very Good'
      },
      {
        letter_grade: 'B+',
        grade_point: 3.25,
        min_percentage: 65.00,
        max_percentage: 69.99,
        remarks: 'Good'
      },
      {
        letter_grade: 'B',
        grade_point: 3.00,
        min_percentage: 60.00,
        max_percentage: 64.99,
        remarks: 'Above Average'
      },
      {
        letter_grade: 'B-',
        grade_point: 2.75,
        min_percentage: 55.00,
        max_percentage: 59.99,
        remarks: 'Average'
      },
      {
        letter_grade: 'C+',
        grade_point: 2.50,
        min_percentage: 50.00,
        max_percentage: 54.99,
        remarks: 'Below Average'
      },
      {
        letter_grade: 'C',
        grade_point: 2.25,
        min_percentage: 45.00,
        max_percentage: 49.99,
        remarks: 'Pass'
      },
      {
        letter_grade: 'D',
        grade_point: 2.00,
        min_percentage: 40.00,
        max_percentage: 44.99,
        remarks: 'Conditional Pass'
      },
      {
        letter_grade: 'F',
        grade_point: 0.00,
        min_percentage: 0.00,
        max_percentage: 39.99,
        remarks: 'Fail'
      }
    ];

    // Insert grade points
    const query = `
      INSERT INTO grade_points 
      (grade_scale_id, letter_grade, grade_point, min_percentage, max_percentage, remarks, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    for (const grade of gradePoints) {
      await db.query(query, [
        gradeScaleId,
        grade.letter_grade,
        grade.grade_point,
        grade.min_percentage,
        grade.max_percentage,
        grade.remarks
      ]);
    }

    console.log('✅ Successfully seeded Grade Scale with 10 Grade Points');
  } catch (error) {
    console.error('❌ Error seeding Grade Scales and Points:', error.message);
    throw error;
  }
};

module.exports = seedGradeScalesAndPoints;
