import React from 'react';
import { FileText, Calendar, User } from 'lucide-react';

const ReportTemplate = ({ 
  title, 
  subtitle, 
  generatedDate, 
  generatedBy, 
  children,
  headerInfo 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Report Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Institution Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              OBE Management System
            </h1>
            <p className="text-sm text-gray-600">
              Outcome Based Education Assessment Report
            </p>
          </div>

          {/* Report Title */}
          <div className="text-center border-t pt-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 mb-4">
                {subtitle}
              </p>
            )}
          </div>

          {/* Report Metadata */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Generated: {generatedDate || new Date().toLocaleDateString()}</span>
            </div>
            {generatedBy && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By: {generatedBy}</span>
              </div>
            )}
          </div>

          {/* Additional Header Info */}
          {headerInfo && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(headerInfo).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>

      {/* Report Footer */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              This is a system-generated report from the OBE Management System
            </p>
            <p className="mt-1">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplate;
