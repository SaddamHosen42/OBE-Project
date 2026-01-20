import React from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ActionPlanTimeline = ({ startDate, endDate, status }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateProgress = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const getDaysRemaining = () => {
    if (!endDate) return null;
    
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return days;
  };

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();

  const getProgressColor = () => {
    if (status === 'Completed') return 'bg-green-500';
    if (status === 'Cancelled') return 'bg-gray-500';
    if (daysRemaining < 0) return 'bg-red-500';
    if (daysRemaining < 7) return 'bg-orange-500';
    if (daysRemaining < 30) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (status === 'Completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (status === 'Cancelled') {
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
    if (daysRemaining < 0) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    return <Clock className="h-5 w-5 text-blue-500" />;
  };

  const getStatusMessage = () => {
    if (status === 'Completed') {
      return <span className="text-green-600 font-medium">Plan completed</span>;
    }
    if (status === 'Cancelled') {
      return <span className="text-gray-600 font-medium">Plan cancelled</span>;
    }
    if (daysRemaining < 0) {
      return (
        <span className="text-red-600 font-medium">
          Overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''}
        </span>
      );
    }
    if (daysRemaining === 0) {
      return <span className="text-orange-600 font-medium">Due today</span>;
    }
    if (daysRemaining === 1) {
      return <span className="text-orange-600 font-medium">Due tomorrow</span>;
    }
    return (
      <span className="text-gray-700">
        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {formatDate(startDate)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm">
            {getStatusMessage()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {formatDate(endDate)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-300 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700 drop-shadow">
            {progress}%
          </span>
        </div>
      </div>

      {/* Milestones */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <div className="text-left">
          <div className="font-medium">Start</div>
          <div>{formatDate(startDate)}</div>
        </div>
        <div className="text-center">
          <div className="font-medium">Progress</div>
          <div>{progress}%</div>
        </div>
        <div className="text-right">
          <div className="font-medium">End</div>
          <div>{formatDate(endDate)}</div>
        </div>
      </div>
    </div>
  );
};

export default ActionPlanTimeline;
