const seedBloomTaxonomyLevels = require('./01_bloom_taxonomy_levels');
const seedAssessmentTypes = require('./02_assessment_types');
const seedGradeScalesAndPoints = require('./03_grade_scales_points');
const seedDesignations = require('./04_designations');
const seedAdminUser = require('./05_admin_user');

/**
 * Main Seeder Runner
 * Executes all seeders in sequence
 */
const runAllSeeders = async () => {
  console.log('\n🌱 Starting Database Seeding Process...\n');
  console.log('═'.repeat(50));

  try {
    // Run seeders in order
    await seedBloomTaxonomyLevels();
    console.log('═'.repeat(50));
    
    await seedAssessmentTypes();
    console.log('═'.repeat(50));
    
    await seedGradeScalesAndPoints();
    console.log('═'.repeat(50));
    
    await seedDesignations();
    console.log('═'.repeat(50));
    
    await seedAdminUser();
    console.log('═'.repeat(50));

    console.log('\n✅ All seeders completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding process failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run seeders if this file is executed directly
if (require.main === module) {
  runAllSeeders();
}

module.exports = runAllSeeders;
