import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import ReportTemplate from './ReportTemplate';

const PrintLayout = ({ reportType, reportData, onClose }) => {
  useEffect(() => {
    // Add print-specific styles when component mounts
    document.body.classList.add('print-mode');
    
    return () => {
      // Remove print-specific styles when component unmounts
      document.body.classList.remove('print-mode');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'clo-attainment':
        return 'CLO Attainment Report';
      case 'plo-attainment':
        return 'PLO Attainment Report';
      case 'course':
        return 'Course Performance Report';
      case 'program':
        return 'Program Assessment Report';
      case 'student':
        return 'Student Performance Report';
      case 'batch':
        return 'Batch Performance Report';
      default:
        return 'Report';
    }
  };

  const renderReportContent = () => {
    // Render different content based on report type
    // This is a simplified version - you would render the actual report data here
    return (
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Executive Summary
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              This report provides a comprehensive analysis of {reportType.replace('-', ' ')} 
              data based on the selected criteria.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        {reportData?.statistics && (
          <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Key Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.statistics).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded print:bg-gray-100">
                  <p className="text-xs text-gray-500 uppercase">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {typeof value === 'number' && value % 1 !== 0 
                      ? value.toFixed(2) 
                      : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Tables */}
        <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Analysis
          </h3>
          <div className="text-sm text-gray-600">
            <p>Detailed data tables and analysis would appear here.</p>
          </div>
        </div>

        {/* Page Break for Print */}
        <div className="print:page-break-before-always print:pt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommendations
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>Based on the analysis, the following recommendations are suggested:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Continue monitoring performance metrics</li>
                <li>Implement improvement strategies where needed</li>
                <li>Schedule follow-up assessments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Print Overlay - Hidden when printing */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 print:hidden">
        <div className="fixed inset-4 bg-white rounded-lg shadow-xl overflow-auto">
          {/* Print Header - Hidden when printing */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b print:hidden">
            <h2 className="text-xl font-semibold text-gray-900">
              Print Preview
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Print Content */}
          <div className="p-8 print:p-0">
            <div className="max-w-4xl mx-auto bg-white print:max-w-none">
              <ReportTemplate
                title={getReportTitle()}
                subtitle={reportData?.subtitle}
                generatedDate={new Date().toLocaleDateString()}
                generatedBy={reportData?.generatedBy || 'System'}
                headerInfo={reportData?.headerInfo}
              >
                {renderReportContent()}
              </ReportTemplate>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:page-break-before-always {
            page-break-before: always;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:pt-8 {
            padding-top: 2rem !important;
          }
          
          .print\\:max-w-none {
            max-width: none !important;
          }
          
          /* Ensure colors are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
};

export default PrintLayout;
