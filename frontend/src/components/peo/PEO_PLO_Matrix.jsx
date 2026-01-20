import React, { useState, useEffect } from 'react';
import { Award, Target, CheckCircle, Circle } from 'lucide-react';

const PEO_PLO_Matrix = ({ peos = [], plos = [], onMappingChange }) => {
  const [mappings, setMappings] = useState({});

  // Initialize mappings from existing data
  useEffect(() => {
    const initialMappings = {};
    peos.forEach(peo => {
      if (peo.plo_mappings && peo.plo_mappings.length > 0) {
        peo.plo_mappings.forEach(plo => {
          const key = `${peo.peo_id}-${plo.plo_id}`;
          initialMappings[key] = true;
        });
      }
    });
    setMappings(initialMappings);
  }, [peos]);

  const toggleMapping = (peoId, ploId) => {
    const key = `${peoId}-${ploId}`;
    const newMappings = {
      ...mappings,
      [key]: !mappings[key]
    };
    setMappings(newMappings);
    
    if (onMappingChange) {
      onMappingChange(newMappings);
    }
  };

  const isMapping = (peoId, ploId) => {
    const key = `${peoId}-${ploId}`;
    return mappings[key] || false;
  };

  // Count mappings for each PEO and PLO
  const getPEOMappingCount = (peoId) => {
    return Object.keys(mappings).filter(
      key => key.startsWith(`${peoId}-`) && mappings[key]
    ).length;
  };

  const getPLOMappingCount = (ploId) => {
    return Object.keys(mappings).filter(
      key => key.endsWith(`-${ploId}`) && mappings[key]
    ).length;
  };

  if (!peos || peos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No PEOs available. Please create PEOs first.</p>
      </div>
    );
  }

  if (!plos || plos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No PLOs available. Please create PLOs first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                PEO / PLO
              </th>
              {plos.map((plo) => (
                <th
                  key={plo.plo_id}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{plo.plo_code}</span>
                    <span className="text-xs text-gray-400 normal-case">
                      ({getPLOMappingCount(plo.plo_id)})
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {peos.map((peo, peoIndex) => (
              <tr key={peo.peo_id} className={peoIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap border-r">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{peo.peo_code}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{peo.description}</p>
                    </div>
                  </div>
                </td>
                {plos.map((plo) => (
                  <td
                    key={`${peo.peo_id}-${plo.plo_id}`}
                    className="px-4 py-3 text-center border-r cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => toggleMapping(peo.peo_id, plo.plo_id)}
                  >
                    {isMapping(peo.peo_id, plo.plo_id) ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getPEOMappingCount(peo.peo_id)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-700 border-r">
                Total
              </td>
              {plos.map((plo) => (
                <td key={`total-${plo.plo_id}`} className="px-4 py-3 text-center border-r">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getPLOMappingCount(plo.plo_id)}
                  </span>
                </td>
              ))}
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {Object.values(mappings).filter(Boolean).length}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">Total PEOs</p>
          <p className="text-2xl font-bold text-blue-700">{peos.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900">Total PLOs</p>
          <p className="text-2xl font-bold text-green-700">{plos.length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900">Total Mappings</p>
          <p className="text-2xl font-bold text-purple-700">
            {Object.values(mappings).filter(Boolean).length}
          </p>
        </div>
      </div>

      {/* Coverage Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">PEO Coverage</h3>
          <div className="space-y-2">
            {peos.map((peo) => {
              const count = getPEOMappingCount(peo.peo_id);
              const percentage = plos.length > 0 ? Math.round((count / plos.length) * 100) : 0;
              return (
                <div key={peo.peo_id} className="flex items-center space-x-3">
                  <span className="text-xs font-medium text-gray-600 w-20">{peo.peo_code}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">
                    {count}/{plos.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">PLO Coverage</h3>
          <div className="space-y-2">
            {plos.map((plo) => {
              const count = getPLOMappingCount(plo.plo_id);
              const percentage = peos.length > 0 ? Math.round((count / peos.length) * 100) : 0;
              return (
                <div key={plo.plo_id} className="flex items-center space-x-3">
                  <span className="text-xs font-medium text-gray-600 w-20">{plo.plo_code}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">
                    {count}/{peos.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PEO_PLO_Matrix;
