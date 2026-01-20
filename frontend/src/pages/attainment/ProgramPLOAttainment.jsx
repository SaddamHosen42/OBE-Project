import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  RefreshCcw,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import usePLOAttainment from '../../hooks/usePLOAttainment';
import PLOAttainmentRadar from '../../components/attainment/PLOAttainmentRadar';
import PLOAttainmentTable from '../../components/attainment/PLOAttainmentTable';
import PLOTrendChart from '../../components/attainment/PLOTrendChart';
import AttainmentProgressBar from '../../components/attainment/AttainmentProgressBar';
import AttainmentLevelBadge from '../../components/attainment/AttainmentLevelBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProgramPLOAttainment() {
  const { degreeId } = useParams();
  const navigate = useNavigate();
  const {
    programAttainment,
    loading,
    error,
    fetchProgramAttainment,
    exportProgramAttainmentReport,
    calculateProgramAttainment
  } = usePLOAttainment();

  const [filters, setFilters] = useState({
    ploId: '',
    status: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (degreeId) {
      fetchProgramAttainment(degreeId, filters);
    }
  }, [degreeId, filters]);

  const handleRefresh = () => {
    if (degreeId) {
      fetchProgramAttainment(degreeId, filters);
    }
  };

  const handleRecalculate = async () => {
    try {
      await calculateProgramAttainment(degreeId);
      handleRefresh();
    } catch (err) {
      console.error('Recalculation failed:', err);
    }
  };

  const handleExport = async () => {
    try {
      await exportProgramAttainmentReport(degreeId, 'pdf');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  if (loading && !programAttainment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!programAttainment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 mb-4 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Program Not Found</h3>
        <button
          onClick={() => navigate('/attainment/plo/dashboard')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/attainment/plo/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {programAttainment.data?.degreeName}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {programAttainment.data?.departmentName} • Program PLO Attainment Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRecalculate}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recalculate
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

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-700 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PLOs</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {programAttainment.data?.totalPLOs || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {programAttainment.data?.totalStudents || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {programAttainment.data?.totalCourses || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Attainment</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {programAttainment.data?.averageAttainment || 0}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <AttainmentLevelBadge level={programAttainment.data?.attainmentLevel} />
          </div>
        </div>
      </div>

      {/* PLO Attainment Radar Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Program PLO Attainment Overview</h2>
        <PLOAttainmentRadar data={programAttainment.data?.plos || []} height={450} />
      </div>

      {/* PLO Details */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">PLO Performance Details</h2>
        <div className="space-y-4">
          {programAttainment.data?.plos?.map((plo) => (
            <div key={plo.ploId} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{plo.ploCode}</h3>
                    <AttainmentLevelBadge level={plo.attainmentLevel} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600">{plo.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {plo.attainmentPercentage}%
                  </p>
                </div>
              </div>

              <AttainmentProgressBar
                value={plo.attainmentPercentage}
                threshold={plo.threshold}
                className="mb-3"
              />

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Students Achieved</p>
                  <p className="font-semibold text-gray-900">
                    {plo.studentsAchieved}/{plo.totalStudents}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Average Score</p>
                  <p className="font-semibold text-gray-900">{plo.averageScore}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Threshold</p>
                  <p className="font-semibold text-gray-900">{plo.threshold}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Mapped Courses</p>
                  <p className="font-semibold text-gray-900">
                    {plo.mappedCourses?.length || 0}
                  </p>
                </div>
              </div>

              {/* Mapped Courses */}
              {plo.mappedCourses && plo.mappedCourses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700">
                    Mapped Courses
                  </h4>
                  <div className="space-y-2">
                    {plo.mappedCourses.map((course) => (
                      <div
                        key={course.courseId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">{course.courseCode}</span>
                          <span className="ml-2 text-sm text-gray-600">{course.courseName}</span>
                        </div>
                        <AttainmentProgressBar
                          value={course.contribution}
                          size="sm"
                          className="w-32"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      {programAttainment.data?.trendData && programAttainment.data.trendData.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">PLO Attainment Trends</h2>
          <PLOTrendChart
            data={programAttainment.data.trendData}
            plos={programAttainment.data.plos?.map(plo => ({
              key: plo.ploCode,
              name: plo.ploCode,
              color: plo.color
            }))}
          />
        </div>
      )}

      {/* Student Performance Summary */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Student PLO Attainment Summary</h2>
          <button
            onClick={() => navigate(`/attainment/plo/student?degreeId=${degreeId}`)}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            View All Students
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        {programAttainment.data?.studentSummary && (
          <PLOAttainmentTable
            data={programAttainment.data.studentSummary}
            columns={[
              { key: 'rollNumber', label: 'Roll No' },
              { key: 'name', label: 'Student Name' },
              {
                key: 'plosAchieved',
                label: 'PLOs Achieved',
                render: (value, row) => (
                  <span className="font-semibold text-green-600">
                    {value}/{row.totalPLOs}
                  </span>
                )
              },
              {
                key: 'averageAttainment',
                label: 'Average Attainment',
                render: (value) => (
                  <span className="font-semibold text-gray-900">{value}%</span>
                )
              },
              {
                key: 'attainmentLevel',
                label: 'Level',
                render: (value) => <AttainmentLevelBadge level={value} size="xs" />
              }
            ]}
            onRowClick={(student) => navigate(`/attainment/plo/student?studentId=${student.studentId}&degreeId=${degreeId}`)}
          />
        )}
      </div>
    </div>
  );
}
