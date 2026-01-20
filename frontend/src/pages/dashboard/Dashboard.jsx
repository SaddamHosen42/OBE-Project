import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import AttainmentOverview from '../../components/dashboard/AttainmentOverview';
import CourseProgress from '../../components/dashboard/CourseProgress';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageAttainment: 0,
    pendingAssessments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard statistics based on user role
      const response = await api.get('/reports/dashboard-stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your OBE system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="📚"
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="👥"
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Avg Attainment"
          value={`${stats.averageAttainment}%`}
          icon="📊"
          trend={{ value: 5, isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Pending Assessments"
          value={stats.pendingAssessments}
          icon="⏳"
          trend={{ value: 3, isPositive: false }}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <AttainmentOverview />
          <CourseProgress />
        </div>

        {/* Right Column - Takes 1/3 width */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
