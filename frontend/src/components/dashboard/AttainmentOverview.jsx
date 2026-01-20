import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AttainmentOverview = () => {
  const [attainmentData, setAttainmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('PLO'); // PLO or CLO

  useEffect(() => {
    fetchAttainmentData();
  }, [view]);

  const fetchAttainmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = view === 'PLO' 
        ? '/plo-attainment/overview'
        : '/clo-attainment/overview';
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setAttainmentData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching attainment data:', err);
      setError(err.response?.data?.message || 'Failed to load attainment data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: attainmentData?.labels || [],
    datasets: [
      {
        label: 'Attainment Level (%)',
        data: attainmentData?.values || [],
        backgroundColor: attainmentData?.values?.map(value => 
          value >= 80 ? 'rgba(34, 197, 94, 0.8)' :
          value >= 70 ? 'rgba(234, 179, 8, 0.8)' :
          value >= 60 ? 'rgba(249, 115, 22, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ) || [],
        borderColor: attainmentData?.values?.map(value => 
          value >= 80 ? 'rgb(34, 197, 94)' :
          value >= 70 ? 'rgb(234, 179, 8)' :
          value >= 60 ? 'rgb(249, 115, 22)' :
          'rgb(239, 68, 68)'
        ) || [],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Attainment: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {view} Attainment Overview
        </h2>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {view} Attainment Overview
        </h2>
        <div className="text-center py-12">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchAttainmentData}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {view} Attainment Overview
        </h2>
        
        {/* Toggle between PLO and CLO */}
        <div className="flex space-x-2">
          <button
            onClick={() => setView('PLO')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'PLO'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            PLO
          </button>
          <button
            onClick={() => setView('CLO')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'CLO'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            CLO
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {attainmentData && attainmentData.values && attainmentData.values.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">No attainment data available</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-xs text-gray-600">Excellent (≥80%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-xs text-gray-600">Good (70-79%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-xs text-gray-600">Fair (60-69%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-xs text-gray-600">Poor (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
};

export default AttainmentOverview;
