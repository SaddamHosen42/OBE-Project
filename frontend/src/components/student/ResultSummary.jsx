import React from 'react';
import { FiAward, FiTrendingUp, FiBook, FiBarChart2 } from 'react-icons/fi';

const ResultSummary = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FiAward className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No results available</p>
        <p className="text-gray-500 text-sm mt-2">Results will appear here once grades are posted.</p>
      </div>
    );
  }

  const { cgpa, enrollments, course_results } = results;

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <FiAward className="h-12 w-12 mx-auto mb-2" />
            <p className="text-blue-100 text-sm">Cumulative GPA</p>
            <p className="text-4xl font-bold">{cgpa ? cgpa.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="text-center">
            <FiBook className="h-12 w-12 mx-auto mb-2" />
            <p className="text-blue-100 text-sm">Courses Completed</p>
            <p className="text-4xl font-bold">
              {course_results ? course_results.filter(r => r.status === 'completed').length : 0}
            </p>
          </div>
          <div className="text-center">
            <FiTrendingUp className="h-12 w-12 mx-auto mb-2" />
            <p className="text-blue-100 text-sm">Total Credit Hours</p>
            <p className="text-4xl font-bold">
              {course_results ? course_results.reduce((sum, r) => sum + (r.credit_hours || 0), 0) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Course Results */}
      {course_results && course_results.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiBarChart2 className="mr-2" />
              Course Results
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Hours
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade Point
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {course_results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.course_code}</div>
                      <div className="text-sm text-gray-500">{result.course_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.semester_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {result.credit_hours || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {result.obtained_marks !== null && result.total_marks !== null
                        ? `${result.obtained_marks}/${result.total_marks}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {result.grade_point !== null ? result.grade_point.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : result.status === 'enrolled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {result.status?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FiBook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No course results available</p>
        </div>
      )}

      {/* Semester-wise Performance */}
      {enrollments && enrollments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiTrendingUp className="mr-2" />
            Semester-wise Performance
          </h3>
          <div className="space-y-4">
            {enrollments.map((enrollment, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{enrollment.semester_name}</h4>
                    <p className="text-sm text-gray-500">{enrollment.session_name}</p>
                  </div>
                  <div className="text-right">
                    {enrollment.semester_gpa !== null && (
                      <>
                        <p className="text-2xl font-bold text-blue-600">
                          {enrollment.semester_gpa.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Semester GPA</p>
                      </>
                    )}
                  </div>
                </div>
                {enrollment.courses_count !== undefined && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    Courses: {enrollment.courses_count} | 
                    Credits: {enrollment.total_credits || 0}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultSummary;
