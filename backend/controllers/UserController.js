const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * User Controller
 * Handles user management operations
 */
const UserController = {
  /**
   * List all users
   * @route GET /api/users
   */
  index: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, search, orderBy = 'created_at', order = 'DESC' } = req.query;

      const userModel = new User();
      
      // Build query options
      const options = {
        orderBy,
        order: order.toUpperCase(),
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      let users;
      let total;

      // Filter by role if provided
      if (role) {
        const conditions = { role };
        users = await userModel.findWhere(conditions, options);
        total = await userModel.count(conditions);
      } 
      // Search by name, email, or username if search param provided
      else if (search) {
        const query = `
          SELECT * FROM users 
          WHERE name LIKE ? OR email LIKE ? OR username LIKE ?
          ORDER BY ${orderBy} ${order.toUpperCase()}
          LIMIT ? OFFSET ?
        `;
        const searchParam = `%${search}%`;
        users = await userModel.executeQuery(query, [
          searchParam,
          searchParam,
          searchParam,
          options.limit,
          options.offset
        ]);

        const countQuery = `
          SELECT COUNT(*) as total FROM users 
          WHERE name LIKE ? OR email LIKE ? OR username LIKE ?
        `;
        const countResult = await userModel.executeQuery(countQuery, [
          searchParam,
          searchParam,
          searchParam
        ]);
        total = countResult[0].total;
      } 
      // Get all users
      else {
        users = await userModel.findAll(options);
        total = await userModel.count();
      }

      // Remove passwords from response
      users = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in UserController.index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: error.message
      });
    }
  },

  /**
   * Get a single user by ID
   * @route GET /api/users/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const userModel = new User();
      const user = await userModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error in UserController.show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user',
        error: error.message
      });
    }
  },

  /**
   * Update a user (admin only)
   * @route PUT /api/users/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, username, role, phone, profile_image, dob, nationality, nid_no, blood_group, password } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const userModel = new User();
      
      // Check if user exists
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prepare update data
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (profile_image !== undefined) updateData.profile_image = profile_image;
      if (dob !== undefined) updateData.dob = dob;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (nid_no !== undefined) updateData.nid_no = nid_no;
      if (blood_group !== undefined) updateData.blood_group = blood_group;

      // Check if email is being changed and if it's already taken
      if (email !== undefined && email !== existingUser.email) {
        const emailExists = await userModel.findByEmail(email);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
        updateData.email = email;
      }

      // Check if username is being changed and if it's already taken
      if (username !== undefined && username !== existingUser.username) {
        const usernameExists = await userModel.findByUsername(username);
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username already exists'
          });
        }
        updateData.username = username;
      }

      // Validate and update role if provided
      if (role !== undefined) {
        const validRoles = ['admin', 'teacher', 'student', 'staff'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be one of: admin, teacher, student, staff'
          });
        }
        updateData.role = role;
      }

      // Handle password update if provided
      if (password) {
        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long'
          });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      // If no data to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for update'
        });
      }

      updateData.updated_at = new Date();

      // Update user
      await userModel.update(updateData, { id });

      // Get updated user
      const updatedUser = await userModel.findById(id);
      const { password: _, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error in UserController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  },

  /**
   * Delete a user (admin only)
   * @route DELETE /api/users/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const userModel = new User();
      
      // Check if user exists
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent deletion of the last admin user
      if (user.role === 'admin') {
        const adminCount = await userModel.count({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the last admin user'
          });
        }
      }

      // Delete user
      await userModel.delete({ id });

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error in UserController.destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  },

  /**
   * Update own profile (authenticated user)
   * @route PUT /api/users/profile
   */
  updateProfile: async (req, res) => {
    try {
      // Get user ID from authenticated user (set by auth middleware)
      const userId = req.user.id;
      const { name, phone, profile_image, dob, nationality, nid_no, blood_group, current_password, new_password } = req.body;

      const userModel = new User();
      
      // Get current user
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prepare update data
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (profile_image !== undefined) updateData.profile_image = profile_image;
      if (dob !== undefined) updateData.dob = dob;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (nid_no !== undefined) updateData.nid_no = nid_no;
      if (blood_group !== undefined) updateData.blood_group = blood_group;

      // Handle password change
      if (new_password) {
        if (!current_password) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to set a new password'
          });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(current_password, existingUser.password);
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        // Validate new password
        if (new_password.length < 8) {
          return res.status(400).json({
            success: false,
            message: 'New password must be at least 8 characters long'
          });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        updateData.password = hashedPassword;
      }

      // If no data to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for update'
        });
      }

      updateData.updated_at = new Date();

      // Update user
      await userModel.update(updateData, { id: userId });

      // Get updated user
      const updatedUser = await userModel.findById(userId);
      const { password, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error in UserController.updateProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }
};

module.exports = UserController;
