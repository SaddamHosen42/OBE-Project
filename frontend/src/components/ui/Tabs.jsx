import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Tabs component for organizing content
 */
const Tabs = ({
  tabs = [],
  defaultActiveTab = 0,
  onChange,
  variant = 'underline',
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  contentClassName = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };

  const variantClasses = {
    underline: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 border-transparent hover:border-gray-300 px-4 py-2 font-medium text-sm text-gray-600 hover:text-gray-800',
      activeTab: 'border-blue-500 text-blue-600'
    },
    pills: {
      container: 'space-x-2',
      tab: 'px-4 py-2 font-medium text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100',
      activeTab: 'bg-blue-100 text-blue-700'
    },
    enclosed: {
      container: 'border-b border-gray-200 -mb-px',
      tab: 'border border-transparent px-4 py-2 font-medium text-sm text-gray-600 hover:text-gray-800 rounded-t-md',
      activeTab: 'border-gray-200 border-b-white bg-white text-gray-900'
    }
  };

  const currentVariant = variantClasses[variant];

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`flex ${currentVariant.container}`}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id || index}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
            className={`
              ${currentVariant.tab}
              ${activeTab === index ? `${currentVariant.activeTab} ${activeTabClassName}` : ''}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${tabClassName}
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`mt-4 ${contentClassName}`}>
        {tabs.map((tab, index) => (
          <div
            key={tab.id || index}
            role="tabpanel"
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={activeTab !== index}
          >
            {activeTab === index && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      disabled: PropTypes.bool
    })
  ).isRequired,
  defaultActiveTab: PropTypes.number,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['underline', 'pills', 'enclosed']),
  className: PropTypes.string,
  tabClassName: PropTypes.string,
  activeTabClassName: PropTypes.string,
  contentClassName: PropTypes.string
};

export default Tabs;
