import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

const ExportButton = ({ 
  data = [], 
  filename = 'export',
  formats = ['csv', 'json'],
  onExport,
  className = '',
  disabled = false,
  label = 'Export',
  size = 'md' // sm, md, lg
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }[size];

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    if (disabled || isExporting) return;

    setIsExporting(true);

    try {
      // If custom export handler is provided
      if (onExport) {
        await onExport(format);
        setIsExporting(false);
        return;
      }

      // Default export handlers
      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}_${timestamp}`;

      switch (format) {
        case 'csv': {
          const csvContent = convertToCSV(data);
          downloadFile(csvContent, `${fullFilename}.csv`, 'text/csv;charset=utf-8;');
          break;
        }
          
        case 'json': {
          const jsonContent = JSON.stringify(data, null, 2);
          downloadFile(jsonContent, `${fullFilename}.json`, 'application/json');
          break;
        }
          
        case 'excel': {
          // For Excel, you would typically use a library like xlsx
          console.warn('Excel export requires xlsx library');
          break;
        }
          
        default:
          console.warn(`Export format "${format}" not supported`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (formats.length === 1) {
    return (
      <button
        className={`btn btn-outline gap-2 ${sizeClass} ${className}`}
        onClick={() => handleExport(formats[0])}
        disabled={disabled || isExporting}
      >
        {isExporting ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <FiDownload />
        )}
        {label}
      </button>
    );
  }

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <label 
        tabIndex={0} 
        className={`btn btn-outline gap-2 ${sizeClass}`}
        disabled={disabled || isExporting}
      >
        {isExporting ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <FiDownload />
        )}
        {label}
      </label>
      <ul 
        tabIndex={0} 
        className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300 mt-2"
      >
        {formats.map((format) => (
          <li key={format}>
            <button onClick={() => handleExport(format)}>
              Export as {format.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExportButton;
