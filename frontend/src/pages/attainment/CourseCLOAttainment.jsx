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
import useCLOAttainment from '../../hooks/useCLOAttainment';
import CLOAttainmentChart from '../../components/attainment/CLOAttainmentChart';
import CLOAttainmentTable from '../../components/attainment/CLOAttainmentTable';
import AttainmentProgressBar from '../../components/attainment/AttainmentProgressBar';
import AttainmentLevelBadge from '../../components/attainment/AttainmentLevelBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CourseCLOAttainment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    courseAttainment,
    loading,
    error,
    fetchCourseAttainment,
    exportCourseAttainmentReport
  } = useCLOAttainment();

  const [selectedOffering, setSelectedOffering] = useState('all');

  useEffect(() => {
    if (courseId) {
      fetchCourseAttainment(courseId, selectedOffering);
    }
  }, [courseId, selectedOffering]);

  const handleRefresh = () => {
    fetchCourseAttainment(courseId, selectedOffering);
  };

  const handleExport = async () => {
    try {
      await exportCourseAttainmentReport(courseId, selectedOffering);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading && !courseAttainment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!courseAttainment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 mb-4 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Course Not Found</h3>
        <button
          onClick={() => navigate('/attainment/dashboard')}
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
            onClick={() => navigate('/attainment/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {courseAttainment.courseCode} - {courseAttainment.courseName}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Course Learning Outcomes Attainment Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
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

      {/* Course Offering Filter */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select Course Offering
        </label>
        <select
          value={selectedOffering}
          onChange={(e) => setSelectedOffering(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent md:w-96"
        >
          <option value="all">All Offerings</option>
          {courseAttainment.offerings?.map((offering) => (
            <option key={offering.offeringId} value={offering.offeringId}>
              {offering.semester} {offering.academicYear} - {offering.section}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total CLOs</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {courseAttainment.totalCLOs || 0}
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
              <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {courseAttainment.enrolledStudents || 0}
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
              <p className="text-sm font-medium text-gray-600">Average Attainment</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {courseAttainment.averageAttainment || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attainment Status</p>
              <div className="mt-2">
                <AttainmentLevelBadge level={courseAttainment.attainmentLevel} />
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* CLO Attainment Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">CLO Attainment Distribution</h2>
        <CLOAttainmentChart
          data={courseAttainment.cloChartData}
          type="bar"
          showThreshold
        />
      </div>

      {/* Detailed CLO Analysis */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">CLO Performance Details</h2>
        <div className="space-y-4">
          {courseAttainment.clos?.map((clo) => (
            <div
              key={clo.cloId}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{clo.cloCode}</h3>
                    <AttainmentLevelBadge level={clo.attainmentLevel} size="sm" />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{clo.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {clo.attainmentPercentage}%
                  </p>
                  <p className="text-xs text-gray-600">Attainment</p>
                </div>
              </div>

              <AttainmentProgressBar
                value={clo.attainmentPercentage}
                threshold={clo.threshold}
                className="mb-3"
              />

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Students Achieved</p>
                  <p className="font-semibold text-gray-900">
                    {clo.studentsAchieved}/{clo.totalStudents}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Average Score</p>
                  <p className="font-semibold text-gray-900">{clo.averageScore}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Threshold</p>
                  <p className="font-semibold text-gray-900">{clo.threshold}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Mapped PLOs</p>
                  <p className="font-semibold text-gray-900">
                    {clo.mappedPLOs?.join(', ') || 'None'}
                  </p>
                </div>
              </div>

              {/* Assessment Breakdown */}
              {clo.assessments && clo.assessments.length > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700">
                    Assessment Breakdown
                  </h4>
                  <div className="space-y-2">
                    {clo.assessments.map((assessment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">{assessment.name}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {assessment.averageScore}%
                          </span>
                          <AttainmentProgressBar
                            value={assessment.averageScore}
                            threshold={clo.threshold}
                            size="sm"
                            className="w-32"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Student-wise CLO Attainment</h2>
          <button
            onClick={() => navigate(`/attainment/student?courseOfferingId=${selectedOffering}`)}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <CLOAttainmentTable
          data={courseAttainment.studentPerformance}
          columns={[
            { key: 'rollNumber', label: 'Roll No' },
            { key: 'name', label: 'Student Name' },
            ...courseAttainment.clos?.map(clo => ({
              key: `clo_${clo.cloId}`,
              label: clo.cloCode,
              render: (value) => (
                <span className={`font-semibold ${value >= clo.threshold ? 'text-green-600' : 'text-red-600'}`}>
                  {value}%
                </span>
              )
            })) || [],
            {
              key: 'overall',
              label: 'Overall',
              render: (value) => (
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{value}%</span>
                  <AttainmentLevelBadge level={value >= 70 ? 'high' : value >= 50 ? 'medium' : 'low'} size="xs" />
                </div>
              )
            }
          ]}
        />
      </div>

      {/* PLO Mapping */}
      {courseAttainment.ploMapping && courseAttainment.ploMapping.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">PLO Contribution</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {courseAttainment.ploMapping.map((plo) => (
              <div key={plo.ploId} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{plo.ploCode}</h3>
                  <span className="text-sm font-semibold text-gray-900">
                    {plo.contribution}%
                  </span>
                </div>
                <p className="mb-3 text-sm text-gray-600">{plo.description}</p>
                <AttainmentProgressBar value={plo.contribution} size="sm" />
                <p className="mt-2 text-xs text-gray-500">
                  Mapped CLOs: {plo.mappedCLOs?.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
