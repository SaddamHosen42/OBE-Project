const request = require('supertest');
const express = require('express');
const CLOAttainmentController = require('../../controllers/CLOAttainmentController');
const CourseCLOAttainmentSummary = require('../../models/CourseCLOAttainmentSummary');

jest.mock('../../models/CourseCLOAttainmentSummary');
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('CLOAttainmentController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Setup routes
    app.get('/attainment/clo/:courseId', CLOAttainmentController.getCourseCLOAttainment);
    app.post('/attainment/clo/calculate', CLOAttainmentController.calculateCLOAttainment);
    app.get('/attainment/clo/:id/details', CLOAttainmentController.getCLOAttainmentDetails);
    
    jest.clearAllMocks();
  });

  describe('GET /attainment/clo/:courseId', () => {
    it('should retrieve CLO attainment for a course', async () => {
      const mockAttainment = [
        {
          clo_id: 1,
          CLO_ID: 'CLO1',
          average_attainment: 78.5,
          target_attainment: 70,
          is_attained: true
        },
        {
          clo_id: 2,
          CLO_ID: 'CLO2',
          average_attainment: 65.0,
          target_attainment: 70,
          is_attained: false
        }
      ];

      CourseCLOAttainmentSummary.mockImplementation(() => ({
        getByCourse: jest.fn().mockResolvedValue(mockAttainment)
      }));

      const response = await request(app)
        .get('/attainment/clo/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('is_attained', true);
      expect(response.body.data[1]).toHaveProperty('is_attained', false);
    });

    it('should return empty array if no CLO attainment data exists', async () => {
      CourseCLOAttainmentSummary.mockImplementation(() => ({
        getByCourse: jest.fn().mockResolvedValue([])
      }));

      const response = await request(app)
        .get('/attainment/clo/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      CourseCLOAttainmentSummary.mockImplementation(() => ({
        getByCourse: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      const response = await request(app)
        .get('/attainment/clo/1');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /attainment/clo/calculate', () => {
    it('should calculate CLO attainment for a course', async () => {
      const requestData = {
        courseId: 1,
        sessionId: 1
      };

      const mockCalculatedAttainment = {
        course_id: 1,
        session_id: 1,
        clos: [
          { clo_id: 1, attainment: 78.5, is_attained: true },
          { clo_id: 2, attainment: 65.0, is_attained: false }
        ],
        overall_attainment: 71.75
      };

      CourseCLOAttainmentSummary.mockImplementation(() => ({
        calculate: jest.fn().mockResolvedValue(mockCalculatedAttainment)
      }));

      const response = await request(app)
        .post('/attainment/clo/calculate')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('overall_attainment', 71.75);
      expect(response.body.data.clos).toHaveLength(2);
    });

    it('should return 400 if courseId is missing', async () => {
      const response = await request(app)
        .post('/attainment/clo/calculate')
        .send({ sessionId: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('courseId is required');
    });

    it('should return 400 if sessionId is missing', async () => {
      const response = await request(app)
        .post('/attainment/clo/calculate')
        .send({ courseId: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('sessionId is required');
    });

    it('should handle calculation errors', async () => {
      CourseCLOAttainmentSummary.mockImplementation(() => ({
        calculate: jest.fn().mockRejectedValue(new Error('Insufficient data for calculation'))
      }));

      const response = await request(app)
        .post('/attainment/clo/calculate')
        .send({ courseId: 1, sessionId: 1 });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('calculation');
    });
  });

  describe('GET /attainment/clo/:id/details', () => {
    it('should retrieve detailed CLO attainment information', async () => {
      const mockDetails = {
        clo_id: 1,
        CLO_ID: 'CLO1',
        CLO_Description: 'Understand programming basics',
        average_attainment: 78.5,
        target_attainment: 70,
        is_attained: true,
        assessment_breakdown: [
          { assessment_name: 'Midterm', contribution: 35.0 },
          { assessment_name: 'Final', contribution: 43.5 }
        ],
        student_count: 45,
        pass_count: 38,
        pass_rate: 84.4
      };

      CourseCLOAttainmentSummary.mockImplementation(() => ({
        getDetails: jest.fn().mockResolvedValue(mockDetails)
      }));

      const response = await request(app)
        .get('/attainment/clo/1/details');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('is_attained', true);
      expect(response.body.data).toHaveProperty('assessment_breakdown');
      expect(response.body.data.assessment_breakdown).toHaveLength(2);
    });

    it('should return 404 if CLO attainment not found', async () => {
      CourseCLOAttainmentSummary.mockImplementation(() => ({
        getDetails: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .get('/attainment/clo/999/details');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });
});
