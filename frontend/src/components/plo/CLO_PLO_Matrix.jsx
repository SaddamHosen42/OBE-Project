import React from 'react';
import { Info } from 'lucide-react';

const CLO_PLO_Matrix = ({ clos, plos, mappings, onMappingChange }) => {
  if (!clos || clos.length === 0 || !plos || plos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">No Data Available</p>
        <p className="text-sm">
          {!clos || clos.length === 0 ? 'No CLOs found for this degree program. ' : ''}
          {!plos || plos.length === 0 ? 'No PLOs found for this degree program.' : ''}
        </p>
      </div>
    );
  }

  const handleCheckboxChange = (cloId, ploId) => {
    if (onMappingChange) {
      onMappingChange(cloId, ploId);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="sticky left-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200"
                >
                  CLO
                </th>
                {plos.map((plo) => (
                  <th 
                    key={plo.plo_id} 
                    scope="col" 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-700">{plo.plo_code}</span>
                      <span className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                        {plo.description}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clos.map((clo) => (
                <tr key={clo.clo_id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap border-r border-gray-200 bg-inherit">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{clo.clo_code}</span>
                      <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {clo.description}
                      </span>
                      {clo.course_name && (
                        <span className="text-xs text-gray-400 mt-1">
                          {clo.course_code}
                        </span>
                      )}
                    </div>
                  </td>
                  {plos.map((plo) => {
                    const key = `${clo.clo_id}-${plo.plo_id}`;
                    const isChecked = mappings[key] || false;
                    
                    return (
                      <td key={plo.plo_id} className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(clo.clo_id, plo.plo_id)}
                              className="sr-only peer"
                            />
                            <div className={`
                              w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                              ${isChecked 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'bg-white border-gray-300 hover:border-green-400'
                              }
                            `}>
                              {isChecked && (
                                <svg 
                                  className="w-6 h-6" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M5 13l4 4L19 7" 
                                  />
                                </svg>
                              )}
                            </div>
                          </label>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Mapping Statistics:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-500">Total CLOs</p>
              <p className="text-xl font-semibold text-gray-900">{clos.length}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-500">Total PLOs</p>
              <p className="text-xl font-semibold text-gray-900">{plos.length}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-500">Mapped CLOs</p>
              <p className="text-xl font-semibold text-gray-900">
                {clos.filter(clo => 
                  plos.some(plo => mappings[`${clo.clo_id}-${plo.plo_id}`])
                ).length}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-500">Total Mappings</p>
              <p className="text-xl font-semibold text-gray-900">
                {Object.values(mappings).filter(Boolean).length}
              </p>
            </div>
          </div>

          {/* Legend */}
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Mapped</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded border-2 border-gray-300 bg-white"></div>
              <span>Not Mapped</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Click on a cell to toggle the mapping between a CLO and PLO. Remember to save your changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CLO_PLO_Matrix;
