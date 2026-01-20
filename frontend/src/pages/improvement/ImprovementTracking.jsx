import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiPlus,
  FiFilter,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEdit,
  FiEye,
  FiTrendingUp
} from 'react-icons/fi';
import ImprovementTimeline from '../../components/improvement/ImprovementTimeline';
import CycleProgress from '../../components/improvement/CycleProgress';
import DataTable from '../../components/data/DataTable';
import improvementService from '../../services/improvementService';

/**
 * ImprovementTracking Component
 * Track and monitor improvement initiatives, action plans, and their outcomes
 * Provides detailed view of improvement cycles and progress tracking
 */
const ImprovementTracking = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState({
    cycles: [],
    actionPlans: [],
    timeline: [],
    stats: {
      totalInitiatives: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      successRate: 0
    }
  });
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTrackingData();
  }, [selectedStatus]);

  const fetchTrackingData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      };
      
      const response = await improvementService.getTrackingData(params);
      
      if (response.success) {
        setTrackingData(response.data);
        if (response.data.cycles.length > 0 && !selectedCycle) {
          setSelectedCycle(response.data.cycles[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError(err.message || 'Failed to load tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting improvement tracking data...');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'badge-success', icon: FiCheckCircle },
      'in-progress': { class: 'badge-warning', icon: FiClock },
      pending: { class: 'badge-info', icon: FiClock },
      cancelled: { class: 'badge-error', icon: FiXCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class} gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Initiative',
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold">{item.title}</p>
          <p className="text-xs text-base-content/70">{item.description}</p>
        </div>
      )
    },
    {
      key: 'cycle',
      label: 'Cycle',
      sortable: true,
      render: (item) => (
        <span className="badge badge-outline">{item.cycleName}</span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (item) => (
        <span className="badge badge-primary">{item.type}</span>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-8">
              <span className="text-xs">{item.owner.charAt(0)}</span>
            </div>
          </div>
          <span className="text-sm">{item.owner}</span>
        </div>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-24">
            <div className="w-full bg-base-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs font-semibold">{item.progress}%</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => getStatusBadge(item.status)
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (item) => (
        <span className="text-sm">{item.dueDate}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (item) => (
        <div className="flex gap-2">
          <button 
            className="btn btn-xs btn-ghost"
            onClick={() => navigate(`/action-plans/${item.id}`)}
          >
            <FiEye className="w-3 h-3" />
          </button>
          <button 
            className="btn btn-xs btn-ghost"
            onClick={() => navigate(`/action-plans/${item.id}/edit`)}
          >
            <FiEdit className="w-3 h-3" />
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
          <FiXCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

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
              Improvement Tracking
            </h1>
            <p className="text-base-content/70 mt-2">
              Monitor and track all improvement initiatives and action plans
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
          <button onClick={handleExport} className="btn btn-outline">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
          <Link to="/action-plans/create" className="btn btn-primary">
            <FiPlus className="w-4 h-4" />
            New Initiative
          </Link>
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
                  <span className="label-text">Status</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cycle</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={selectedCycle?.id || ''}
                  onChange={(e) => {
                    const cycle = trackingData.cycles.find(c => c.id === parseInt(e.target.value));
                    setSelectedCycle(cycle);
                  }}
                >
                  <option value="">All Cycles</option>
                  {trackingData.cycles.map(cycle => (
                    <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select className="select select-bordered">
                  <option value="">All Types</option>
                  <option value="curriculum">Curriculum</option>
                  <option value="teaching">Teaching Methods</option>
                  <option value="assessment">Assessment</option>
                  <option value="faculty">Faculty Development</option>
                  <option value="infrastructure">Infrastructure</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4">
            <p className="text-xs text-base-content/70">Total Initiatives</p>
            <p className="text-2xl font-bold">{trackingData.stats.totalInitiatives}</p>
          </div>
        </div>
        <div className="card bg-success text-success-content shadow">
          <div className="card-body p-4">
            <p className="text-xs opacity-80">Completed</p>
            <p className="text-2xl font-bold">{trackingData.stats.completed}</p>
          </div>
        </div>
        <div className="card bg-warning text-warning-content shadow">
          <div className="card-body p-4">
            <p className="text-xs opacity-80">In Progress</p>
            <p className="text-2xl font-bold">{trackingData.stats.inProgress}</p>
          </div>
        </div>
        <div className="card bg-info text-info-content shadow">
          <div className="card-body p-4">
            <p className="text-xs opacity-80">Pending</p>
            <p className="text-2xl font-bold">{trackingData.stats.pending}</p>
          </div>
        </div>
        <div className="card bg-primary text-primary-content shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4" />
              <p className="text-xs opacity-80">Success Rate</p>
            </div>
            <p className="text-2xl font-bold">{trackingData.stats.successRate}%</p>
          </div>
        </div>
      </div>

      {/* Current Cycle Progress */}
      {selectedCycle && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">Current Cycle: {selectedCycle.name}</h2>
            <CycleProgress cycle={selectedCycle} />
          </div>
        </div>
      )}

      {/* Improvement Timeline */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Improvement Timeline</h2>
          <ImprovementTimeline data={trackingData.timeline} />
        </div>
      </div>

      {/* Action Plans Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Action Plans & Initiatives</h2>
          <DataTable
            data={trackingData.actionPlans}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search initiatives..."
          />
        </div>
      </div>
    </div>
  );
};

export default ImprovementTracking;
