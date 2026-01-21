const request = require('supertest');
const express = require('express');
const CourseController = require('../../controllers/CourseController');
const Course = require('../../models/Course');

jest.mock('../../models/Course');
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('CourseController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Setup routes
    app.get('/courses', CourseController.index);
    app.get('/courses/:id', CourseController.show);
    app.post('/courses', CourseController.create);
    app.put('/courses/:id', CourseController.update);
    app.delete('/courses/:id', CourseController.delete);
    app.get('/courses/:id/clos', CourseController.getCLOs);
    
    jest.clearAllMocks();
  });

  describe('GET /courses', () => {
    it('should retrieve all courses with pagination', async () => {
      const mockCourses = [
        {
          id: 1,
          courseCode: 'CSE101',
          courseTitle: 'Introduction to Programming',
          credit: 3
        },
        {
          id: 2,
          courseCode: 'CSE102',
          courseTitle: 'Data Structures',
          credit: 3
        }
      ];

      Course.mockImplementation(() => ({
        findAll: jest.fn().mockResolvedValue(mockCourses),
        count: jest.fn().mockResolvedValue(2)
      }));

      const response = await request(app)
        .get('/courses')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter courses by department', async () => {
      const mockCourses = [
        { id: 1, courseCode: 'CSE101', department_id: 1 }
      ];

      Course.mockImplementation(() => ({
        getByDepartment: jest.fn().mockResolvedValue(mockCourses)
      }));

      const response = await request(app)
        .get('/courses')
        .query({ departmentId: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should search courses by keyword', async () => {
      const mockCourses = [
        { id: 1, courseCode: 'CSE101', courseTitle: 'Programming' }
      ];

      Course.mockImplementation(() => ({
        search: jest.fn().mockResolvedValue(mockCourses),
        count: jest.fn().mockResolvedValue(1)
      }));

      const response = await request(app)
        .get('/courses')
        .query({ search: 'Programming' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should handle empty results', async () => {
      Course.mockImplementation(() => ({
        findAll: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0)
      }));

      const response = await request(app)
        .get('/courses');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /courses/:id', () => {
    it('should retrieve a specific course', async () => {
      const mockCourse = {
        id: 1,
        courseCode: 'CSE101',
        courseTitle: 'Programming',
        credit: 3
      };

      Course.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(mockCourse)
      }));

      const response = await request(app)
        .get('/courses/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('courseCode', 'CSE101');
    });

    it('should return 404 if course not found', async () => {
      Course.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .get('/courses/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('not found');
    });

    it('should handle database errors', async () => {
      Course.mockImplementation(() => ({
        findById: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      const response = await request(app)
        .get('/courses/1');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /courses', () => {
    it('should create a new course', async () => {
      const newCourse = {
        courseCode: 'CSE303',
        courseTitle: 'Advanced Programming',
        department_id: 1,
        credit: 3,
        level: '3',
        semester: 'Spring'
      };

      const mockCreatedCourse = {
        id: 1,
        ...newCourse
      };

      Course.mockImplementation(() => ({
        create: jest.fn().mockResolvedValue(mockCreatedCourse)
      }));

      const response = await request(app)
        .post('/courses')
        .send(newCourse);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('courseCode', 'CSE303');
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteCourse = {
        courseTitle: 'Missing Code'
        // missing courseCode and other required fields
      };

      const response = await request(app)
        .post('/courses')
        .send(incompleteCourse);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should handle duplicate course code error', async () => {
      Course.mockImplementation(() => ({
        create: jest.fn().mockRejectedValue(new Error('Duplicate entry'))
      }));

      const response = await request(app)
        .post('/courses')
        .send({
          courseCode: 'CSE101',
          courseTitle: 'Test',
          department_id: 1,
          credit: 3
        });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /courses/:id', () => {
    it('should update course information', async () => {
      const updates = {
        courseTitle: 'Updated Title',
        credit: 4
      };

      const mockUpdatedCourse = {
        id: 1,
        courseCode: 'CSE101',
        ...updates
      };

      Course.mockImplementation(() => ({
        update: jest.fn().mockResolvedValue(mockUpdatedCourse)
      }));

      const response = await request(app)
        .put('/courses/1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('courseTitle', 'Updated Title');
    });

    it('should return 404 if course not found', async () => {
      Course.mockImplementation(() => ({
        update: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .put('/courses/999')
        .send({ courseTitle: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should not allow updating courseCode', async () => {
      const updates = {
        courseCode: 'CSE999' // Should not be allowed
      };

      const response = await request(app)
        .put('/courses/1')
        .send(updates);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('cannot be updated');
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete a course', async () => {
      Course.mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue(true)
      }));

      const response = await request(app)
        .delete('/courses/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 if course not found', async () => {
      Course.mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue(false)
      }));

      const response = await request(app)
        .delete('/courses/999');

      expect(response.status).toBe(404);
    });

    it('should handle deletion errors', async () => {
      Course.mockImplementation(() => ({
        delete: jest.fn().mockRejectedValue(new Error('Foreign key constraint'))
      }));

      const response = await request(app)
        .delete('/courses/1');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /courses/:id/clos', () => {
    it('should retrieve CLOs for a course', async () => {
      const mockCLOs = [
        {
          id: 1,
          CLO_ID: 'CLO1',
          CLO_Description: 'Understand programming'
        },
        {
          id: 2,
          CLO_ID: 'CLO2',
          CLO_Description: 'Apply data structures'
        }
      ];

      Course.mockImplementation(() => ({
        getCLOs: jest.fn().mockResolvedValue(mockCLOs)
      }));

      const response = await request(app)
        .get('/courses/1/clos');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array if no CLOs exist', async () => {
      Course.mockImplementation(() => ({
        getCLOs: jest.fn().mockResolvedValue([])
      }));

      const response = await request(app)
        .get('/courses/1/clos');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });
});
