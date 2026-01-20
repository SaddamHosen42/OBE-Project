import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * DataTable Component
 * Enhanced table with sorting, filtering, and pagination capabilities
 * Built on top of DaisyUI table styles
 * 
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{key, label, sortable, render, width}]
 * @param {Array} props.data - Data array to display
 * @param {string} [props.keyField='id'] - Unique key field for rows
 * @param {boolean} [props.striped=true] - Zebra striping for rows
 * @param {boolean} [props.hoverable=true] - Hover effect on rows
 * @param {string} [props.size='md'] - Table size: 'xs', 'sm', 'md', 'lg'
 * @param {boolean} [props.loading=false] - Show loading state
 * @param {string} [props.emptyMessage='No data available'] - Message when no data
 * @param {function} [props.onRowClick] - Callback when row is clicked
 * @param {string} [props.className] - Additional CSS classes
 */
const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  striped = true,
  hoverable = true,
  size = 'md',
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filters, setFilters] = useState({});

  // Handle sorting
  const handleSort = (columnKey) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig((prevConfig) => ({
      key: columnKey,
      direction:
        prevConfig.key === columnKey && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  // Handle filtering
  const handleFilter = (columnKey, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnKey]: value,
    }));
  };

  // Process data: filter and sort
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key];
      if (filterValue) {
        result = result.filter((row) => {
          const cellValue = String(row[key] || '').toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Compare values
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, sortConfig]);

  // Size classes
  const sizeClass = {
    xs: 'table-xs',
    sm: 'table-sm',
    md: '',
    lg: 'table-lg',
  }[size];

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="opacity-30">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Render cell content
  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className={`table ${sizeClass} ${striped ? 'table-zebra' : ''} ${
          hoverable ? 'table-hover' : ''
        }`}
      >
        {/* Table Head */}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={column.sortable ? 'cursor-pointer select-none' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="text-xs">{getSortIcon(column.key)}</span>
                  )}
                </div>
                {column.filterable && (
                  <input
                    type="text"
                    placeholder={`Filter ${column.label}...`}
                    className="input input-xs input-bordered w-full mt-1"
                    value={filters[column.key] || ''}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </td>
            </tr>
          ) : processedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            processedData.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key}>{renderCell(row, column)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Summary */}
      {!loading && processedData.length > 0 && (
        <div className="text-sm text-gray-600 mt-2 px-2">
          Showing {processedData.length} of {data.length} records
          {Object.keys(filters).some((key) => filters[key]) && ' (filtered)'}
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      render: PropTypes.func,
      width: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  keyField: PropTypes.string,
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
};

export default DataTable;
