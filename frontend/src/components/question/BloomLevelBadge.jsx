import React from 'react';
import { Brain } from 'lucide-react';

const BloomLevelBadge = ({ level, showIcon = true }) => {
  const bloomLevels = {
    1: { name: 'Remember', color: 'bg-blue-100 text-blue-800', darkColor: 'bg-blue-500' },
    2: { name: 'Understand', color: 'bg-green-100 text-green-800', darkColor: 'bg-green-500' },
    3: { name: 'Apply', color: 'bg-yellow-100 text-yellow-800', darkColor: 'bg-yellow-500' },
    4: { name: 'Analyze', color: 'bg-orange-100 text-orange-800', darkColor: 'bg-orange-500' },
    5: { name: 'Evaluate', color: 'bg-red-100 text-red-800', darkColor: 'bg-red-500' },
    6: { name: 'Create', color: 'bg-purple-100 text-purple-800', darkColor: 'bg-purple-500' }
  };

  const bloomInfo = bloomLevels[level] || { 
    name: 'Unknown', 
    color: 'bg-gray-100 text-gray-800',
    darkColor: 'bg-gray-500'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bloomInfo.color} inline-flex items-center space-x-1`}>
      {showIcon && <Brain className="h-3 w-3" />}
      <span>{bloomInfo.name}</span>
    </span>
  );
};

export default BloomLevelBadge;
