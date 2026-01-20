import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

const FilterPanel = ({ 
  filters = [], 
  onApply, 
  onReset,
  className = '',
  title = 'Filters'
}) => {
  const [filterValues, setFilterValues] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filterKey, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleApply = () => {
    onApply(filterValues);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilterValues({});
    if (onReset) {
      onReset();
    }
    setIsOpen(false);
  };

  const activeFilterCount = Object.keys(filterValues).filter(
    key => filterValues[key] !== undefined && filterValues[key] !== ''
  ).length;

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <label 
        tabIndex={0} 
        className="btn btn-outline gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiFilter />
        {title}
        {activeFilterCount > 0 && (
          <span className="badge badge-primary badge-sm">{activeFilterCount}</span>
        )}
      </label>
      {isOpen && (
        <div 
          tabIndex={0} 
          className="dropdown-content z-[1] card card-compact w-80 p-4 shadow bg-base-100 border border-base-300 mt-2"
        >
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title text-lg">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <FiX />
              </button>
            </div>
            
            <div className="space-y-3">
              {filters.map((filter) => (
                <div key={filter.key} className="form-control">
                  <label className="label">
                    <span className="label-text">{filter.label}</span>
                  </label>
                  
                  {filter.type === 'select' && (
                    <select
                      className="select select-bordered select-sm w-full"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    >
                      <option value="">All</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {filter.type === 'text' && (
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      placeholder={filter.placeholder}
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                  )}
                  
                  {filter.type === 'date' && (
                    <input
                      type="date"
                      className="input input-bordered input-sm w-full"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                  )}
                  
                  {filter.type === 'checkbox' && (
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={filterValues[filter.key] || false}
                        onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                      />
                      <span className="label-text">{filter.checkboxLabel}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
            
            <div className="card-actions justify-end mt-4 gap-2">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={handleReset}
              >
                Reset
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleApply}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
