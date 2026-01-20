import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiTarget, 
  FiActivity, 
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiBarChart2,
  FiArrowRight
} from 'react-icons/fi';
import GapChart from '../../components/improvement/GapChart';
import ImprovementTimeline from '../../components/improvement/ImprovementTimeline';
import CycleProgress from '../../components/improvement/CycleProgress';
import improvementService from '../../services/improvementService';

/**
 * CIDashboard Component
 * Main dashboard for Continuous Improvement tracking and monitoring
 * Displays overview of improvement cycles, gap analysis, and progress tracking
 */
const CIDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    activeCycles: 0,
    completedActions: 0,
    pendingActions: 0,
    averageImprovement: 0,
    currentCycle: null,
    recentImprovements: [],
    gapAnalysis: [],
    upcomingMilestones: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await improvementService.getDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

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
          <FiAlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Continuous Improvement Dashboard
          </h1>
          <p className="text-base-content/70 mt-2">
            Monitor and track improvement initiatives across the institution
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/improvement/gap-analysis" className="btn btn-outline btn-primary">
            <FiBarChart2 className="w-4 h-4" />
            Gap Analysis
          </Link>
          <Link to="/improvement/tracking" className="btn btn-primary">
            <FiActivity className="w-4 h-4" />
            Track Improvements
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Cycles */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Active Cycles</p>
                <p className="text-3xl font-bold text-primary">
                  {dashboardData.activeCycles}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-success">↑ Active improvement cycles</span>
            </div>
          </div>
        </div>

        {/* Completed Actions */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Completed Actions</p>
                <p className="text-3xl font-bold text-success">
                  {dashboardData.completedActions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-base-content/70">
                {dashboardData.pendingActions} pending
              </span>
            </div>
          </div>
        </div>

        {/* Average Improvement */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Avg. Improvement</p>
                <p className="text-3xl font-bold text-info">
                  {dashboardData.averageImprovement}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-info" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-success">↑ 12% from last cycle</span>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Pending Actions</p>
                <p className="text-3xl font-bold text-warning">
                  {dashboardData.pendingActions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <FiClock className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-base-content/70">Require attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Cycle Progress - Spans 2 columns */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Current Improvement Cycle</h2>
                <Link to="/improvement/tracking" className="btn btn-sm btn-ghost">
                  View All <FiArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <CycleProgress cycle={dashboardData.currentCycle} />
            </div>
          </div>

          {/* Gap Analysis Chart */}
          <div className="card bg-base-100 shadow-lg mt-6">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Performance Gap Analysis</h2>
                <Link to="/improvement/gap-analysis" className="btn btn-sm btn-ghost">
                  Detailed View <FiArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <GapChart data={dashboardData.gapAnalysis} height="300px" />
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Improvements & Upcoming Milestones */}
        <div className="space-y-6">
          {/* Recent Improvements */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Recent Improvements</h2>
              <div className="space-y-4">
                {dashboardData.recentImprovements.length > 0 ? (
                  dashboardData.recentImprovements.map((improvement, index) => (
                    <div key={index} className="border-l-4 border-success pl-4 py-2">
                      <p className="font-semibold text-sm">{improvement.title}</p>
                      <p className="text-xs text-base-content/70 mt-1">
                        {improvement.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge badge-success badge-sm">
                          +{improvement.improvement}%
                        </span>
                        <span className="text-xs text-base-content/60">
                          {improvement.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-base-content/70 text-center py-4">
                    No recent improvements recorded
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Upcoming Milestones</h2>
              <div className="space-y-3">
                {dashboardData.upcomingMilestones.length > 0 ? (
                  dashboardData.upcomingMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{milestone.title}</p>
                        <p className="text-xs text-base-content/70 mt-1">
                          Due: {milestone.dueDate}
                        </p>
                        <div className="mt-2">
                          <div className="w-full bg-base-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-base-content/70 text-center py-4">
                    No upcoming milestones
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-primary text-primary-content shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/action-plans/create" className="btn btn-sm btn-ghost w-full justify-start">
                  <FiTarget className="w-4 h-4" />
                  Create Action Plan
                </Link>
                <Link to="/improvement/gap-analysis" className="btn btn-sm btn-ghost w-full justify-start">
                  <FiBarChart2 className="w-4 h-4" />
                  Run Gap Analysis
                </Link>
                <Link to="/reviews/create" className="btn btn-sm btn-ghost w-full justify-start">
                  <FiCheckCircle className="w-4 h-4" />
                  Schedule Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Timeline */}
      <div className="card bg-base-100 shadow-lg mt-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">Improvement Timeline</h2>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost">Last 6 Months</button>
              <button className="btn btn-sm btn-ghost">Last Year</button>
              <button className="btn btn-sm btn-ghost">All Time</button>
            </div>
          </div>
          <ImprovementTimeline data={dashboardData.recentImprovements} />
        </div>
      </div>
    </div>
  );
};

export default CIDashboard;
