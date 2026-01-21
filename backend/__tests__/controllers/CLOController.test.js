const request = require('supertest');
const express = require('express');
const CLOController = require('../../controllers/CLOController');
const CourseLearningOutcome = require('../../models/CourseLearningOutcome');

jest.mock('../../models/CourseLearningOutcome');
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('CLOController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Setup routes
    app.get('/clos', CLOController.index);
    app.get('/clos/:id', CLOController.show);
    app.post('/clos', CLOController.create);
    app.put('/clos/:id', CLOController.update);
    app.delete('/clos/:id', CLOController.delete);
    app.post('/clos/:id/map-plo', CLOController.mapToPLO);
    app.get('/clos/:id/attainment', CLOController.getAttainment);
    
    jest.clearAllMocks();
  });

  describe('GET /clos', () => {
    it('should retrieve all CLOs for a course', async () => {
      const mockCLOs = [
        {
          id: 1,
          CLO_ID: 'CLO1',
          CLO_Description: 'Understand programming basics',
          course_id: 1
        },
        {
          id: 2,
          CLO_ID: 'CLO2',
          CLO_Description: 'Apply data structures',
          course_id: 1
        }
      ];

      CourseLearningOutcome.mockImplementation(() => ({
        getByCourse: jest.fn().mockResolvedValue(mockCLOs)
      }));

      const response = await request(app)
        .get('/clos')
        .query({ courseId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return 400 if courseId is not provided', async () => {
      const response = await request(app)
        .get('/clos');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('courseId is required');
    });

    it('should include bloom level when requested', async () => {
      const mockCLOs = [
        {
          id: 1,
          CLO_ID: 'CLO1',
          bloom_level_name: 'Understand'
        }
      ];

      CourseLearningOutcome.mockImplementation(() => ({
        getByCourse: jest.fn().mockResolvedValue(mockCLOs)
      }));

      const response = await request(app)
        .get('/clos')
        .query({ courseId: 1, includeBloomLevel: true });

      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('bloom_level_name');
    });
  });

  describe('GET /clos/:id', () => {
    it('should retrieve a specific CLO', async () => {
      const mockCLO = {
        id: 1,
        CLO_ID: 'CLO1',
        CLO_Description: 'Test description',
        course_id: 1
      };

      CourseLearningOutcome.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(mockCLO)
      }));

      const response = await request(app)
        .get('/clos/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('CLO_ID', 'CLO1');
    });

    it('should return 404 if CLO not found', async () => {
      CourseLearningOutcome.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .get('/clos/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /clos', () => {
    it('should create a new CLO', async () => {
      const newCLO = {
        course_id: 1,
        CLO_ID: 'CLO3',
        CLO_Description: 'Evaluate software designs',
        bloom_taxonomy_level_id: 5,
        weight_percentage: 20,
        target_attainment: 70
      };

      const mockCreatedCLO = {
        id: 1,
        ...newCLO
      };

      CourseLearningOutcome.mockImplementation(() => ({
        create: jest.fn().mockResolvedValue(mockCreatedCLO)
      }));

      const response = await request(app)
        .post('/clos')
        .send(newCLO);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('CLO_ID', 'CLO3');
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteCLO = {
        CLO_Description: 'Missing course_id'
      };

      const response = await request(app)
        .post('/clos')
        .send(incompleteCLO);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should validate weight_percentage range', async () => {
      const invalidCLO = {
        course_id: 1,
        CLO_ID: 'CLO1',
        CLO_Description: 'Test',
        weight_percentage: 150 // Invalid: > 100
      };

      const response = await request(app)
        .post('/clos')
        .send(invalidCLO);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('weight_percentage');
    });
  });

  describe('PUT /clos/:id', () => {
    it('should update CLO information', async () => {
      const updates = {
        CLO_Description: 'Updated description',
        target_attainment: 75
      };

      const mockUpdatedCLO = {
        id: 1,
        CLO_ID: 'CLO1',
        ...updates
      };

      CourseLearningOutcome.mockImplementation(() => ({
        update: jest.fn().mockResolvedValue(mockUpdatedCLO)
      }));

      const response = await request(app)
        .put('/clos/1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('CLO_Description', 'Updated description');
    });

    it('should return 404 if CLO not found', async () => {
      CourseLearningOutcome.mockImplementation(() => ({
        update: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .put('/clos/999')
        .send({ CLO_Description: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /clos/:id', () => {
    it('should delete a CLO', async () => {
      CourseLearningOutcome.mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue(true)
      }));

      const response = await request(app)
        .delete('/clos/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 if CLO not found', async () => {
      CourseLearningOutcome.mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue(false)
      }));

      const response = await request(app)
        .delete('/clos/999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /clos/:id/map-plo', () => {
    it('should map CLO to PLO', async () => {
      CourseLearningOutcome.mockImplementation(() => ({
        mapToPLO: jest.fn().mockResolvedValue(true)
      }));

      const response = await request(app)
        .post('/clos/1/map-plo')
        .send({ ploId: 1 });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('mapped successfully');
    });

    it('should return 400 if ploId is missing', async () => {
      const response = await request(app)
        .post('/clos/1/map-plo')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ploId is required');
    });

    it('should handle duplicate mapping error', async () => {
      CourseLearningOutcome.mockImplementation(() => ({
        mapToPLO: jest.fn().mockRejectedValue(new Error('Duplicate entry'))
      }));

      const response = await request(app)
        .post('/clos/1/map-plo')
        .send({ ploId: 1 });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /clos/:id/attainment', () => {
    it('should retrieve CLO attainment data', async () => {
      const mockAttainment = {
        clo_id: 1,
        average_attainment: 78.5,
        target_attainment: 70,
        is_attained: true
      };

      CourseLearningOutcome.mockImplementation(() => ({
        getAttainment: jest.fn().mockResolvedValue(mockAttainment)
      }));

      const response = await request(app)
        .get('/clos/1/attainment');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('is_attained', true);
      expect(response.body.data.average_attainment).toBeGreaterThan(70);
    });

    it('should return 404 if no attainment data exists', async () => {
      CourseLearningOutcome.mockImplementation(() => ({
        getAttainment: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .get('/clos/1/attainment');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('No attainment data');
    });
  });
});
