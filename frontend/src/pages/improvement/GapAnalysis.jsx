import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiFilter,
  FiBarChart2,
  FiTrendingDown,
  FiAlertTriangle,
  FiTarget
} from 'react-icons/fi';
import GapChart from '../../components/improvement/GapChart';
import DataTable from '../../components/data/DataTable';
import improvementService from '../../services/improvementService';

/**
 * GapAnalysis Component
 * Detailed view of performance gaps across CLOs, PLOs, and PEOs
 * Identifies areas requiring improvement and tracks progress
 */
const GapAnalysis = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState({
    cloGaps: [],
    ploGaps: [],
    peoGaps: [],
    summary: {
      totalGaps: 0,
      criticalGaps: 0,
      averageGap: 0,
      improvementNeeded: 0
    }
  });
  const [selectedType, setSelectedType] = useState('CLO');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGapAnalysis();
  }, [selectedType, selectedDepartment, selectedSemester]);

  const fetchGapAnalysis = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        type: selectedType,
        departmentId: selectedDepartment,
        semesterId: selectedSemester
      };
      
      const response = await improvementService.getGapAnalysis(params);
      
      if (response.success) {
        setAnalysisData(response.data);
      }
    } catch (err) {
      console.error('Error fetching gap analysis:', err);
      setError(err.message || 'Failed to load gap analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting gap analysis...');
  };

  const getGapData = () => {
    switch (selectedType) {
      case 'CLO':
        return analysisData.cloGaps;
      case 'PLO':
        return analysisData.ploGaps;
      case 'PEO':
        return analysisData.peoGaps;
      default:
        return [];
    }
  };

  const columns = [
    {
      key: 'code',
      label: `${selectedType} Code`,
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-primary">{item.code}</span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (item) => (
        <span className="text-sm">{item.description}</span>
      )
    },
    {
      key: 'target',
      label: 'Target (%)',
      sortable: true,
      render: (item) => (
        <span className="badge badge-info">{item.target}%</span>
      )
    },
    {
      key: 'actual',
      label: 'Actual (%)',
      sortable: true,
      render: (item) => (
        <span className={`badge ${item.actual >= item.target ? 'badge-success' : 'badge-error'}`}>
          {item.actual}%
        </span>
      )
    },
    {
      key: 'gap',
      label: 'Gap',
      sortable: true,
      render: (item) => {
        const gap = item.target - item.actual;
        const severity = gap > 20 ? 'error' : gap > 10 ? 'warning' : 'info';
        return (
          <div className="flex items-center gap-2">
            <span className={`badge badge-${severity}`}>
              {gap > 0 ? `-${gap.toFixed(1)}%` : `+${Math.abs(gap).toFixed(1)}%`}
            </span>
            {gap > 15 && <FiAlertTriangle className="w-4 h-4 text-error" />}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => {
        const gap = item.target - item.actual;
        let status = 'Met';
        let badgeClass = 'badge-success';
        
        if (gap > 20) {
          status = 'Critical';
          badgeClass = 'badge-error';
        } else if (gap > 10) {
          status = 'Needs Improvement';
          badgeClass = 'badge-warning';
        } else if (gap > 0) {
          status = 'Near Target';
          badgeClass = 'badge-info';
        }
        
        return <span className={`badge ${badgeClass}`}>{status}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (item) => (
        <div className="flex gap-2">
          <button 
            className="btn btn-xs btn-primary"
            onClick={() => navigate(`/action-plans/create?outcomeId=${item.id}&type=${selectedType}`)}
          >
            <FiTarget className="w-3 h-3" />
            Create Action Plan
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <FiAlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const gapData = getGapData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              Gap Analysis
            </h1>
            <p className="text-base-content/70 mt-2">
              Identify performance gaps and areas requiring improvement
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="btn btn-outline"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
          <button onClick={handleExport} className="btn btn-primary">
            <FiDownload className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h3 className="font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Outcome Type</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="CLO">Course Learning Outcomes (CLO)</option>
                  <option value="PLO">Program Learning Outcomes (PLO)</option>
                  <option value="PEO">Program Educational Objectives (PEO)</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Department</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {/* Add department options dynamically */}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Semester</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {/* Add semester options dynamically */}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Total Gaps</p>
                <p className="text-3xl font-bold">{analysisData.summary.totalGaps}</p>
              </div>
              <FiBarChart2 className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Critical Gaps</p>
                <p className="text-3xl font-bold text-error">
                  {analysisData.summary.criticalGaps}
                </p>
              </div>
              <FiAlertTriangle className="w-8 h-8 text-error" />
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Average Gap</p>
                <p className="text-3xl font-bold text-warning">
                  {analysisData.summary.averageGap.toFixed(1)}%
                </p>
              </div>
              <FiTrendingDown className="w-8 h-8 text-warning" />
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Improvement Needed</p>
                <p className="text-3xl font-bold text-info">
                  {analysisData.summary.improvementNeeded}%
                </p>
              </div>
              <FiTarget className="w-8 h-8 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Gap Visualization */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Gap Visualization</h2>
          <GapChart data={gapData} type={selectedType} height="400px" />
        </div>
      </div>

      {/* Detailed Gap Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Detailed Gap Analysis</h2>
          <DataTable
            data={gapData}
            columns={columns}
            searchable={true}
            searchPlaceholder={`Search ${selectedType}s...`}
          />
        </div>
      </div>
    </div>
  );
};

export default GapAnalysis;
