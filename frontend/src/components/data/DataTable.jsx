import React from 'react';

const DataTable = ({ 
  columns = [], 
  data = [], 
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  striped = true,
  hover = true,
  compact = false
}) => {
  const tableClasses = `table w-full ${striped ? 'table-zebra' : ''} ${compact ? 'table-xs' : ''}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={column.key || index}
                className={column.headerClassName || ''}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`${hover ? 'hover' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={`${row.id || rowIndex}-${column.key || colIndex}`}
                  className={column.cellClassName || ''}
                >
                  {column.render 
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
