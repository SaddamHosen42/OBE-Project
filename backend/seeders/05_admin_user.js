const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Seed Admin User
 * Creates default admin user for system access
 */
const seedAdminUser = async () => {
  try {
    console.log('🌱 Seeding Admin User...');

    // Check if admin user already exists
    const [existingAdmin] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ? OR username = ?',
      ['admin@obe-system.com', 'admin']
    );
    
    if (existingAdmin[0].count > 0) {
      console.log('⚠️  Admin user already exists. Skipping...');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin1433', 10);

    // Insert admin user
    const query = `
      INSERT INTO users 
      (name, email, username, password, role, email_verified_at, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
    `;

    await db.query(query, [
      'System Administrator',
      'admin@obe-system.com',
      'admin',
      hashedPassword,
      'admin'
    ]);

    console.log('✅ Successfully seeded Admin User');
    console.log('📧 Email: admin@obe-system.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin1433');
  } catch (error) {
    console.error('❌ Error seeding Admin User:', error.message);
    throw error;
  }
};

module.exports = seedAdminUser;
