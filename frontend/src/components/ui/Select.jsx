import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Select dropdown component
 */
const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  placeholder = 'Select an option',
  className = '',
  selectClassName = '',
  name,
  id,
  ...props
}, ref) => {
  const selectId = id || name;
  const hasError = Boolean(error);

  const baseSelectClasses = 'block w-full rounded-md border px-3 py-2 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white';
  
  const stateClasses = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`${baseSelectClasses} ${stateClasses} ${selectClassName}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option
              key={option.value || index}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {hasError && (
        <p className="mt-1 text-sm text-red-600" id={`${selectId}-error`}>
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p className="mt-1 text-sm text-gray-500" id={`${selectId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  selectClassName: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string
};

export default Select;
