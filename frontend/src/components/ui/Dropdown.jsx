import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Dropdown component for menus and selections
 */
const Dropdown = ({
  trigger,
  items = [],
  position = 'bottom-left',
  closeOnItemClick = true,
  className = '',
  menuClassName = '',
  itemClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (closeOnItemClick && !item.keepOpen) {
      setIsOpen(false);
    }
  };

  const positionClasses = {
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'left': 'right-full top-0 mr-2',
    'right': 'left-full top-0 ml-2'
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 min-w-[12rem] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${positionClasses[position]} ${menuClassName}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {items.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div
                    key={`divider-${index}`}
                    className="border-t border-gray-100 my-1"
                    role="separator"
                  />
                );
              }

              if (item.type === 'header') {
                return (
                  <div
                    key={`header-${index}`}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {item.label}
                  </div>
                );
              }

              return (
                <button
                  key={item.id || index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full text-left px-4 py-2 text-sm text-gray-700
                    hover:bg-gray-100 hover:text-gray-900
                    flex items-center
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${item.danger ? 'text-red-600 hover:bg-red-50' : ''}
                    ${itemClassName}
                  `}
                  role="menuitem"
                >
                  {item.icon && <span className="mr-3 flex-shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      {item.badge}
                    </span>
                  )}
                  {item.shortcut && (
                    <span className="ml-2 text-xs text-gray-400">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.oneOf(['item', 'divider', 'header']),
      label: PropTypes.string,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      shortcut: PropTypes.string,
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      danger: PropTypes.bool,
      keepOpen: PropTypes.bool
    })
  ).isRequired,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right']),
  closeOnItemClick: PropTypes.bool,
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  itemClassName: PropTypes.string
};

export default Dropdown;
