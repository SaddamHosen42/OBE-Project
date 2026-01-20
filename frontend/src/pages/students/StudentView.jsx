import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit, 
  FiTrash2, FiBook, FiAward, FiTrendingUp, FiArrowLeft 
} from 'react-icons/fi';
import studentService from '../../services/studentService';
import EnrollmentList from '../../components/student/EnrollmentList';
import ResultSummary from '../../components/student/ResultSummary';
import AttainmentProgress from '../../components/student/AttainmentProgress';

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [results, setResults] = useState(null);
  const [attainment, setAttainment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        
        const [studentResponse, enrollmentsResponse, resultsResponse, attainmentResponse] = await Promise.all([
          studentService.getStudentById(id),
          studentService.getStudentEnrollments(id),
          studentService.getStudentResults(id),
          studentService.getStudentAttainment(id)
        ]);

        if (studentResponse.success) setStudent(studentResponse.data);
        if (enrollmentsResponse.success) setEnrollments(enrollmentsResponse.data);
        if (resultsResponse.success) setResults(resultsResponse.data);
        if (attainmentResponse.success) setAttainment(attainmentResponse.data);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.message || 'Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
      return;
    }

    try {
      const response = await studentService.deleteStudent(id);
      if (response.success) {
        alert('Student deleted successfully');
        navigate('/students');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err.message || 'Failed to delete student');
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

  if (error || !student) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Student not found'}
        </div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    graduated: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Students
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FiUser className="mr-3" />
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-gray-600 mt-1">{student.student_id_number}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/students/${id}/edit`)}
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
              <p className="text-sm text-gray-600">CGPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
              </p>
            </div>
            <FiAward className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[student.academic_status] || 'bg-gray-100 text-gray-800'}`}>
                {student.academic_status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <FiTrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            </div>
            <FiBook className="h-10 w-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Batch</p>
              <p className="text-2xl font-bold text-gray-900">{student.batch_year}</p>
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
              onClick={() => setActiveTab('enrollments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Enrollments
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab('attainment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attainment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attainment
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
              Personal Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiMail className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Email:</span>
                <span className="text-gray-900">{student.email || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiPhone className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Phone:</span>
                <span className="text-gray-900">{student.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Date of Birth:</span>
                <span className="text-gray-900">
                  {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <FiUser className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Gender:</span>
                <span className="text-gray-900 capitalize">{student.gender || 'N/A'}</span>
              </div>
              {student.address && (
                <div className="flex items-start">
                  <FiMapPin className="text-gray-400 mr-3 mt-1" />
                  <span className="text-gray-600 w-32">Address:</span>
                  <span className="text-gray-900">
                    {student.address}
                    {student.city && `, ${student.city}`}
                    {student.state && `, ${student.state}`}
                    {student.postal_code && ` ${student.postal_code}`}
                    {student.country && `, ${student.country}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              Academic Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiBook className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Department:</span>
                <span className="text-gray-900">{student.department_name || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiBook className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Degree:</span>
                <span className="text-gray-900">{student.degree_name || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Batch Year:</span>
                <span className="text-gray-900">{student.batch_year || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">Admission Date:</span>
                <span className="text-gray-900">
                  {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <FiAward className="text-gray-400 mr-3" />
                <span className="text-gray-600 w-32">CGPA:</span>
                <span className="text-gray-900 font-semibold">{student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {(student.emergency_contact_name || student.emergency_contact_phone) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Emergency Contact
              </h2>
              <div className="space-y-3">
                {student.emergency_contact_name && (
                  <div className="flex items-center">
                    <FiUser className="text-gray-400 mr-3" />
                    <span className="text-gray-600 w-32">Name:</span>
                    <span className="text-gray-900">{student.emergency_contact_name}</span>
                  </div>
                )}
                {student.emergency_contact_phone && (
                  <div className="flex items-center">
                    <FiPhone className="text-gray-400 mr-3" />
                    <span className="text-gray-600 w-32">Phone:</span>
                    <span className="text-gray-900">{student.emergency_contact_phone}</span>
                  </div>
                )}
                {student.emergency_contact_relation && (
                  <div className="flex items-center">
                    <FiUser className="text-gray-400 mr-3" />
                    <span className="text-gray-600 w-32">Relation:</span>
                    <span className="text-gray-900">{student.emergency_contact_relation}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'enrollments' && (
        <EnrollmentList enrollments={enrollments} studentId={id} />
      )}

      {activeTab === 'results' && (
        <ResultSummary results={results} />
      )}

      {activeTab === 'attainment' && (
        <AttainmentProgress attainment={attainment} />
      )}
    </div>
  );
};

export default StudentView;
