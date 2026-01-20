import React from 'react';

const FormCheckbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error, 
  disabled = false,
  className = '',
  size = 'md', // sm, md, lg
  color = 'primary', // primary, secondary, accent, success, warning, info, error
  ...props 
}) => {
  const sizeClass = {
    sm: 'checkbox-sm',
    md: 'checkbox-md',
    lg: 'checkbox-lg'
  }[size];

  const colorClass = `checkbox-${color}`;

  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`checkbox ${sizeClass} ${colorClass} ${className}`}
          {...props}
        />
        {label && <span className="label-text">{label}</span>}
      </label>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default FormCheckbox;
