import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const MappingMatrix = ({ 
  rows = [], 
  columns = [], 
  rowKey = 'id',
  columnKey = 'id',
  rowLabel = 'code',
  columnLabel = 'code',
  rowIcon: RowIcon,
  columnIcon: ColumnIcon,
  onMappingChange,
  initialMappings = {}
}) => {
  const [mappings, setMappings] = useState(initialMappings);

  // Initialize mappings from existing data
  useEffect(() => {
    const initialMaps = {};
    rows.forEach(row => {
      if (row.mappings && row.mappings.length > 0) {
        row.mappings.forEach(mapping => {
          const key = `${row[rowKey]}-${mapping[columnKey]}`;
          initialMaps[key] = true;
        });
      }
    });
    setMappings(initialMaps);
  }, [rows, columns]);

  const toggleMapping = (rowId, columnId) => {
    const key = `${rowId}-${columnId}`;
    const newMappings = {
      ...mappings,
      [key]: !mappings[key]
    };
    setMappings(newMappings);
    
    if (onMappingChange) {
      onMappingChange(newMappings);
    }
  };

  const isMapping = (rowId, columnId) => {
    const key = `${rowId}-${columnId}`;
    return mappings[key] || false;
  };

  // Count mappings
  const getRowMappingCount = (rowId) => {
    return Object.keys(mappings).filter(
      key => key.startsWith(`${rowId}-`) && mappings[key]
    ).length;
  };

  const getColumnMappingCount = (columnId) => {
    return Object.keys(mappings).filter(
      key => key.endsWith(`-${columnId}`) && mappings[key]
    ).length;
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {RowIcon && <RowIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />}
        <p>No rows available for mapping.</p>
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {ColumnIcon && <ColumnIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />}
        <p>No columns available for mapping.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Row / Column
              </th>
              {columns.map((column) => (
                <th
                  key={column[columnKey]}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                >
                  <div className="flex flex-col items-center space-y-1">
                    {ColumnIcon && <ColumnIcon className="h-4 w-4 text-blue-600" />}
                    <span className="font-semibold">{column[columnLabel]}</span>
                    <span className="text-xs text-gray-400 normal-case">
                      ({getColumnMappingCount(column[columnKey])})
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={row[rowKey]} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap border-r">
                  <div className="flex items-center space-x-2">
                    {RowIcon && <RowIcon className="h-4 w-4 text-purple-600" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{row[rowLabel]}</p>
                      {row.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{row.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                {columns.map((column) => (
                  <td
                    key={`${row[rowKey]}-${column[columnKey]}`}
                    className="px-4 py-3 text-center border-r cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => toggleMapping(row[rowKey], column[columnKey])}
                  >
                    {isMapping(row[rowKey], column[columnKey]) ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getRowMappingCount(row[rowKey])}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-700 border-r">
                Total
              </td>
              {columns.map((column) => (
                <td key={`total-${column[columnKey]}`} className="px-4 py-3 text-center border-r">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getColumnMappingCount(column[columnKey])}
                  </span>
                </td>
              ))}
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {Object.values(mappings).filter(Boolean).length}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">Total Rows</p>
          <p className="text-2xl font-bold text-blue-700">{rows.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900">Total Columns</p>
          <p className="text-2xl font-bold text-green-700">{columns.length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900">Total Mappings</p>
          <p className="text-2xl font-bold text-purple-700">
            {Object.values(mappings).filter(Boolean).length}
          </p>
        </div>
      </div>

      {/* Coverage Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Row Coverage</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {rows.map((row) => {
              const count = getRowMappingCount(row[rowKey]);
              const percentage = columns.length > 0 ? Math.round((count / columns.length) * 100) : 0;
              return (
                <div key={row[rowKey]} className="flex items-center space-x-3">
                  <span className="text-xs font-medium text-gray-600 w-24 truncate">
                    {row[rowLabel]}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">
                    {count}/{columns.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Column Coverage</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {columns.map((column) => {
              const count = getColumnMappingCount(column[columnKey]);
              const percentage = rows.length > 0 ? Math.round((count / rows.length) * 100) : 0;
              return (
                <div key={column[columnKey]} className="flex items-center space-x-3">
                  <span className="text-xs font-medium text-gray-600 w-24 truncate">
                    {column[columnLabel]}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">
                    {count}/{rows.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingMatrix;
