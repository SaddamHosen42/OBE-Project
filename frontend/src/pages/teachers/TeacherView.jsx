import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit, 
  FiTrash2, FiBook, FiBriefcase, FiAward, FiArrowLeft 
} from 'react-icons/fi';
import teacherService from '../../services/teacherService';
import CourseAssignment from '../../components/teacher/CourseAssignment';

const TeacherView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        
        const [teacherResponse, assignmentsResponse, statsResponse] = await Promise.all([
          teacherService.getTeacherById(id),
          teacherService.getTeacherCourseAssignments(id),
          teacherService.getTeacherStatistics(id)
        ]);

        if (teacherResponse.success) setTeacher(teacherResponse.data);
        if (assignmentsResponse.success) setCourseAssignments(assignmentsResponse.data);
        if (statsResponse.success) setStatistics(statsResponse.data);
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError(err.message || 'Failed to load teacher data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.user_name}?`)) {
      return;
    }

    try {
      const response = await teacherService.deleteTeacher(id);
      if (response.success) {
        alert('Teacher deleted successfully');
        navigate('/teachers');
      }
    } catch (err) {
      console.error('Error deleting teacher:', err);
      alert(err.message || 'Failed to delete teacher');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Teacher not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/teachers')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Teachers
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FiUser className="mr-3" />
              {teacher.user_name}
            </h1>
            <p className="text-gray-600 mt-1">{teacher.employee_id}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/teachers/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FiEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-lg font-bold text-gray-900">
                {teacher.department_name || 'N/A'}
              </p>
            </div>
            <FiBriefcase className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Designation</p>
              <p className="text-lg font-bold text-gray-900">
                {teacher.designation_name || teacher.designation || 'N/A'}
              </p>
            </div>
            <FiAward className="h-10 w-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Course Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{courseAssignments.length}</p>
            </div>
            <FiBook className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Years of Service</p>
              <p className="text-2xl font-bold text-gray-900">
                {teacher.hire_date ? new Date().getFullYear() - new Date(teacher.hire_date).getFullYear() : 'N/A'}
              </p>
            </div>
            <FiCalendar className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Assignments
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiMail className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Email:</span>
                <span className="text-gray-900">{teacher.user_email || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiPhone className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Phone:</span>
                <span className="text-gray-900">{teacher.user_phone || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiPhone className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Office Phone:</span>
                <span className="text-gray-900">{teacher.office_phone || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiMapPin className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Office Location:</span>
                <span className="text-gray-900">{teacher.office_location || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              Professional Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <FiBriefcase className="text-gray-400 mr-3 mt-1" />
                <div className="flex-1">
                  <span className="text-gray-600 block mb-1">Department:</span>
                  <span className="text-gray-900">{teacher.department_name || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start">
                <FiAward className="text-gray-400 mr-3 mt-1" />
                <div className="flex-1">
                  <span className="text-gray-600 block mb-1">Designation:</span>
                  <span className="text-gray-900">{teacher.designation_name || teacher.designation || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start">
                <FiCalendar className="text-gray-400 mr-3 mt-1" />
                <div className="flex-1">
                  <span className="text-gray-600 block mb-1">Hire Date:</span>
                  <span className="text-gray-900">
                    {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <FiBook className="text-gray-400 mr-3 mt-1" />
                <div className="flex-1">
                  <span className="text-gray-600 block mb-1">Specialization:</span>
                  <span className="text-gray-900">{teacher.specialization || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          {teacher.qualifications && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Qualifications
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{teacher.qualifications}</p>
            </div>
          )}

          {/* Bio */}
          {teacher.bio && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Bio
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{teacher.bio}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <CourseAssignment 
            teacherId={id} 
            assignments={courseAssignments}
            onUpdate={() => {
              // Refresh course assignments
              teacherService.getTeacherCourseAssignments(id).then(response => {
                if (response.success) setCourseAssignments(response.data);
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TeacherView;
