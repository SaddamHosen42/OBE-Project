const db = require('../config/database');

/**
 * Seed Designations
 * Faculty/Teacher designations in university hierarchy
 */
const seedDesignations = async () => {
  try {
    console.log('🌱 Seeding Designations...');

    const designations = [
      {
        name: 'Professor',
        rank: 1
      },
      {
        name: 'Associate Professor',
        rank: 2
      },
      {
        name: 'Assistant Professor',
        rank: 3
      },
      {
        name: 'Senior Lecturer',
        rank: 4
      },
      {
        name: 'Lecturer',
        rank: 5
      },
      {
        name: 'Assistant Lecturer',
        rank: 6
      },
      {
        name: 'Adjunct Professor',
        rank: 7
      },
      {
        name: 'Visiting Professor',
        rank: 8
      },
      {
        name: 'Research Associate',
        rank: 9
      },
      {
        name: 'Lab Instructor',
        rank: 10
      },
      {
        name: 'Teaching Assistant',
        rank: 11
      }
    ];

    // Check if data already exists
    const [existing] = await db.query('SELECT COUNT(*) as count FROM designations');
    
    if (existing[0].count > 0) {
      console.log('⚠️  Designations already seeded. Skipping...');
      return;
    }

    // Insert designations
    const query = `
      INSERT INTO designations 
      (name, rank, created_at, updated_at) 
      VALUES (?, ?, NOW(), NOW())
    `;

    for (const designation of designations) {
      await db.query(query, [
        designation.name,
        designation.rank
      ]);
    }

    console.log(`✅ Successfully seeded ${designations.length} Designations`);
  } catch (error) {
    console.error('❌ Error seeding Designations:', error.message);
    throw error;
  }
};

module.exports = seedDesignations;
