import React from 'react';
import { FiTarget, FiTrendingUp, FiBook, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const AttainmentProgress = ({ attainment }) => {
  if (!attainment) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FiTarget className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No attainment data available</p>
        <p className="text-gray-500 text-sm mt-2">Attainment data will appear here once assessments are completed.</p>
      </div>
    );
  }

  const { clo_attainment, plo_attainment } = attainment;

  // Helper function to get status color and icon
  const getAttainmentStatus = (percentage) => {
    if (percentage >= 80) {
      return { 
        color: 'text-green-600', 
        bgColor: 'bg-green-100', 
        icon: FiCheckCircle,
        label: 'Excellent'
      };
    } else if (percentage >= 60) {
      return { 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100', 
        icon: FiTrendingUp,
        label: 'Good'
      };
    } else if (percentage >= 50) {
      return { 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100', 
        icon: FiAlertCircle,
        label: 'Satisfactory'
      };
    } else {
      return { 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        icon: FiAlertCircle,
        label: 'Needs Improvement'
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* CLO Attainment */}
      {clo_attainment && clo_attainment.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiBook className="mr-2 text-blue-600" />
              Course Learning Outcomes (CLO) Attainment
            </h3>
            <p className="text-sm text-gray-600 mt-1">Your performance on course-specific learning outcomes</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {clo_attainment.map((clo, index) => {
                const percentage = clo.attainment_percentage || 0;
                const status = getAttainmentStatus(percentage);
                const StatusIcon = status.icon;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{clo.clo_code}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{clo.clo_description}</p>
                        {clo.course_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Course: {clo.course_code} - {clo.course_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                          <span className={`text-2xl font-bold ${status.color}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          percentage >= 80 ? 'bg-green-600' :
                          percentage >= 60 ? 'bg-blue-600' :
                          percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>

                    {/* Additional Details */}
                    {(clo.obtained_marks !== null || clo.total_marks !== null) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                        <span className="text-gray-600">
                          Marks: {clo.obtained_marks || 0} / {clo.total_marks || 0}
                        </span>
                        {clo.bloom_level && (
                          <span className="text-gray-600">
                            Bloom Level: {clo.bloom_level}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PLO Attainment */}
      {plo_attainment && plo_attainment.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiTarget className="mr-2 text-purple-600" />
              Program Learning Outcomes (PLO) Attainment
            </h3>
            <p className="text-sm text-gray-600 mt-1">Your overall achievement of program-level learning outcomes</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {plo_attainment.map((plo, index) => {
                const percentage = plo.attainment_percentage || 0;
                const status = getAttainmentStatus(percentage);
                const StatusIcon = status.icon;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{plo.plo_code}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{plo.plo_description}</p>
                        {plo.degree_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            {plo.degree_code} - {plo.degree_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                          <span className={`text-2xl font-bold ${status.color}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          percentage >= 80 ? 'bg-green-600' :
                          percentage >= 60 ? 'bg-blue-600' :
                          percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>

                    {/* Mapped CLOs */}
                    {plo.mapped_clos && plo.mapped_clos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Mapped CLOs:</p>
                        <div className="flex flex-wrap gap-2">
                          {plo.mapped_clos.map((clo, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {clo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overall Summary */}
      {(clo_attainment?.length > 0 || plo_attainment?.length > 0) && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2" />
            Overall Attainment Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clo_attainment && clo_attainment.length > 0 && (
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-2">Average CLO Attainment</p>
                <p className="text-4xl font-bold">
                  {(clo_attainment.reduce((sum, clo) => sum + (clo.attainment_percentage || 0), 0) / clo_attainment.length).toFixed(1)}%
                </p>
              </div>
            )}
            {plo_attainment && plo_attainment.length > 0 && (
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-2">Average PLO Attainment</p>
                <p className="text-4xl font-bold">
                  {(plo_attainment.reduce((sum, plo) => sum + (plo.attainment_percentage || 0), 0) / plo_attainment.length).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!clo_attainment || clo_attainment.length === 0) && (!plo_attainment || plo_attainment.length === 0) && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FiTarget className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No attainment data available yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Complete your assessments to see your learning outcome attainment progress.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttainmentProgress;
