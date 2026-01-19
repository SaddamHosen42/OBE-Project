const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

/**
 * User Model for authentication and user management
 * Handles user CRUD operations, password management, and authentication
 */
class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   * @param {string} email - User email address
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByEmail(email) {
    if (!email) {
      throw new Error('Email is required');
    }
    const users = await this.findWhere({ email });
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByUsername(username) {
    if (!username) {
      throw new Error('Username is required');
    }
    const users = await this.findWhere({ username });
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Create a new user with hashed password
   * @param {Object} userData - User data object
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} userData.username - User's username
   * @param {string} userData.password - User's plain text password (will be hashed)
   * @param {string} userData.role - User role (admin, teacher, student, staff)
   * @param {string} [userData.phone] - Optional phone number
   * @param {string} [userData.profile_image] - Optional profile image URL
   * @param {string} [userData.dob] - Optional date of birth
   * @param {string} [userData.nationality] - Optional nationality
   * @param {string} [userData.nid_no] - Optional national ID number
   * @param {string} [userData.blood_group] - Optional blood group
   * @returns {Promise<Object>} Created user object with id
   */
  async createUser(userData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'username', 'password', 'role'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate role
      const validRoles = ['admin', 'teacher', 'student', 'staff'];
      if (!validRoles.includes(userData.role)) {
        throw new Error('Invalid role. Must be one of: admin, teacher, student, staff');
      }

      // Check if email already exists
      const existingEmail = await this.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Check if username already exists
      const existingUsername = await this.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Prepare user data for insertion
      const userDataToInsert = {
        name: userData.name,
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
        phone: userData.phone || null,
        profile_image: userData.profile_image || null,
        dob: userData.dob || null,
        nationality: userData.nationality || null,
        nid_no: userData.nid_no || null,
        blood_group: userData.blood_group || null
      };

      // Create the user
      const userId = await this.create(userDataToInsert);

      // Return the created user (without password)
      const createdUser = await this.findById(userId);
      delete createdUser.password;
      return createdUser;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Update user's password
   * @param {number|string} userId - User ID
   * @param {string} newPassword - New plain text password (will be hashed)
   * @param {string} [oldPassword] - Optional old password for verification
   * @returns {Promise<boolean>} True if password updated successfully
   */
  async updatePassword(userId, newPassword, oldPassword = null) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!newPassword) {
        throw new Error('New password is required');
      }

      // Validate password strength
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Get the user
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // If old password is provided, verify it
      if (oldPassword) {
        const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidOldPassword) {
          throw new Error('Current password is incorrect');
        }
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the password
      const updated = await this.update(userId, { password: hashedPassword });

      return updated;
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  /**
   * Find user by email or username (for login)
   * @param {string} identifier - Email or username
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmailOrUsername(identifier) {
    if (!identifier) {
      throw new Error('Email or username is required');
    }

    // Try to find by email first
    let user = await this.findByEmail(identifier);
    
    // If not found, try username
    if (!user) {
      user = await this.findByUsername(identifier);
    }

    return user;
  }

  /**
   * Find users by role
   * @param {string} role - User role (admin, teacher, student, staff)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users with specified role
   */
  async findByRole(role, options = {}) {
    const validRoles = ['admin', 'teacher', 'student', 'staff'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }
    return this.findWhere({ role }, options);
  }

  /**
   * Update user's email verification status
   * @param {number|string} userId - User ID
   * @returns {Promise<boolean>} True if updated successfully
   */
  async markEmailAsVerified(userId) {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      return await this.update(userId, { email_verified_at: now });
    } catch (error) {
      throw new Error(`Error marking email as verified: ${error.message}`);
    }
  }
}

module.exports = User;
