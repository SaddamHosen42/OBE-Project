import React, { useState } from 'react';
import { X, Download, FileText, Table, Image } from 'lucide-react';

const ReportExport = ({ reportType, reportData, onClose }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeDetails: true,
    includeStatistics: true,
    includeHeader: true,
    includeFooter: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Call API to generate the report
      // 2. Download the generated file
      console.log('Exporting report:', {
        reportType,
        exportFormat,
        exportOptions,
        reportData
      });

      // Show success message
      alert(`Report exported successfully as ${exportFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: FileText,
      description: 'Portable Document Format'
    },
    {
      id: 'excel',
      name: 'Excel Spreadsheet',
      icon: Table,
      description: 'Microsoft Excel format'
    },
    {
      id: 'csv',
      name: 'CSV File',
      icon: Table,
      description: 'Comma-separated values'
    },
    {
      id: 'image',
      name: 'Image (PNG)',
      icon: Image,
      description: 'Portable Network Graphics'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Export Report</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isExporting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Export Format Selection */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Select Export Format
          </label>
          <div className="grid grid-cols-2 gap-4">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.id}
                  onClick={() => setExportFormat(format.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    exportFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isExporting}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${
                      exportFormat === format.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        exportFormat === format.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {format.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Options */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Export Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={exportOptions.includeCharts}
                onChange={() => handleOptionChange('includeCharts')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isExporting}
              />
              <span className="ml-3 text-sm text-gray-700">Include Charts and Graphs</span>
            </label>
            <label className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={exportOptions.includeDetails}
                onChange={() => handleOptionChange('includeDetails')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isExporting}
              />
              <span className="ml-3 text-sm text-gray-700">Include Detailed Tables</span>
            </label>
            <label className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={exportOptions.includeStatistics}
                onChange={() => handleOptionChange('includeStatistics')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isExporting}
              />
              <span className="ml-3 text-sm text-gray-700">Include Statistics Summary</span>
            </label>
            <label className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={exportOptions.includeHeader}
                onChange={() => handleOptionChange('includeHeader')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isExporting}
              />
              <span className="ml-3 text-sm text-gray-700">Include Header with Logo</span>
            </label>
            <label className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={exportOptions.includeFooter}
                onChange={() => handleOptionChange('includeFooter')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isExporting}
              />
              <span className="ml-3 text-sm text-gray-700">Include Footer with Page Numbers</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExport;
