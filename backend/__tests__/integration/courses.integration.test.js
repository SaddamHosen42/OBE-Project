const request = require('supertest');
const app = require('../../config/app');
const db = require('../../config/database');

/**
 * Integration Tests for Course API
 */
describe('Course API Integration Tests', () => {
  let authToken;
  let testUser;
  let testDepartment;
  let testDegree;
  let testCourse;

  beforeAll(async () => {
    // Setup test database connection
    await db.raw('SELECT 1');

    // Create test user and login
    const userData = {
      username: `coursetest_${Date.now()}`,
      email: `coursetest_${Date.now()}@example.com`,
      password: 'Test@1234',
      firstName: 'Course',
      lastName: 'Tester',
      role: 'admin'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    testUser = registerResponse.body.data.user;
    authToken = registerResponse.body.data.token;

    // Create test department
    const deptData = {
      name: `Test Department ${Date.now()}`,
      code: `TD${Date.now().toString().slice(-6)}`,
      description: 'Test department for integration tests'
    };

    const deptResponse = await request(app)
      .post('/api/departments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(deptData);

    testDepartment = deptResponse.body.data;

    // Create test degree
    const degreeData = {
      name: `Test Degree ${Date.now()}`,
      code: `TDG${Date.now().toString().slice(-6)}`,
      departmentId: testDepartment.id,
      level: 'undergraduate',
      duration: 4
    };

    const degreeResponse = await request(app)
      .post('/api/degrees')
      .set('Authorization', `Bearer ${authToken}`)
      .send(degreeData);

    testDegree = degreeResponse.body.data;
  });

  afterAll(async () => {
    // Cleanup
    if (testCourse?.id) {
      await db('courses').where('id', testCourse.id).del();
    }
    if (testDegree?.id) {
      await db('degrees').where('id', testDegree.id).del();
    }
    if (testDepartment?.id) {
      await db('departments').where('id', testDepartment.id).del();
    }
    if (testUser?.id) {
      await db('users').where('id', testUser.id).del();
    }
    await db.destroy();
  });

  describe('POST /api/courses', () => {
    it('should create a new course successfully', async () => {
      const courseData = {
        courseCode: `CS${Date.now().toString().slice(-4)}`,
        courseName: 'Test Course',
        creditHours: 3,
        departmentId: testDepartment.id,
        degreeId: testDegree.id,
        description: 'Test course description',
        prerequisiteCourses: []
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.courseCode).toBe(courseData.courseCode);
      expect(response.body.data.courseName).toBe(courseData.courseName);

      testCourse = response.body.data;
    });

    it('should return error for duplicate course code', async () => {
      const courseData = {
        courseCode: testCourse.courseCode,
        courseName: 'Another Course',
        creditHours: 3,
        departmentId: testDepartment.id,
        degreeId: testDegree.id
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for missing required fields', async () => {
      const courseData = {
        courseName: 'Incomplete Course'
        // Missing courseCode and other required fields
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error without authentication', async () => {
      const courseData = {
        courseCode: 'CS999',
        courseName: 'Unauthorized Course',
        creditHours: 3,
        departmentId: testDepartment.id
      };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/courses', () => {
    it('should get all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter courses by department', async () => {
      const response = await request(app)
        .get(`/api/courses?departmentId=${testDepartment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach(course => {
        expect(course.departmentId).toBe(testDepartment.id);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/courses?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should get course by id', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourse.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCourse.id);
      expect(response.body.data.courseCode).toBe(testCourse.courseCode);
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('should update course successfully', async () => {
      const updateData = {
        courseName: 'Updated Course Name',
        creditHours: 4,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/courses/${testCourse.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courseName).toBe(updateData.courseName);
      expect(response.body.data.creditHours).toBe(updateData.creditHours);
    });

    it('should return error when updating with duplicate course code', async () => {
      // Create another course
      const anotherCourse = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseCode: `CS${Date.now().toString().slice(-4)}`,
          courseName: 'Another Test Course',
          creditHours: 3,
          departmentId: testDepartment.id,
          degreeId: testDegree.id
        });

      // Try to update with existing code
      const response = await request(app)
        .put(`/api/courses/${anotherCourse.body.data.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ courseCode: testCourse.courseCode })
        .expect(400);

      expect(response.body.success).toBe(false);

      // Cleanup
      await db('courses').where('id', anotherCourse.body.data.id).del();
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('should delete course successfully', async () => {
      // Create a course to delete
      const courseToDelete = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseCode: `CS${Date.now().toString().slice(-4)}`,
          courseName: 'Course to Delete',
          creditHours: 3,
          departmentId: testDepartment.id,
          degreeId: testDegree.id
        });

      const response = await request(app)
        .delete(`/api/courses/${courseToDelete.body.data.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/courses/${courseToDelete.body.data.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });

    it('should return 404 when deleting non-existent course', async () => {
      const response = await request(app)
        .delete('/api/courses/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
