import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card component for content containers
 */
const Card = ({
  children,
  title,
  subtitle,
  footer,
  hoverable = false,
  padding = 'normal',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = ''
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    normal: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = 'bg-white rounded-lg shadow border border-gray-200 transition-shadow duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-lg cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {(title || subtitle) && (
        <div className={`border-b border-gray-200 ${paddingClasses[padding]} ${headerClassName}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={`${paddingClasses[padding]} ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-gray-200 bg-gray-50 rounded-b-lg ${paddingClasses[padding]} ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  hoverable: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg']),
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string
};

export default Card;
