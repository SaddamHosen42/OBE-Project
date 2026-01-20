import React from 'react';
import { CheckCircle, Clock, XCircle, Pause, FileText } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    'Draft': {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: FileText,
      label: 'Draft'
    },
    'In Progress': {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Clock,
      label: 'In Progress'
    },
    'Completed': {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Completed'
    },
    'On Hold': {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Pause,
      label: 'On Hold'
    },
    'Cancelled': {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      label: 'Cancelled'
    }
  };

  const config = statusConfig[status] || statusConfig['Draft'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
