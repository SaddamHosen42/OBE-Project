import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CourseProgress = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseProgress();
  }, []);

  const fetchCourseProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/course-offerings/progress');
      
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching course progress:', err);
      setError(err.response?.data?.message || 'Failed to load course progress');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage) => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 60) return 'text-yellow-700';
    if (percentage >= 40) return 'text-orange-700';
    return 'text-red-700';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h2>
        <div className="text-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchCourseProgress}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Course Progress</h2>
        <button
          onClick={fetchCourseProgress}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No active courses</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {course.course_code} - {course.course_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.semester_name} • {course.enrolled_students || 0} students
                  </p>
                </div>
                <span className={`text-sm font-semibold ${getProgressTextColor(course.completion_percentage || 0)}`}>
                  {Math.round(course.completion_percentage || 0)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.completion_percentage || 0)}`}
                  style={{ width: `${course.completion_percentage || 0}%` }}
                ></div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Assessments</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {course.completed_assessments || 0}/{course.total_assessments || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Avg Score</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {course.average_score ? `${Math.round(course.average_score)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Attainment</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {course.attainment_percentage ? `${Math.round(course.attainment_percentage)}%` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3">
                <a
                  href={`/courses/${course.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href="/courses"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all courses →
        </a>
      </div>
    </div>
  );
};

export default CourseProgress;
