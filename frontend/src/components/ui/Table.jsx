import React from 'react';
import PropTypes from 'prop-types';

/**
 * Table component with sorting and styling
 */
const Table = ({
  columns = [],
  data = [],
  onSort,
  sortColumn,
  sortDirection = 'asc',
  onRowClick,
  hoverable = true,
  striped = false,
  bordered = false,
  compact = false,
  className = '',
  emptyMessage = 'No data available'
}) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const tableClasses = `min-w-full divide-y divide-gray-200 ${bordered ? 'border border-gray-200' : ''} ${className}`;
  const rowClasses = `${hoverable ? 'hover:bg-gray-50 cursor-pointer' : ''} ${striped ? 'odd:bg-white even:bg-gray-50' : ''}`;
  const cellPadding = compact ? 'px-3 py-2' : 'px-6 py-4';

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                scope="col"
                className={`${cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer select-none' : ''
                }`}
                onClick={() => handleSort(column)}
                style={{ width: column.width }}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="ml-2">
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )
                      ) : (
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={`${cellPadding} text-center text-gray-500`}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={rowClasses}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={`${rowIndex}-${column.key || colIndex}`}
                    className={`${cellPadding} text-sm text-gray-900 whitespace-nowrap`}
                  >
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onSort: PropTypes.func,
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onRowClick: PropTypes.func,
  hoverable: PropTypes.bool,
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
  emptyMessage: PropTypes.string
};

export default Table;
