import React from 'react';
import PropTypes from 'prop-types';

const MarksTable = ({ 
  students = [], 
  questions = [], 
  marksData = [], 
  onUpdate = null,
  readonly = false,
  showTotals = true,
  isLoading = false 
}) => {
  // Get marks for a specific student and question
  const getMarks = (studentId, questionId) => {
    const mark = marksData.find(
      m => m.student_id === studentId && m.question_id === questionId
    );
    return mark ? mark.marks_obtained : '';
  };

  // Get mark ID for a specific student and question
  const getMarkId = (studentId, questionId) => {
    const mark = marksData.find(
      m => m.student_id === studentId && m.question_id === questionId
    );
    return mark ? mark.mark_id : null;
  };

  // Calculate total marks for a student
  const getStudentTotal = (studentId) => {
    const studentMarks = marksData.filter(m => m.student_id === studentId);
    return studentMarks.reduce((sum, m) => sum + (parseFloat(m.marks_obtained) || 0), 0);
  };

  // Calculate max possible marks
  const getMaxMarks = () => {
    return questions.reduce((sum, q) => sum + (parseFloat(q.total_marks) || 0), 0);
  };

  // Handle marks change
  const handleMarksChange = (studentId, questionId, value) => {
    if (readonly || !onUpdate) return;
    
    const markId = getMarkId(studentId, questionId);
    if (markId) {
      onUpdate(markId, { marks_obtained: parseFloat(value) || 0 });
    }
  };

  if (students.length === 0 || questions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"
            >
              #
            </th>
            <th 
              scope="col" 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-10"
            >
              Roll No.
            </th>
            <th 
              scope="col" 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-32 bg-gray-50 z-10"
            >
              Student Name
            </th>
            {questions.map((question) => (
              <th 
                key={question.question_id}
                scope="col" 
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div>Q{question.question_number}</div>
                <div className="text-gray-400 font-normal">({question.total_marks})</div>
              </th>
            ))}
            {showTotals && (
              <th 
                scope="col" 
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50"
              >
                Total
                <div className="text-gray-400 font-normal">({getMaxMarks()})</div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, index) => (
            <tr key={student.student_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 sticky left-0 bg-white">
                {index + 1}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-12 bg-white">
                {student.roll_number}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 sticky left-32 bg-white">
                {student.student_name}
              </td>
              {questions.map((question) => {
                const marks = getMarks(student.student_id, question.question_id);
                return (
                  <td 
                    key={question.question_id}
                    className="px-4 py-3 whitespace-nowrap text-center"
                  >
                    {readonly ? (
                      <span className={`text-sm ${marks !== '' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                        {marks !== '' ? marks : '-'}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max={question.total_marks}
                        step="0.5"
                        value={marks}
                        onChange={(e) => handleMarksChange(student.student_id, question.question_id, e.target.value)}
                        disabled={isLoading}
                        className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    )}
                  </td>
                );
              })}
              {showTotals && (
                <td className="px-4 py-3 whitespace-nowrap text-center bg-blue-50">
                  <span className="text-sm font-bold text-blue-900">
                    {getStudentTotal(student.student_id).toFixed(2)}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {showTotals && (
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50">
                Average
              </td>
              {questions.map((question) => {
                const questionMarks = marksData.filter(m => m.question_id === question.question_id);
                const average = questionMarks.length > 0
                  ? questionMarks.reduce((sum, m) => sum + (parseFloat(m.marks_obtained) || 0), 0) / questionMarks.length
                  : 0;
                return (
                  <td 
                    key={question.question_id}
                    className="px-4 py-3 text-center text-sm font-medium text-gray-900"
                  >
                    {average.toFixed(2)}
                  </td>
                );
              })}
              {showTotals && (
                <td className="px-4 py-3 text-center text-sm font-bold text-blue-900 bg-blue-50">
                  {students.length > 0
                    ? (students.reduce((sum, s) => sum + getStudentTotal(s.student_id), 0) / students.length).toFixed(2)
                    : '0.00'}
                </td>
              )}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

MarksTable.propTypes = {
  students: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  marksData: PropTypes.array.isRequired,
  onUpdate: PropTypes.func,
  readonly: PropTypes.bool,
  showTotals: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default MarksTable;
