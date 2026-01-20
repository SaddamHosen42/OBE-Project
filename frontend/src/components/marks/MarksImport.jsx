import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiUpload, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import marksService from '../../services/marksService';
import * as XLSX from 'xlsx';

const MarksImport = ({ 
  assessmentId,
  courseOfferingId,
  onImportComplete,
  onCancel
}) => {
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await marksService.importMarks(assessmentId, formData);
      
      if (response.success) {
        setImportResult({
          success: true,
          imported: response.data.imported || 0,
          failed: response.data.failed || 0,
          errors: response.data.errors || [],
        });
        
        toast.success(`Successfully imported ${response.data.imported} marks entries`);
        
        if (onImportComplete) {
          onImportComplete(response.data);
        }
      }
    } catch (error) {
      console.error('Error importing marks:', error);
      setImportResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [error.message || 'Failed to import marks'],
      });
      toast.error(error.message || 'Failed to import marks');
    } finally {
      setIsImporting(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      const blob = await marksService.exportMarks(assessmentId, { template: true });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marks_import_template_${assessmentId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FiAlertCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Import Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Download the import template using the button below</li>
              <li>Fill in the student marks in the template</li>
              <li>Save the file (keep it as Excel format)</li>
              <li>Upload the completed file using the form below</li>
              <li>Review the import results and fix any errors if needed</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Step 1: Download Template</p>
          <p className="text-sm text-gray-600">Get the pre-formatted Excel template</p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiDownload />
          Download Template
        </button>
      </div>

      {/* File Upload */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-900 mb-4">Step 2: Upload Completed File</p>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          
          <button
            onClick={handleImport}
            disabled={!file || isImporting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiUpload />
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className={`border rounded-lg p-4 ${
          importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex gap-3">
            {importResult.success ? (
              <FiAlertCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
            ) : (
              <FiAlertCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${
                importResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                Import {importResult.success ? 'Completed' : 'Failed'}
              </p>
              
              <div className="mt-2 space-y-1 text-sm">
                <p className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                  Successfully imported: {importResult.imported} entries
                </p>
                {importResult.failed > 0 && (
                  <p className="text-red-800">
                    Failed: {importResult.failed} entries
                  </p>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-red-900 mb-1">Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

MarksImport.propTypes = {
  assessmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  courseOfferingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onImportComplete: PropTypes.func,
  onCancel: PropTypes.func,
};

export default MarksImport;
