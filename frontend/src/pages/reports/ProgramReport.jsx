import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Printer,
  Filter,
  GraduationCap,
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Target
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportExport from '../../components/reports/ReportExport';
import PrintLayout from '../../components/reports/PrintLayout';
import { Line, Bar, Radar } from 'react-chartjs-2';

const ProgramReport = () => {
  const { degreeId } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [filters, setFilters] = useState({
    degree: degreeId || '',
    academicSession: '',
    includePEO: true,
    includePLO: true
  });

  const { report, loading, error } = useReports('program', filters);

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

  const programInfo = report?.programInfo || {};
  const statistics = report?.statistics || {};
  const ploAttainment = report?.ploAttainment || [];
  const enrollmentTrend = report?.enrollmentTrend || [];
  const graduationTrend = report?.graduationTrend || [];
  const peoAssessment = report?.peoAssessment || [];

  const ploRadarData = {
    labels: ploAttainment.map((plo) => plo.ploCode),
    datasets: [
      {
        label: 'Attainment',
        data: ploAttainment.map((plo) => plo.attainment),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  };

  const enrollmentChartData = {
    labels: enrollmentTrend.map((item) => item.year),
    datasets: [
      {
        label: 'Enrolled Students',
        data: enrollmentTrend.map((item) => item.enrolled),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Graduated Students',
        data: enrollmentTrend.map((item) => item.graduated),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const peoChartData = {
    labels: peoAssessment.map((peo) => peo.peoCode),
    datasets: [
      {
        label: 'Achievement Level',
        data: peoAssessment.map((peo) => peo.achievementLevel),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Report</h1>
          <p className="mt-1 text-gray-600">
            Comprehensive program assessment and analytics
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
          reportType="program"
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
            <p className="text-sm text-gray-600">Accreditation</p>
            <p className="mt-1 font-semibold text-gray-900">{programInfo.accreditation}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Academic Session</p>
            <p className="mt-1 font-semibold text-gray-900">{programInfo.academicSession}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.totalStudents || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.totalCourses || 0}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PLO Attainment</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.avgPLOAttainment || 0}%
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graduation Rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.graduationRate || 0}%
              </p>
            </div>
            <GraduationCap className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PLO Attainment Radar */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            PLO Attainment Overview
          </h2>
          <div style={{ height: '300px' }}>
            <Radar
              data={ploRadarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </div>

        {/* PEO Achievement */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            PEO Achievement Levels
          </h2>
          <div style={{ height: '300px' }}>
            <Bar
              data={peoChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Enrollment Trend */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Enrollment and Graduation Trend
        </h2>
        <div style={{ height: '300px' }}>
          <Line
            data={enrollmentChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top'
                }
              }
            }}
          />
        </div>
      </div>

      {/* PLO Details Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            PLO Attainment Details
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
                  Attainment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Target
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ploAttainment.map((plo, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {plo.ploCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {plo.description}
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
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        plo.attainment >= plo.target
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {plo.attainment >= plo.target ? 'Achieved' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <ReportExport
          reportType="program"
          reportData={report}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          reportType="program"
          reportData={report}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
};

export default ProgramReport;
