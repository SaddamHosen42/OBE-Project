import React from 'react';
import { FiPlus, FiMinus, FiEdit } from 'react-icons/fi';

const ChangesDiff = ({ oldValues = null, newValues = null, action }) => {
  // Parse JSON if they're strings
  const parseValues = (values) => {
    if (!values) return null;
    if (typeof values === 'string') {
      try {
        return JSON.parse(values);
      } catch (e) {
        return null;
      }
    }
    return values;
  };

  const oldData = parseValues(oldValues);
  const newData = parseValues(newValues);

  // Get all unique keys from both objects
  const getAllKeys = () => {
    const keys = new Set();
    if (oldData) Object.keys(oldData).forEach(key => keys.add(key));
    if (newData) Object.keys(newData).forEach(key => keys.add(key));
    return Array.from(keys).sort();
  };

  // Determine change type for a field
  const getChangeType = (key) => {
    const hasOld = oldData && oldData[key] !== undefined;
    const hasNew = newData && newData[key] !== undefined;

    if (!hasOld && hasNew) return 'added';
    if (hasOld && !hasNew) return 'removed';
    if (hasOld && hasNew && oldData[key] !== newData[key]) return 'modified';
    return 'unchanged';
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value === '') return '(empty)';
    return String(value);
  };

  // Render based on action type
  if (action === 'INSERT') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-success">
          <FiPlus size={20} />
          <h4 className="text-lg font-semibold">New Record Created</h4>
        </div>
        {newData && (
          <div className="bg-success/10 rounded-lg p-4 border border-success/30">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="w-1/3">Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(newData).sort().map((key) => (
                  <tr key={key}>
                    <td className="font-mono text-sm font-semibold">{key}</td>
                    <td className="font-mono text-sm">{formatValue(newData[key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (action === 'DELETE') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-error">
          <FiMinus size={20} />
          <h4 className="text-lg font-semibold">Record Deleted</h4>
        </div>
        {oldData && (
          <div className="bg-error/10 rounded-lg p-4 border border-error/30">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="w-1/3">Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(oldData).sort().map((key) => (
                  <tr key={key}>
                    <td className="font-mono text-sm font-semibold">{key}</td>
                    <td className="font-mono text-sm line-through opacity-60">
                      {formatValue(oldData[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (action === 'UPDATE') {
    const allKeys = getAllKeys();
    const changes = allKeys.filter(key => getChangeType(key) !== 'unchanged');

    if (changes.length === 0) {
      return (
        <div className="alert alert-info">
          <span>No changes detected in tracked fields</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-warning">
          <FiEdit size={20} />
          <h4 className="text-lg font-semibold">Record Updated</h4>
          <span className="badge badge-warning">{changes.length} changes</span>
        </div>
        
        <div className="bg-warning/10 rounded-lg p-4 border border-warning/30">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-1/4">Field</th>
                <th className="w-3/8">Old Value</th>
                <th className="w-3/8">New Value</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((key) => {
                const changeType = getChangeType(key);
                return (
                  <tr key={key}>
                    <td className="font-mono text-sm font-semibold">
                      {key}
                      {changeType === 'added' && (
                        <span className="badge badge-success badge-xs ml-2">NEW</span>
                      )}
                      {changeType === 'removed' && (
                        <span className="badge badge-error badge-xs ml-2">REMOVED</span>
                      )}
                    </td>
                    <td className="font-mono text-sm">
                      {changeType !== 'added' ? (
                        <span className="text-error line-through opacity-60">
                          {formatValue(oldData[key])}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="font-mono text-sm">
                      {changeType !== 'removed' ? (
                        <span className="text-success font-semibold">
                          {formatValue(newData[key])}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Show unchanged fields if any */}
        {allKeys.length > changes.length && (
          <details className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title text-sm font-medium">
              Show unchanged fields ({allKeys.length - changes.length})
            </summary>
            <div className="collapse-content">
              <table className="table w-full table-sm">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {allKeys
                    .filter(key => getChangeType(key) === 'unchanged')
                    .map((key) => (
                      <tr key={key}>
                        <td className="font-mono text-sm">{key}</td>
                        <td className="font-mono text-sm text-gray-600">
                          {formatValue(newData[key])}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="alert">
      <span>No change details available for this action type</span>
    </div>
  );
};

export default ChangesDiff;
