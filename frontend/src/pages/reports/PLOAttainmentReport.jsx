import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Printer,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useGenerateReport } from '../../hooks/useGenerateReport';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportExport from '../../components/reports/ReportExport';
import PrintLayout from '../../components/reports/PrintLayout';
import { Radar, Line } from 'react-chartjs-2';

const PLOAttainmentReport = () => {
  const { degreeId } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [filters, setFilters] = useState({
    degree: degreeId || '',
    academicSession: '',
    batch: 'all'
  });

  const { report, loading, error } = useReports('plo-attainment', filters);
  const { generateReport, generating } = useGenerateReport();

  const getAttainmentStatus = (percentage) => {
    if (percentage >= 70) return { label: 'Achieved', color: 'green', icon: CheckCircle };
    if (percentage >= 50) return { label: 'Partially Achieved', color: 'yellow', icon: AlertCircle };
    return { label: 'Not Achieved', color: 'red', icon: TrendingDown };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-lg">
        <p>Error loading report: {error.message}</p>
      </div>
    );
  }

  const ploData = report?.ploAttainment || [];
  const programInfo = report?.programInfo || {};
  const statistics = report?.statistics || {};
  const trendData = report?.trendData || [];

  const radarData = {
    labels: ploData.map((plo) => plo.ploCode),
    datasets: [
      {
        label: 'Current Attainment',
        data: ploData.map((plo) => plo.attainment),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)'
      },
      {
        label: 'Target',
        data: ploData.map(() => 70),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        borderDash: [5, 5]
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'PLO Attainment Overview'
      }
    }
  };

  const trendChartData = {
    labels: trendData.map((item) => item.semester),
    datasets: [
      {
        label: 'Average PLO Attainment',
        data: trendData.map((item) => item.averageAttainment),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'PLO Attainment Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PLO Attainment Report</h1>
          <p className="mt-1 text-gray-600">
            Program Learning Outcome attainment analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => setShowPrint(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <ReportFilter
          filters={filters}
          onFilterChange={setFilters}
          onClose={() => setShowFilter(false)}
          reportType="plo-attainment"
        />
      )}

      {/* Program Information */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Program Information</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Program</p>
            <p className="mt-1 font-semibold text-gray-900">{programInfo.programName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="mt-1 font-semibold text-gray-900">{programInfo.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Academic Session</p>
            <p className="mt-1 font-semibold text-gray-900">{programInfo.academicSession}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="mt-1 font-semibold text-gray-900">{programInfo.totalStudents}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Average Attainment</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.averageAttainment || 0}%
          </p>
          <p className="mt-1 text-xs text-green-600">+3% from last year</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">PLOs Achieved</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {statistics.ploAchieved || 0}/{statistics.totalPLOs || 0}
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Highest Attainment</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.highestAttainment || 0}%
          </p>
          <p className="mt-1 text-xs text-gray-600">{statistics.highestPLO}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Lowest Attainment</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.lowestAttainment || 0}%
          </p>
          <p className="mt-1 text-xs text-gray-600">{statistics.lowestPLO}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            PLO Attainment Overview
          </h2>
          <div style={{ height: '400px' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Trend Chart */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Attainment Trend
          </h2>
          <div style={{ height: '400px' }}>
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>
      </div>

      {/* PLO Attainment Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Detailed PLO Attainment
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  PLO
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Mapped CLOs
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Attainment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Target
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ploData.map((plo, index) => {
                const status = getAttainmentStatus(plo.attainment);
                const StatusIcon = status.icon;
                const trend = plo.trend || 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {plo.ploCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {plo.description}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm text-gray-900">{plo.mappedCLOs}</span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600">
                        {plo.attainment}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm text-gray-900">{plo.target}%</span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-${status.color}-100 text-${status.color}-800`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`flex items-center justify-center gap-1 text-sm ${
                          trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {trend >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(trend)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <ReportExport
          reportType="plo-attainment"
          reportData={report}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          reportType="plo-attainment"
          reportData={report}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
};

export default PLOAttainmentReport;
