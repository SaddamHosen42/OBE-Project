import React from 'react';
import { CheckCircle, Circle, Info } from 'lucide-react';

const CLOMappingMatrix = ({ clos, plos, mappings, onMappingChange }) => {
  const handleCheckboxChange = (cloId, ploId) => {
    const key = `${cloId}-${ploId}`;
    const isCurrentlyChecked = mappings[key] || false;
    onMappingChange(cloId, ploId, !isCurrentlyChecked);
  };

  // Calculate statistics
  const getMappingStats = () => {
    const stats = {
      cloStats: {},
      ploStats: {}
    };

    // Initialize
    clos.forEach(clo => {
      stats.cloStats[clo.clo_id] = 0;
    });
    plos.forEach(plo => {
      stats.ploStats[plo.plo_id] = 0;
    });

    // Count mappings
    Object.entries(mappings).forEach(([key, isChecked]) => {
      if (isChecked) {
        const [cloId, ploId] = key.split('-').map(Number);
        stats.cloStats[cloId] = (stats.cloStats[cloId] || 0) + 1;
        stats.ploStats[ploId] = (stats.ploStats[ploId] || 0) + 1;
      }
    });

    return stats;
  };

  const stats = getMappingStats();

  if (clos.length === 0 || plos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No CLOs or PLOs available for mapping.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">CLO-PLO Mapping Matrix</h2>
        <p className="text-sm text-gray-500 mt-1">
          Check the boxes to map CLOs to their corresponding PLOs
        </p>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                style={{ minWidth: '250px' }}
              >
                CLO / PLO
              </th>
              {plos.map((plo) => (
                <th
                  key={plo.plo_id}
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ minWidth: '120px' }}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-gray-900">{plo.plo_code}</span>
                    <span className="text-xs text-gray-500 mt-1 normal-case font-normal">
                      ({stats.ploStats[plo.plo_id]} CLOs)
                    </span>
                  </div>
                </th>
              ))}
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100"
                style={{ minWidth: '100px' }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clos.map((clo, cloIndex) => (
              <tr key={clo.clo_id} className={cloIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap border-r border-gray-200 bg-inherit">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{clo.clo_code}</span>
                    <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {clo.description}
                    </span>
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
                          <div className="peer flex items-center justify-center h-8 w-8 rounded-lg border-2 border-gray-300 hover:border-blue-400 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500">
                            {isChecked ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </label>
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-center bg-gray-100 font-semibold">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm">
                    {stats.cloStats[clo.clo_id]}
                  </span>
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-gray-100 font-semibold">
              <td className="sticky left-0 z-10 px-6 py-4 text-sm text-gray-900 border-r border-gray-200 bg-gray-100">
                Total Mappings
              </td>
              {plos.map((plo) => (
                <td key={plo.plo_id} className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-800 text-sm">
                    {stats.ploStats[plo.plo_id]}
                  </span>
                </td>
              ))}
              <td className="px-4 py-4 text-center bg-gray-200">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-800 text-sm">
                  {Object.values(mappings).filter(Boolean).length}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-gray-600">Mapped</span>
            </div>
            <div className="flex items-center space-x-2">
              <Circle className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Not Mapped</span>
            </div>
          </div>
          <div className="text-gray-500">
            Click on cells to toggle mappings
          </div>
        </div>
      </div>
    </div>
  );
};

export default CLOMappingMatrix;
