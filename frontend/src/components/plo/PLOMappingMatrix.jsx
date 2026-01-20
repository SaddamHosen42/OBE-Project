import React from 'react';
import { Info } from 'lucide-react';

const PLOMappingMatrix = ({ plos, peos, mappings, onMappingChange }) => {
  if (!plos || plos.length === 0 || !peos || peos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">No Data Available</p>
        <p className="text-sm">
          {!plos || plos.length === 0 ? 'No PLOs found for this degree program. ' : ''}
          {!peos || peos.length === 0 ? 'No PEOs found for this degree program.' : ''}
        </p>
      </div>
    );
  }

  const handleCheckboxChange = (ploId, peoId) => {
    if (onMappingChange) {
      onMappingChange(ploId, peoId);
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
                  PLO
                </th>
                {peos.map((peo) => (
                  <th 
                    key={peo.peo_id} 
                    scope="col" 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-700">{peo.peo_code}</span>
                      <span className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                        {peo.description}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plos.map((plo) => (
                <tr key={plo.plo_id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap border-r border-gray-200 bg-inherit">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{plo.plo_code}</span>
                      <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {plo.description}
                      </span>
                    </div>
                  </td>
                  {peos.map((peo) => {
                    const key = `${plo.plo_id}-${peo.peo_id}`;
                    const isChecked = mappings[key] || false;
                    
                    return (
                      <td key={peo.peo_id} className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(plo.plo_id, peo.peo_id)}
                              className="sr-only peer"
                            />
                            <div className={`
                              w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                              ${isChecked 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'bg-white border-gray-300 hover:border-blue-400'
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

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
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
            Click on a cell to toggle the mapping between a PLO and PEO. Remember to save your changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PLOMappingMatrix;
