import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiBook, FiUsers, FiCalendar } from 'react-icons/fi';
import teacherService from '../../services/teacherService';
import courseService from '../../services/courseService';
import semesterService from '../../services/semesterService';

const CourseAssignment = ({ teacherId, assignments = [], onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    semester_id: '',
    section: 'A',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, semestersResponse] = await Promise.all([
          courseService.getAllCourses({ limit: 100 }),
          semesterService.getAllSemesters({ limit: 100 })
        ]);
        
        if (coursesResponse.success) setCourses(coursesResponse.data);
        if (semestersResponse.success) setSemesters(semestersResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await teacherService.assignCourse(teacherId, formData);
      
      if (response.success) {
        alert('Course assigned successfully!');
        setShowAddModal(false);
        setFormData({ course_id: '', semester_id: '', section: 'A' });
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error assigning course:', err);
      alert(err.message || 'Failed to assign course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (offeringId) => {
    if (!window.confirm('Are you sure you want to remove this course assignment?')) {
      return;
    }

    try {
      const response = await teacherService.removeCourseAssignment(teacherId, offeringId);
      
      if (response.success) {
        alert('Course assignment removed successfully!');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error removing course assignment:', err);
      alert(err.message || 'Failed to remove course assignment');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Course Assignments</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Assign Course
        </button>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiBook className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No course assignments</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by assigning a course to this teacher.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.offering_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.course_code} - {assignment.course_name}
                  </h3>
                  <p className="text-sm text-gray-500">Section: {assignment.section}</p>
                </div>
                <button
                  onClick={() => handleRemove(assignment.offering_id)}
                  className="text-red-600 hover:text-red-900"
                  title="Remove Assignment"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <FiCalendar className="mr-2 h-4 w-4" />
                  <span>{assignment.semester_name || 'N/A'}</span>
                </div>
                {assignment.enrollment_count !== undefined && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="mr-2 h-4 w-4" />
                    <span>{assignment.enrollment_count} students enrolled</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Course
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.semester_id}
                    onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester.semester_id} value={semester.semester_id}>
                        {semester.name} ({semester.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A, B, C"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ course_id: '', semester_id: '', section: 'A' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Assigning...' : 'Assign Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssignment;
