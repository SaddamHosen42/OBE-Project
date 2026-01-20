import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  AlertCircle,
  RefreshCcw,
  Download,
  Filter
} from 'lucide-react';
import useCLOAttainment from '../../hooks/useCLOAttainment';
import CLOAttainmentChart from '../../components/attainment/CLOAttainmentChart';
import AttainmentProgressBar from '../../components/attainment/AttainmentProgressBar';
import AttainmentLevelBadge from '../../components/attainment/AttainmentLevelBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CLOAttainmentDashboard() {
  const navigate = useNavigate();
  const { 
    attainmentSummary, 
    loading, 
    error, 
    fetchAttainmentSummary,
    exportAttainmentReport 
  } = useCLOAttainment();

  const [filters, setFilters] = useState({
    academicSession: '',
    semester: '',
    department: '',
    course: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAttainmentSummary(filters);
  }, [filters]);

  const handleRefresh = () => {
    fetchAttainmentSummary(filters);
  };

  const handleExport = async () => {
    try {
      await exportAttainmentReport(filters);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      academicSession: '',
      semester: '',
      department: '',
      course: ''
    });
  };

  if (loading && !attainmentSummary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CLO Attainment Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and analyze Course Learning Outcomes attainment across programs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={filters.academicSession}
                onChange={(e) => handleFilterChange('academicSession', e.target.value)}
                placeholder="e.g., 2023-2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Semesters</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                placeholder="Enter department"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <input
                type="text"
                value={filters.course}
                onChange={(e) => handleFilterChange('course', e.target.value)}
                placeholder="Enter course code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {attainmentSummary?.totalCourses || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Across all departments</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total CLOs</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {attainmentSummary?.totalCLOs || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Learning outcomes tracked</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students Assessed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {attainmentSummary?.totalStudents || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Active enrollments</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Attainment</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {attainmentSummary?.averageAttainment || 0}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <AttainmentLevelBadge level={attainmentSummary?.attainmentLevel} />
          </div>
        </div>
      </div>

      {/* Attainment Overview Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">CLO Attainment Overview</h2>
          <BarChart3 className="w-5 h-5 text-gray-600" />
        </div>
        <CLOAttainmentChart data={attainmentSummary?.chartData} />
      </div>

      {/* CLO Performance by Course */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">CLO Performance by Course</h2>
        <div className="space-y-4">
          {attainmentSummary?.courseAttainment?.map((course) => (
            <div
              key={course.courseId}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
              onClick={() => navigate(`/attainment/course/${course.courseId}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{course.courseCode}</h3>
                  <p className="text-sm text-gray-600">{course.courseName}</p>
                </div>
                <AttainmentLevelBadge level={course.attainmentLevel} />
              </div>
              <div className="space-y-2">
                {course.clos?.map((clo) => (
                  <div key={clo.cloId} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 w-20">
                      {clo.cloCode}
                    </span>
                    <AttainmentProgressBar
                      value={clo.attainmentPercentage}
                      threshold={clo.threshold}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {clo.attainmentPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate('/attainment/student')}
          className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <Users className="w-8 h-8 mb-3 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Student Attainment</h3>
          <p className="mt-1 text-sm text-gray-600">
            View individual student performance
          </p>
        </button>

        <button
          onClick={() => navigate('/attainment/course')}
          className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <BookOpen className="w-8 h-8 mb-3 text-green-600" />
          <h3 className="font-semibold text-gray-900">Course Attainment</h3>
          <p className="mt-1 text-sm text-gray-600">
            Analyze course-level outcomes
          </p>
        </button>

        <button
          onClick={() => navigate('/attainment/report')}
          className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <BarChart3 className="w-8 h-8 mb-3 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Generate Reports</h3>
          <p className="mt-1 text-sm text-gray-600">
            Create comprehensive attainment reports
          </p>
        </button>
      </div>
    </div>
  );
}
