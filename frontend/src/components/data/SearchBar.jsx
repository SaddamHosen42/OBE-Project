import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ 
  value, 
  onChange, 
  onClear,
  placeholder = 'Search...', 
  className = '',
  disabled = false,
  size = 'md' // sm, md, lg
}) => {
  const sizeClass = {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg'
  }[size];

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`form-control ${className}`}>
      <div className="input-group relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
          <FiSearch />
        </span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`input input-bordered w-full pl-10 pr-10 ${sizeClass}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
