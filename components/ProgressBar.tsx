
import React from 'react';

interface ProgressBarProps {
  progress: number;
  message: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="w-full text-center">
        <p className="text-lg text-slate-300 mb-3">{message}{progress > 0 && ` ${progress}%`}</p>
        <div className="w-full bg-slate-700 rounded-full h-4 shadow-inner">
            <div
                className="bg-cyan-400 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    </div>
  );
};
