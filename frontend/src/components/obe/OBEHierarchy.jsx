import React from 'react';
import { Award, Target, BookOpen, FileText, ArrowRight } from 'lucide-react';

const OBEHierarchy = ({ peos = [], plos = [], clos = [], courses = [] }) => {
  const levels = [
    {
      title: 'PEO',
      subtitle: 'Program Educational Objectives',
      description: 'What graduates achieve in their careers',
      icon: Award,
      color: 'blue',
      count: peos.length,
      items: peos.slice(0, 3)
    },
    {
      title: 'PLO',
      subtitle: 'Program Learning Outcomes',
      description: 'What students learn by graduation',
      icon: Target,
      color: 'green',
      count: plos.length,
      items: plos.slice(0, 3)
    },
    {
      title: 'CLO',
      subtitle: 'Course Learning Outcomes',
      description: 'What students learn in each course',
      icon: BookOpen,
      color: 'purple',
      count: clos.length,
      items: clos.slice(0, 3)
    },
    {
      title: 'Courses',
      subtitle: 'Course Offerings',
      description: 'Individual courses in the program',
      icon: FileText,
      color: 'orange',
      count: courses.length,
      items: courses.slice(0, 3)
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      badge: 'bg-blue-500'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
      badge: 'bg-green-500'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      badge: 'bg-purple-500'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      badge: 'bg-orange-500'
    }
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Flow View */}
      <div className="hidden md:flex items-start justify-between space-x-4">
        {levels.map((level, index) => {
          const colors = colorClasses[level.color];
          const Icon = level.icon;

          return (
            <React.Fragment key={level.title}>
              <div className="flex-1">
                <div className={`border-2 ${colors.border} rounded-lg p-6 ${colors.bg} bg-opacity-50`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${colors.badge} rounded-full p-2`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${colors.text}`}>{level.title}</h3>
                        <p className="text-xs text-gray-600">{level.subtitle}</p>
                      </div>
                    </div>
                    <span className={`${colors.badge} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                      {level.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{level.description}</p>
                  
                  {level.items.length > 0 && (
                    <div className="space-y-2">
                      {level.items.map((item, idx) => (
                        <div key={idx} className="bg-white rounded p-2 text-xs">
                          <p className="font-semibold text-gray-900">
                            {item.peo_code || item.plo_code || item.clo_code || item.course_code}
                          </p>
                          <p className="text-gray-600 line-clamp-1">
                            {item.description || item.course_name}
                          </p>
                        </div>
                      ))}
                      {level.count > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{level.count - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {index < levels.length - 1 && (
                <div className="flex items-center pt-20">
                  <ArrowRight className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Vertical Flow View (Mobile) */}
      <div className="md:hidden space-y-6">
        {levels.map((level, index) => {
          const colors = colorClasses[level.color];
          const Icon = level.icon;

          return (
            <div key={level.title}>
              <div className={`border-2 ${colors.border} rounded-lg p-6 ${colors.bg} bg-opacity-50`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`${colors.badge} rounded-full p-2`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${colors.text}`}>{level.title}</h3>
                      <p className="text-xs text-gray-600">{level.subtitle}</p>
                    </div>
                  </div>
                  <span className={`${colors.badge} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                    {level.count}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4">{level.description}</p>
                
                {level.items.length > 0 && (
                  <div className="space-y-2">
                    {level.items.map((item, idx) => (
                      <div key={idx} className="bg-white rounded p-2 text-xs">
                        <p className="font-semibold text-gray-900">
                          {item.peo_code || item.plo_code || item.clo_code || item.course_code}
                        </p>
                        <p className="text-gray-600 line-clamp-1">
                          {item.description || item.course_name}
                        </p>
                      </div>
                    ))}
                    {level.count > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{level.count - 3} more
                      </p>
                    )}
                  </div>
                )}
              </div>

              {index < levels.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-8 w-8 text-gray-400 transform rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">OBE Hierarchy Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {levels.map((level) => {
            const colors = colorClasses[level.color];
            return (
              <div key={level.title} className="text-center">
                <p className="text-3xl font-bold text-gray-900">{level.count}</p>
                <p className={`text-sm font-medium ${colors.text}`}>{level.title}s</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Understanding OBE Hierarchy</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>PEOs</strong> define long-term career goals for graduates</li>
          <li>• <strong>PLOs</strong> define what students learn across the entire program</li>
          <li>• <strong>CLOs</strong> define specific outcomes for individual courses</li>
          <li>• <strong>Courses</strong> deliver content and assessments to achieve CLOs</li>
        </ul>
      </div>
    </div>
  );
};

export default OBEHierarchy;
