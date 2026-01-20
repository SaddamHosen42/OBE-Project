import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ReportCard = ({ category }) => {
  const Icon = category.icon;
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      hover: 'hover:bg-green-100',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      border: 'border-purple-200'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      hover: 'hover:bg-indigo-100',
      border: 'border-indigo-200'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      hover: 'hover:bg-orange-100',
      border: 'border-orange-200'
    },
    pink: {
      bg: 'bg-pink-50',
      icon: 'text-pink-600',
      hover: 'hover:bg-pink-100',
      border: 'border-pink-200'
    }
  };

  const colors = colorClasses[category.color] || colorClasses.blue;

  return (
    <Link
      to={category.link}
      className={`block p-6 bg-white border ${colors.border} rounded-lg shadow-sm transition-all duration-200 ${colors.hover} hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.bg} rounded-lg mb-4`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {category.title}
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            {category.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {category.count} {category.count === 1 ? 'report' : 'reports'}
            </span>
            <ChevronRight className={`w-5 h-5 ${colors.icon}`} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ReportCard;
