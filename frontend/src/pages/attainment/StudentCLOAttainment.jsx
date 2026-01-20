import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  User,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import useCLOAttainment from '../../hooks/useCLOAttainment';
import CLOAttainmentTable from '../../components/attainment/CLOAttainmentTable';
import AttainmentProgressBar from '../../components/attainment/AttainmentProgressBar';
import AttainmentLevelBadge from '../../components/attainment/AttainmentLevelBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StudentCLOAttainment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    studentAttainment,
    loading,
    error,
    fetchStudentAttainment,
    exportStudentAttainmentReport
  } = useCLOAttainment();

  const [filters, setFilters] = useState({
    studentId: searchParams.get('studentId') || '',
    enrollmentId: searchParams.get('enrollmentId') || '',
    courseOfferingId: searchParams.get('courseOfferingId') || '',
    semester: searchParams.get('semester') || ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    if (filters.studentId || filters.enrollmentId || filters.courseOfferingId) {
      fetchStudentAttainment(filters);
    }
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setSearchParams({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    fetchStudentAttainment({ ...filters, search: searchTerm });
  };

  const handleExport = async (studentId) => {
    try {
      await exportStudentAttainmentReport(studentId);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const toggleStudentExpansion = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const filteredStudents = studentAttainment?.students?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading && !studentAttainment) {
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
          <h1 className="text-3xl font-bold text-gray-900">Student CLO Attainment</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and analyze individual student performance on Course Learning Outcomes
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by student name or roll number..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  value={filters.studentId}
                  onChange={(e) => handleFilterChange('studentId', e.target.value)}
                  placeholder="Enter student ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Enrollment ID
                </label>
                <input
                  type="text"
                  value={filters.enrollmentId}
                  onChange={(e) => handleFilterChange('enrollmentId', e.target.value)}
                  placeholder="Enter enrollment ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Course Offering
                </label>
                <input
                  type="text"
                  value={filters.courseOfferingId}
                  onChange={(e) => handleFilterChange('courseOfferingId', e.target.value)}
                  placeholder="Enter course offering ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
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
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Student List */}
      {filteredStudents.length > 0 ? (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div
              key={student.studentId}
              className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              {/* Student Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleStudentExpansion(student.studentId)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">
                      Roll No: {student.rollNumber} • ID: {student.studentId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Overall Attainment</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {student.overallAttainment}%
                      </span>
                      <AttainmentLevelBadge level={student.attainmentLevel} size="sm" />
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(student.studentId);
                    }}
                    className="p-2 text-gray-600 hover:text-indigo-600"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  {expandedStudent === student.studentId ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedStudent === student.studentId && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  {/* Course Enrollments */}
                  <div className="space-y-4">
                    {student.enrollments?.map((enrollment) => (
                      <div
                        key={enrollment.enrollmentId}
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {enrollment.courseCode} - {enrollment.courseName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {enrollment.semester} {enrollment.academicYear}
                            </p>
                          </div>
                          <AttainmentLevelBadge level={enrollment.attainmentLevel} />
                        </div>

                        {/* CLO Attainment */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-semibold text-gray-700">
                            CLO Performance
                          </h5>
                          {enrollment.cloAttainment?.map((clo) => (
                            <div key={clo.cloId} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  {clo.cloCode}: {clo.description}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {clo.attainmentPercentage}%
                                </span>
                              </div>
                              <AttainmentProgressBar
                                value={clo.attainmentPercentage}
                                threshold={clo.threshold}
                                size="sm"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Score: {clo.obtainedMarks}/{clo.totalMarks}</span>
                                <span>Threshold: {clo.threshold}%</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Assessment Breakdown */}
                        {enrollment.assessments && enrollment.assessments.length > 0 && (
                          <div className="pt-4 mt-4 border-t border-gray-200">
                            <h5 className="mb-3 text-sm font-semibold text-gray-700">
                              Assessment Breakdown
                            </h5>
                            <CLOAttainmentTable
                              data={enrollment.assessments}
                              columns={[
                                { key: 'name', label: 'Assessment' },
                                { key: 'type', label: 'Type' },
                                { key: 'obtainedMarks', label: 'Obtained' },
                                { key: 'totalMarks', label: 'Total' },
                                { key: 'percentage', label: 'Percentage' }
                              ]}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Overall Statistics */}
                  <div className="grid grid-cols-3 gap-4 p-4 mt-4 bg-white border border-gray-200 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Courses</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {student.totalCourses}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">CLOs Achieved</p>
                      <p className="mt-1 text-2xl font-bold text-green-600">
                        {student.closAchieved}/{student.totalClos}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="mt-1 text-2xl font-bold text-indigo-600">
                        {student.averageScore}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white border border-gray-200 rounded-lg">
          <TrendingUp className="w-16 h-16 mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No Students Found</h3>
          <p className="text-sm text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
