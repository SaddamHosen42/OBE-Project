const BaseModel = require('./BaseModel');

/**
 * Example User Model extending BaseModel
 */
class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const users = await this.findWhere({ email });
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Find active users
   * @returns {Promise<Array>}
   */
  async findActiveUsers() {
    return this.findWhere(
      { is_active: 1 },
      { orderBy: 'created_at', order: 'DESC' }
    );
  }
}

module.exports = User;
