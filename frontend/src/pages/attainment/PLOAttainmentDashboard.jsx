import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  RefreshCcw,
  Download,
  Filter,
  BookOpen
} from 'lucide-react';
import usePLOAttainment from '../../hooks/usePLOAttainment';
import PLOAttainmentRadar from '../../components/attainment/PLOAttainmentRadar';
import PLOTrendChart from '../../components/attainment/PLOTrendChart';
import AttainmentProgressBar from '../../components/attainment/AttainmentProgressBar';
import AttainmentLevelBadge from '../../components/attainment/AttainmentLevelBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PLOAttainmentDashboard() {
  const navigate = useNavigate();
  const { 
    attainmentSummary, 
    loading, 
    error, 
    fetchAttainmentSummary,
    exportProgramAttainmentReport 
  } = usePLOAttainment();

  const [filters, setFilters] = useState({
    academicSession: '',
    degreeId: '',
    department: ''
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
      if (filters.degreeId) {
        await exportProgramAttainmentReport(filters.degreeId, 'pdf');
      }
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
      degreeId: '',
      department: ''
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
          <h1 className="text-3xl font-bold text-gray-900">PLO Attainment Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and analyze Program Learning Outcomes attainment across programs
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
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            disabled={!filters.degreeId}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                Program/Degree
              </label>
              <input
                type="text"
                value={filters.degreeId}
                onChange={(e) => handleFilterChange('degreeId', e.target.value)}
                placeholder="Enter degree ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
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
        <div className="flex items-center p-4 text-red-700 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Programs</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {attainmentSummary?.totalPrograms || 0}
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
              <p className="text-sm font-medium text-gray-600">Total PLOs</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {attainmentSummary?.totalPLOs || 0}
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

      {/* PLO Attainment Radar Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">PLO Attainment Overview</h2>
          <BarChart3 className="w-5 h-5 text-gray-600" />
        </div>
        <PLOAttainmentRadar data={attainmentSummary?.ploData || []} />
      </div>

      {/* PLO Performance by Program */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">PLO Performance by Program</h2>
        <div className="space-y-4">
          {attainmentSummary?.programAttainment?.map((program) => (
            <div
              key={program.degreeId}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
              onClick={() => navigate(`/attainment/plo/program/${program.degreeId}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{program.degreeName}</h3>
                  <p className="text-sm text-gray-600">{program.departmentName}</p>
                </div>
                <AttainmentLevelBadge level={program.attainmentLevel} />
              </div>

              <div className="space-y-2">
                {program.plos?.map((plo) => (
                  <div key={plo.ploId} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 w-20">
                      {plo.ploCode}
                    </span>
                    <AttainmentProgressBar
                      value={plo.attainmentPercentage}
                      threshold={plo.threshold}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {plo.attainmentPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      {attainmentSummary?.trendData && attainmentSummary.trendData.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">PLO Attainment Trends</h2>
          <PLOTrendChart
            data={attainmentSummary.trendData}
            plos={attainmentSummary.ploList || []}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate('/attainment/plo/student')}
          className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <Users className="w-8 h-8 mb-3 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Student PLO Attainment</h3>
          <p className="mt-1 text-sm text-gray-600">
            View individual student performance
          </p>
        </button>

        <button
          onClick={() => navigate('/attainment/plo/program')}
          className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <BookOpen className="w-8 h-8 mb-3 text-green-600" />
          <h3 className="font-semibold text-gray-900">Program Attainment</h3>
          <p className="mt-1 text-sm text-gray-600">
            Analyze program-level outcomes
          </p>
        </button>

        <button
          onClick={() => navigate('/attainment/plo/reports')}
          className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <BarChart3 className="w-8 h-8 mb-3 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Reports</h3>
          <p className="mt-1 text-sm text-gray-600">
            Generate and download reports
          </p>
        </button>
      </div>
    </div>
  );
}
