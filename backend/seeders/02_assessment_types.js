const db = require('../config/database');

/**
 * Seed Assessment Types
 * Various types of assessments used in OBE system
 */
const seedAssessmentTypes = async () => {
  try {
    console.log('🌱 Seeding Assessment Types...');

    const assessmentTypes = [
      {
        name: 'Quiz',
        category: 'Continuous',
        description: 'Short assessment to test understanding of recent topics. Usually 10-20 minutes duration.'
      },
      {
        name: 'Assignment',
        category: 'Continuous',
        description: 'Written or practical work given to students to complete outside of class. Evaluates application and problem-solving skills.'
      },
      {
        name: 'Midterm Exam',
        category: 'Terminal',
        description: 'Comprehensive examination covering first half of course material. Usually weighted 25-30% of final grade.'
      },
      {
        name: 'Final Exam',
        category: 'Terminal',
        description: 'Comprehensive examination covering entire course material. Usually weighted 40-50% of final grade.'
      },
      {
        name: 'Lab Work',
        category: 'Continuous',
        description: 'Practical laboratory exercises and experiments. Evaluates hands-on skills and application of theoretical concepts.'
      },
      {
        name: 'Presentation',
        category: 'Continuous',
        description: 'Oral presentation on a topic or project. Evaluates communication skills, research ability, and subject understanding.'
      },
      {
        name: 'Project',
        category: 'Continuous',
        description: 'Extended piece of work on a particular theme. May be individual or group-based. Evaluates research, analysis, and synthesis skills.'
      },
      {
        name: 'Viva',
        category: 'Terminal',
        description: 'Oral examination where students defend their work or demonstrate knowledge. Common for projects and theses.'
      },
      {
        name: 'Class Participation',
        category: 'Continuous',
        description: 'Assessment based on active participation in class discussions, activities, and engagement.'
      },
      {
        name: 'Practical Exam',
        category: 'Terminal',
        description: 'Hands-on examination to test practical skills and application. Common in lab-based courses.'
      }
    ];

    // Check if data already exists
    const [existing] = await db.query('SELECT COUNT(*) as count FROM assessment_types');
    
    if (existing[0].count > 0) {
      console.log('⚠️  Assessment Types already seeded. Skipping...');
      return;
    }

    // Insert assessment types
    const query = `
      INSERT INTO assessment_types 
      (name, category, description, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
    `;

    for (const type of assessmentTypes) {
      await db.query(query, [
        type.name,
        type.category,
        type.description
      ]);
    }

    console.log(`✅ Successfully seeded ${assessmentTypes.length} Assessment Types`);
  } catch (error) {
    console.error('❌ Error seeding Assessment Types:', error.message);
    throw error;
  }
};

module.exports = seedAssessmentTypes;
