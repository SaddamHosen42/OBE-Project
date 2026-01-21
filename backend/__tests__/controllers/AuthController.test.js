const request = require('supertest');
const express = require('express');
const AuthController = require('../../controllers/AuthController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('jsonwebtoken');
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('AuthController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Setup routes
    app.post('/register', AuthController.register);
    app.post('/login', AuthController.login);
    app.post('/logout', AuthController.logout);
    app.post('/refresh-token', AuthController.refreshToken);
    app.post('/change-password', AuthController.changePassword);
    
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        role: 'student'
      };

      const mockCreatedUser = {
        id: 1,
        ...newUser,
        password: 'hashedPassword'
      };

      User.mockImplementation(() => ({
        create: jest.fn().mockResolvedValue(mockCreatedUser)
      }));

      const response = await request(app)
        .post('/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.data).toHaveProperty('id', 1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'test@example.com'
        // missing username, password, role
      };

      const response = await request(app)
        .post('/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 if password is too short', async () => {
      const userWithShortPassword = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: '123',
        role: 'student'
      };

      const response = await request(app)
        .post('/register')
        .send(userWithShortPassword);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Password must be');
    });

    it('should handle duplicate email error', async () => {
      const duplicateUser = {
        name: 'Test User',
        email: 'existing@example.com',
        username: 'testuser',
        password: 'Password123!',
        role: 'student'
      };

      User.mockImplementation(() => ({
        create: jest.fn().mockRejectedValue(new Error('Duplicate entry'))
      }));

      const response = await request(app)
        .post('/register')
        .send(duplicateUser);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'Password123!'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'student',
        password: 'hashedPassword'
      };

      User.mockImplementation(() => ({
        findByUsername: jest.fn().mockResolvedValue(mockUser),
        verifyPassword: jest.fn().mockResolvedValue(true)
      }));

      jwt.sign.mockReturnValue('mock-token');

      const response = await request(app)
        .post('/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(response.body.data).toHaveProperty('username', 'testuser');
    });

    it('should return 401 for invalid username', async () => {
      User.mockImplementation(() => ({
        findByUsername: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .post('/login')
        .send({ username: 'invalid', password: 'password' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword'
      };

      User.mockImplementation(() => ({
        findByUsername: jest.fn().mockResolvedValue(mockUser),
        verifyPassword: jest.fn().mockResolvedValue(false)
      }));

      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 400 if username or password is missing', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser' }); // missing password

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /change-password', () => {
    it('should change password successfully', async () => {
      const changePasswordData = {
        userId: 1,
        oldPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!'
      };

      const mockUser = {
        id: 1,
        password: 'hashedOldPassword'
      };

      User.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(mockUser),
        verifyPassword: jest.fn().mockResolvedValue(true),
        updatePassword: jest.fn().mockResolvedValue(true)
      }));

      const response = await request(app)
        .post('/change-password')
        .send(changePasswordData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Password changed');
    });

    it('should return 401 if old password is incorrect', async () => {
      const mockUser = { id: 1, password: 'hashedPassword' };

      User.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(mockUser),
        verifyPassword: jest.fn().mockResolvedValue(false)
      }));

      const response = await request(app)
        .post('/change-password')
        .send({
          userId: 1,
          oldPassword: 'wrongpassword',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('incorrect');
    });

    it('should return 404 if user not found', async () => {
      User.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .post('/change-password')
        .send({
          userId: 999,
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /refresh-token', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      
      jwt.verify.mockReturnValue({ userId: 1, username: 'testuser' });
      jwt.sign.mockReturnValue('new-access-token');

      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'student'
      };

      User.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(mockUser)
      }));

      const response = await request(app)
        .post('/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'new-access-token');
    });

    it('should return 401 for invalid refresh token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });
});
