import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  User,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import usePLOAttainment from '../../hooks/usePLOAttainment';
import PLOAttainmentTable from '../../components/attainment/PLOAttainmentTable';
import PLOAttainmentRadar from '../../components/attainment/PLOAttainmentRadar';
import AttainmentProgressBar from '../../components/attainment/AttainmentProgressBar';
import AttainmentLevelBadge from '../../components/attainment/AttainmentLevelBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StudentPLOAttainment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    studentAttainment,
    loading,
    error,
    fetchStudentAttainment,
    fetchStudentAllAttainment,
    exportStudentAttainmentReport
  } = usePLOAttainment();

  const [filters, setFilters] = useState({
    studentId: searchParams.get('studentId') || '',
    degreeId: searchParams.get('degreeId') || ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    if (filters.studentId && filters.degreeId) {
      fetchStudentAttainment(filters.studentId, filters.degreeId);
    } else if (filters.studentId) {
      fetchStudentAllAttainment(filters.studentId);
    }
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    if (filters.studentId && filters.degreeId) {
      fetchStudentAttainment(filters.studentId, filters.degreeId);
    } else if (filters.studentId) {
      fetchStudentAllAttainment(filters.studentId);
    }
  };

  const handleExport = async (studentId, degreeId) => {
    try {
      await exportStudentAttainmentReport(studentId, degreeId, 'pdf');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const toggleStudentExpansion = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const filteredData = studentAttainment?.data?.filter((student) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      student.rollNumber?.toLowerCase().includes(search) ||
      student.name?.toLowerCase().includes(search) ||
      student.email?.toLowerCase().includes(search)
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Student PLO Attainment</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and analyze individual student performance on Program Learning Outcomes
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
                placeholder="Search by roll number, name, or email..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree/Program ID
                </label>
                <input
                  type="text"
                  value={filters.degreeId}
                  onChange={(e) => handleFilterChange('degreeId', e.target.value)}
                  placeholder="Enter degree ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSearch}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-700 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Student Attainment Data */}
      {filteredData && filteredData.length > 0 ? (
        <div className="space-y-4">
          {filteredData.map((student) => (
            <div
              key={student.studentId}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Student Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleStudentExpansion(student.studentId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.name}
                      </h3>
                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                        <span>Roll: {student.rollNumber}</span>
                        <span>•</span>
                        <span>{student.email}</span>
                        {student.degreeName && (
                          <>
                            <span>•</span>
                            <span>{student.degreeName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <AttainmentLevelBadge level={student.attainmentLevel} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(student.studentId, student.degreeId);
                      }}
                      className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </button>
                    {expandedStudent === student.studentId ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedStudent === student.studentId && (
                <div className="p-6 border-t border-gray-200 space-y-6">
                  {/* PLO Attainment Radar */}
                  {student.ploAttainment && student.ploAttainment.length > 0 && (
                    <div>
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        PLO Attainment Overview
                      </h4>
                      <PLOAttainmentRadar data={student.ploAttainment} height={350} />
                    </div>
                  )}

                  {/* PLO Performance Details */}
                  {student.ploAttainment && student.ploAttainment.length > 0 && (
                    <div>
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        PLO Performance Details
                      </h4>
                      <div className="space-y-3">
                        {student.ploAttainment.map((plo) => (
                          <div key={plo.ploId} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-semibold text-gray-900">
                                  {plo.ploCode}
                                </span>
                                <p className="text-sm text-gray-600">{plo.description}</p>
                              </div>
                              <span className="text-lg font-bold text-gray-900">
                                {plo.attainmentPercentage}%
                              </span>
                            </div>
                            <AttainmentProgressBar
                              value={plo.attainmentPercentage}
                              threshold={plo.threshold}
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                              <span>Courses Completed: {plo.coursesCompleted}</span>
                              <span>Threshold: {plo.threshold}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Contributions */}
                  {student.courseContributions && student.courseContributions.length > 0 && (
                    <div>
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        Course Contributions to PLOs
                      </h4>
                      <PLOAttainmentTable
                        data={student.courseContributions}
                        columns={[
                          { key: 'courseCode', label: 'Course' },
                          { key: 'courseName', label: 'Course Name' },
                          { key: 'mappedPLOs', label: 'Mapped PLOs', render: (value) => value?.join(', ') || '-' },
                          { key: 'grade', label: 'Grade' },
                          {
                            key: 'contribution',
                            label: 'Contribution',
                            render: (value) => (
                              <span className="font-semibold text-indigo-600">{value}%</span>
                            )
                          }
                        ]}
                        onRowClick={(course) => navigate(`/courses/${course.courseId}`)}
                      />
                    </div>
                  )}

                  {/* Overall Statistics */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Courses</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {student.totalCourses || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">PLOs Achieved</p>
                      <p className="mt-1 text-2xl font-bold text-green-600">
                        {student.plosAchieved || 0}/{student.totalPLOs || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Average Attainment</p>
                      <p className="mt-1 text-2xl font-bold text-indigo-600">
                        {student.averageAttainment || 0}%
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
            {filters.studentId
              ? 'No data available for the specified student'
              : 'Enter a student ID to view PLO attainment data'}
          </p>
        </div>
      )}
    </div>
  );
}
