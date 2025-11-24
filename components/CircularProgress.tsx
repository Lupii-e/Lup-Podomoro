import React from 'react';

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 320,
  strokeWidth = 8,
  colorClass = "text-white",
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg
        className="transform -rotate-90 w-full h-full absolute top-0 left-0"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-slate-800 transition-colors-bg"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`${colorClass} transition-all duration-1000 ease-linear`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>
      {/* Inner Content */}
      <div className="z-10 text-center flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default CircularProgress;