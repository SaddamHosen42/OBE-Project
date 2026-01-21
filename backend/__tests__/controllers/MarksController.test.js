const request = require('supertest');
const express = require('express');
const MarksController = require('../../controllers/MarksController');
const Mark = require('../../models/Mark');

jest.mock('../../models/Mark');
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('MarksController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Setup routes
    app.get('/marks', MarksController.index);
    app.get('/marks/:id', MarksController.show);
    app.post('/marks', MarksController.create);
    app.put('/marks/:id', MarksController.update);
    app.delete('/marks/:id', MarksController.delete);
    app.post('/marks/bulk', MarksController.bulkCreate);
    app.get('/marks/student/:studentId', MarksController.getByStudent);
    
    jest.clearAllMocks();
  });

  describe('GET /marks', () => {
    it('should retrieve marks with filters', async () => {
      const mockMarks = [
        {
          id: 1,
          student_id: 1,
          assessment_id: 1,
          marks_obtained: 25,
          total_marks: 30
        },
        {
          id: 2,
          student_id: 2,
          assessment_id: 1,
          marks_obtained: 28,
          total_marks: 30
        }
      ];

      Mark.mockImplementation(() => ({
        findAll: jest.fn().mockResolvedValue(mockMarks)
      }));

      const response = await request(app)
        .get('/marks')
        .query({ assessmentId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by student', async () => {
      const mockMarks = [
        { id: 1, student_id: 1, marks_obtained: 25 }
      ];

      Mark.mockImplementation(() => ({
        getByStudent: jest.fn().mockResolvedValue(mockMarks)
      }));

      const response = await request(app)
        .get('/marks')
        .query({ studentId: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /marks/:id', () => {
    it('should retrieve a specific mark record', async () => {
      const mockMark = {
        id: 1,
        student_id: 1,
        assessment_id: 1,
        marks_obtained: 25,
        total_marks: 30
      };

      Mark.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(mockMark)
      }));

      const response = await request(app)
        .get('/marks/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('marks_obtained', 25);
    });

    it('should return 404 if mark not found', async () => {
      Mark.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .get('/marks/999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /marks', () => {
    it('should create a new mark record', async () => {
      const newMark = {
        student_id: 1,
        assessment_id: 1,
        marks_obtained: 25,
        total_marks: 30
      };

      const mockCreatedMark = {
        id: 1,
        ...newMark
      };

      Mark.mockImplementation(() => ({
        create: jest.fn().mockResolvedValue(mockCreatedMark)
      }));

      const response = await request(app)
        .post('/marks')
        .send(newMark);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('marks_obtained', 25);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteMark = {
        student_id: 1
        // missing assessment_id and marks
      };

      const response = await request(app)
        .post('/marks')
        .send(incompleteMark);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should validate marks_obtained is not negative', async () => {
      const invalidMark = {
        student_id: 1,
        assessment_id: 1,
        marks_obtained: -5,
        total_marks: 30
      };

      const response = await request(app)
        .post('/marks')
        .send(invalidMark);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('cannot be negative');
    });

    it('should validate marks_obtained does not exceed total_marks', async () => {
      const invalidMark = {
        student_id: 1,
        assessment_id: 1,
        marks_obtained: 35,
        total_marks: 30
      };

      const response = await request(app)
        .post('/marks')
        .send(invalidMark);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('cannot exceed total marks');
    });
  });

  describe('POST /marks/bulk', () => {
    it('should create multiple mark records', async () => {
      const bulkMarks = [
        {
          student_id: 1,
          assessment_id: 1,
          marks_obtained: 25,
          total_marks: 30
        },
        {
          student_id: 2,
          assessment_id: 1,
          marks_obtained: 28,
          total_marks: 30
        }
      ];

      Mark.mockImplementation(() => ({
        bulkCreate: jest.fn().mockResolvedValue({
          created: 2,
          failed: 0,
          records: bulkMarks
        })
      }));

      const response = await request(app)
        .post('/marks/bulk')
        .send({ marks: bulkMarks });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.created).toBe(2);
    });

    it('should return 400 if marks array is empty', async () => {
      const response = await request(app)
        .post('/marks/bulk')
        .send({ marks: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('at least one mark');
    });

    it('should handle partial success in bulk create', async () => {
      const bulkMarks = [
        { student_id: 1, assessment_id: 1, marks_obtained: 25, total_marks: 30 },
        { student_id: 999, assessment_id: 1, marks_obtained: 28, total_marks: 30 }
      ];

      Mark.mockImplementation(() => ({
        bulkCreate: jest.fn().mockResolvedValue({
          created: 1,
          failed: 1,
          errors: ['Student 999 not found']
        })
      }));

      const response = await request(app)
        .post('/marks/bulk')
        .send({ marks: bulkMarks });

      expect(response.status).toBe(207); // Multi-status
      expect(response.body.data.created).toBe(1);
      expect(response.body.data.failed).toBe(1);
    });
  });

  describe('PUT /marks/:id', () => {
    it('should update mark record', async () => {
      const updates = {
        marks_obtained: 27
      };

      const mockUpdatedMark = {
        id: 1,
        student_id: 1,
        assessment_id: 1,
        marks_obtained: 27,
        total_marks: 30
      };

      Mark.mockImplementation(() => ({
        update: jest.fn().mockResolvedValue(mockUpdatedMark)
      }));

      const response = await request(app)
        .put('/marks/1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('marks_obtained', 27);
    });

    it('should return 404 if mark not found', async () => {
      Mark.mockImplementation(() => ({
        update: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app)
        .put('/marks/999')
        .send({ marks_obtained: 25 });

      expect(response.status).toBe(404);
    });

    it('should validate updated marks', async () => {
      const invalidUpdate = {
        marks_obtained: 35 // Exceeds total_marks of 30
      };

      const response = await request(app)
        .put('/marks/1')
        .send(invalidUpdate);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /marks/:id', () => {
    it('should delete a mark record', async () => {
      Mark.mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue(true)
      }));

      const response = await request(app)
        .delete('/marks/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 if mark not found', async () => {
      Mark.mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue(false)
      }));

      const response = await request(app)
        .delete('/marks/999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /marks/student/:studentId', () => {
    it('should retrieve all marks for a student', async () => {
      const mockMarks = [
        { id: 1, assessment_name: 'Midterm', marks_obtained: 25 },
        { id: 2, assessment_name: 'Final', marks_obtained: 45 }
      ];

      Mark.mockImplementation(() => ({
        getByStudent: jest.fn().mockResolvedValue(mockMarks)
      }));

      const response = await request(app)
        .get('/marks/student/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array if student has no marks', async () => {
      Mark.mockImplementation(() => ({
        getByStudent: jest.fn().mockResolvedValue([])
      }));

      const response = await request(app)
        .get('/marks/student/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });
});
