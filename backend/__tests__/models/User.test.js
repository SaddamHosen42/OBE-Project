const User = require('../../models/User');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

jest.mock('bcryptjs');

describe('User Model', () => {
  let userModel;

  beforeEach(() => {
    userModel = new User();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with users table', () => {
      expect(userModel.tableName).toBe('users');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };

      db.query.mockResolvedValue([[mockUser]]);

      const result = await userModel.findByEmail('test@example.com');

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await userModel.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        name: 'Test User'
      };

      db.query.mockResolvedValue([[mockUser]]);

      const result = await userModel.findByUsername('testuser');

      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        role: 'student'
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockResult = { insertId: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...newUser, password: 'hashedPassword' }]]);

      const result = await userModel.create(newUser);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toHaveProperty('id');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await userModel.verifyPassword('password123', 'hashedPassword');

      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await userModel.verifyPassword('wrongpassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      bcrypt.hash.mockResolvedValue('newHashedPassword');
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await userModel.updatePassword(1, 'newPassword');

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getByRole', () => {
    it('should get users by role', async () => {
      const mockUsers = [
        { id: 1, role: 'teacher', name: 'Teacher 1' },
        { id: 2, role: 'teacher', name: 'Teacher 2' }
      ];

      db.query.mockResolvedValue([mockUsers]);

      const result = await userModel.getByRole('teacher');

      expect(result).toEqual(mockUsers);
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const updates = {
        name: 'Updated Name',
        phone: '123456789'
      };

      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...updates }]]);

      const result = await userModel.update(1, updates);

      expect(result).toHaveProperty('name', 'Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await userModel.delete(1);

      expect(result).toBe(true);
    });
  });
});
