const request = require('supertest');
const app = require('../../config/app');
const db = require('../../config/database');

/**
 * Integration Tests for Authentication API
 */
describe('Authentication API Integration Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Setup test database connection
    await db.raw('SELECT 1');
  });

  afterAll(async () => {
    // Cleanup and close connection
    if (testUser?.id) {
      await db('users').where('id', testUser.id).del();
    }
    await db.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'Test@1234',
        firstName: 'Test',
        lastName: 'User',
        role: 'teacher'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);

      testUser = response.body.data.user;
      authToken = response.body.data.token;
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        username: 'anotheruser',
        email: testUser.email,
        password: 'Test@1234',
        firstName: 'Test',
        lastName: 'User',
        role: 'teacher'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        username: 'testuser2',
        email: 'invalid-email',
        password: 'Test@1234',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for weak password', async () => {
      const userData = {
        username: 'testuser3',
        email: 'test3@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        identifier: testUser.email,
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should return error for invalid password', async () => {
      const credentials = {
        identifier: testUser.email,
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error for non-existent user', async () => {
      const credentials = {
        identifier: 'nonexistent@example.com',
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh token successfully', async () => {
      // First login to get a fresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.email,
          password: 'Test@1234'
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.token).not.toBe(token);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
