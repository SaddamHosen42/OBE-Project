import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiSave, FiX } from 'react-icons/fi';

const MarksEntryForm = ({ 
  students = [], 
  questions = [], 
  existingMarks = [], 
  onSubmit,
  onUpdate,
  isLoading = false 
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marksEntries, setMarksEntries] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize marks entries when student changes
  useEffect(() => {
    if (selectedStudent) {
      const entries = {};
      questions.forEach(question => {
        const existingMark = existingMarks.find(
          m => m.student_id === selectedStudent.student_id && m.question_id === question.question_id
        );
        entries[question.question_id] = existingMark ? existingMark.marks_obtained : '';
      });
      setMarksEntries(entries);
      setErrors({});
    }
  }, [selectedStudent, questions, existingMarks]);

  // Handle student selection
  const handleStudentChange = (e) => {
    const studentId = parseInt(e.target.value);
    const student = students.find(s => s.student_id === studentId);
    setSelectedStudent(student);
  };

  // Handle marks input
  const handleMarksChange = (questionId, value) => {
    setMarksEntries(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  // Validate marks
  const validateMarks = () => {
    const newErrors = {};
    let isValid = true;

    Object.entries(marksEntries).forEach(([questionId, marks]) => {
      if (marks === '') return; // Skip empty entries
      
      const question = questions.find(q => q.question_id === parseInt(questionId));
      const marksNum = parseFloat(marks);
      
      if (isNaN(marksNum)) {
        newErrors[questionId] = 'Invalid marks value';
        isValid = false;
      } else if (marksNum < 0) {
        newErrors[questionId] = 'Marks cannot be negative';
        isValid = false;
      } else if (marksNum > question.total_marks) {
        newErrors[questionId] = `Maximum marks: ${question.total_marks}`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    if (!validateMarks()) {
      return;
    }

    // Filter out empty entries
    const filledEntries = Object.entries(marksEntries)
      .filter(([_, marks]) => marks !== '')
      .reduce((acc, [questionId, marks]) => ({
        ...acc,
        [questionId]: parseFloat(marks)
      }), {});

    if (Object.keys(filledEntries).length === 0) {
      alert('Please enter at least one mark');
      return;
    }

    onSubmit(selectedStudent.student_id, filledEntries);
  };

  // Calculate total marks
  const calculateTotal = () => {
    return Object.values(marksEntries)
      .filter(m => m !== '')
      .reduce((sum, m) => sum + parseFloat(m), 0);
  };

  // Calculate max possible marks
  const getMaxMarks = () => {
    return questions.reduce((sum, q) => sum + parseFloat(q.total_marks), 0);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student *
          </label>
          <select
            value={selectedStudent?.student_id || ''}
            onChange={handleStudentChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a student...</option>
            {students.map(student => (
              <option key={student.student_id} value={student.student_id}>
                {student.roll_number} - {student.student_name}
              </option>
            ))}
          </select>
        </div>

        {/* Marks Entry Fields */}
        {selectedStudent && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Enter Marks</h3>
              
              <div className="space-y-3">
                {questions.map((question) => (
                  <div 
                    key={question.question_id}
                    className="grid grid-cols-12 gap-4 items-start p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="col-span-8">
                      <div className="font-medium text-gray-900">
                        Question {question.question_number}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {question.question_text}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Max Marks: {question.total_marks} | Type: {question.question_type}
                      </div>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        min="0"
                        max={question.total_marks}
                        step="0.5"
                        value={marksEntries[question.question_id] || ''}
                        onChange={(e) => handleMarksChange(question.question_id, e.target.value)}
                        placeholder="Enter marks"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors[question.question_id]
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {errors[question.question_id] && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors[question.question_id]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-semibold text-gray-900">Total Marks:</span>
                <span className="text-2xl font-bold text-blue-900">
                  {calculateTotal().toFixed(2)} / {getMaxMarks()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <FiX />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FiSave />
                {isLoading ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedStudent && (
          <div className="text-center py-12 text-gray-500">
            <p>Select a student to begin entering marks</p>
          </div>
        )}
      </form>
    </div>
  );
};

MarksEntryForm.propTypes = {
  students: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  existingMarks: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default MarksEntryForm;
