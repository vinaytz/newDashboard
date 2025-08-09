import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '', showLabel = false }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right">
          <span className="text-sm text-gray-400">{Math.round(clampedValue)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;