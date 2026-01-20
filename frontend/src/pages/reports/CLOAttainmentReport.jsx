import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Printer,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useGenerateReport } from '../../hooks/useGenerateReport';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportExport from '../../components/reports/ReportExport';
import PrintLayout from '../../components/reports/PrintLayout';
import { Line, Bar } from 'react-chartjs-2';

const CLOAttainmentReport = () => {
  const { courseOfferingId } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [filters, setFilters] = useState({
    courseOffering: courseOfferingId || '',
    assessmentType: 'all',
    dateRange: 'semester'
  });

  const { report, loading, error } = useReports('clo-attainment', filters);
  const { generateReport, generating } = useGenerateReport();

  const handleGenerateReport = async () => {
    await generateReport('clo-attainment', filters);
  };

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

  const cloData = report?.cloAttainment || [];
  const courseInfo = report?.courseInfo || {};
  const statistics = report?.statistics || {};

  const chartData = {
    labels: cloData.map((clo) => clo.cloCode),
    datasets: [
      {
        label: 'Direct Assessment',
        data: cloData.map((clo) => clo.directAttainment),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Indirect Assessment',
        data: cloData.map((clo) => clo.indirectAttainment),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      },
      {
        label: 'Overall Attainment',
        data: cloData.map((clo) => clo.overallAttainment),
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'CLO Attainment Comparison'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CLO Attainment Report</h1>
          <p className="mt-1 text-gray-600">
            Course Learning Outcome attainment analysis
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
          reportType="clo-attainment"
        />
      )}

      {/* Course Information */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Course Information</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Course Code</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.courseCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Course Title</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.courseName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Semester</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.semester}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.totalStudents}</p>
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
          <p className="mt-1 text-xs text-green-600">+5% from last semester</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">CLOs Achieved</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {statistics.cloAchieved || 0}/{statistics.totalCLOs || 0}
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Highest Attainment</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.highestAttainment || 0}%
          </p>
          <p className="mt-1 text-xs text-gray-600">{statistics.highestCLO}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Lowest Attainment</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.lowestAttainment || 0}%
          </p>
          <p className="mt-1 text-xs text-gray-600">{statistics.lowestCLO}</p>
        </div>
      </div>

      {/* Attainment Chart */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Attainment Analysis
        </h2>
        <div style={{ height: '400px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* CLO Attainment Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Detailed CLO Attainment
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  CLO
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Direct Assessment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Indirect Assessment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Overall Attainment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cloData.map((clo, index) => {
                const status = getAttainmentStatus(clo.overallAttainment);
                const StatusIcon = status.icon;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {clo.cloCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {clo.description}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {clo.directAttainment}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {clo.indirectAttainment}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600">
                        {clo.overallAttainment}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-${status.color}-100 text-${status.color}-800`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
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
          reportType="clo-attainment"
          reportData={report}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          reportType="clo-attainment"
          reportData={report}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
};

export default CLOAttainmentReport;
