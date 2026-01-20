import React from 'react';
import { FiBook, FiCalendar, FiUser, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const EnrollmentList = ({ enrollments, studentId }) => {
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No enrollments found</p>
        <p className="text-gray-500 text-sm mt-2">The student has not been enrolled in any courses yet.</p>
      </div>
    );
  }

  const statusColors = {
    enrolled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiClock },
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle },
    dropped: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle },
    withdrawn: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiXCircle },
  };

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => {
        const status = statusColors[enrollment.status] || statusColors.enrolled;
        const StatusIcon = status.icon;

        return (
          <div 
            key={enrollment.enrollment_id} 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
          >
            <div className="flex items-start justify-between">
              {/* Course Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <FiBook className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {enrollment.course_code} - {enrollment.course_name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Semester */}
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="mr-2 h-4 w-4" />
                    <div>
                      <span className="text-gray-500">Semester: </span>
                      <span className="font-medium">{enrollment.semester_name || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Session */}
                  {enrollment.session_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      <div>
                        <span className="text-gray-500">Session: </span>
                        <span className="font-medium">{enrollment.session_name}</span>
                      </div>
                    </div>
                  )}

                  {/* Instructor */}
                  {enrollment.teacher_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUser className="mr-2 h-4 w-4" />
                      <div>
                        <span className="text-gray-500">Instructor: </span>
                        <span className="font-medium">{enrollment.teacher_name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grades and Performance */}
                {enrollment.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {enrollment.obtained_marks !== null && (
                        <div>
                          <p className="text-xs text-gray-500">Marks</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {enrollment.obtained_marks}/{enrollment.total_marks}
                          </p>
                        </div>
                      )}
                      {enrollment.grade && (
                        <div>
                          <p className="text-xs text-gray-500">Grade</p>
                          <p className="text-lg font-semibold text-blue-600">{enrollment.grade}</p>
                        </div>
                      )}
                      {enrollment.grade_point !== null && (
                        <div>
                          <p className="text-xs text-gray-500">Grade Point</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {enrollment.grade_point.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {enrollment.credit_hours && (
                        <div>
                          <p className="text-xs text-gray-500">Credit Hours</p>
                          <p className="text-lg font-semibold text-gray-900">{enrollment.credit_hours}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="ml-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {enrollment.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Enrollment Dates */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>
                Enrolled: {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : 'N/A'}
              </span>
              {enrollment.completion_date && (
                <span>
                  Completed: {new Date(enrollment.completion_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnrollmentList;
