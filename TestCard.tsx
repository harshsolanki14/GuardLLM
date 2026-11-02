import React, { useState } from 'react';
import type { TestResult, TestStatus, Test } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { HourglassIcon } from './icons/HourglassIcon';

interface TestCardProps {
  result: TestResult;
  test: Test;
}

const getStatusStyles = (status: TestStatus): { icon: React.ReactNode; bgColor: string; textColor: string; ringColor: string; } => {
  switch (status) {
    case 'pass':
      return { icon: <CheckCircleIcon />, bgColor: 'bg-green-100', textColor: 'text-success', ringColor: 'ring-green-500' };
    case 'fail':
      return { icon: <XCircleIcon />, bgColor: 'bg-red-100', textColor: 'text-danger', ringColor: 'ring-red-500' };
    case 'warning':
      return { icon: <ExclamationTriangleIcon />, bgColor: 'bg-orange-100', textColor: 'text-warning', ringColor: 'ring-orange-500' };
    case 'error':
      return { icon: <ExclamationTriangleIcon />, bgColor: 'bg-red-200', textColor: 'text-danger', ringColor: 'ring-red-600' };
    case 'running':
      return { icon: <HourglassIcon className="animate-spin" />, bgColor: 'bg-blue-100', textColor: 'text-primary', ringColor: 'ring-blue-500' };
    default: // pending
      return { icon: <HourglassIcon />, bgColor: 'bg-slate-100', textColor: 'text-slate-500', ringColor: 'ring-slate-400' };
  }
};

export const TestCard: React.FC<TestCardProps> = ({ result, test }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { icon, bgColor, textColor } = getStatusStyles(result.status);

  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-soft ring-1 ring-slate-200 ${bgColor}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full ${textColor}`}>
            {icon}
          </div>
          <div>
            <p className="font-semibold text-base md:text-lg text-on-surface">{result.id}: {result.title}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 mt-1 text-xs font-semibold rounded-full ${textColor} bg-white/70`}>{result.status}</span>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 md:h-6 md:w-6 text-slate-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="px-5 md:px-6 pb-5 bg-white/60">
        <div>
          <h4 className="font-semibold text-sm md:text-base mb-2 text-slate-700">Attack Explanation</h4>
          <p className="text-sm md:text-base text-on-surface bg-slate-50 p-3 rounded-lg">{test.attackExplanation}</p>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 md:px-6 pb-6 bg-white/60 border-t border-slate-300/50">
          <div className="pt-5 space-y-5 max-h-[360px] overflow-y-auto pr-1">
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-2 text-slate-700">Analysis</h4>
              <pre className="text-sm md:text-base text-on-surface whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg">{result.analysis}</pre>
            </div>
            {result.attackPrompt && (
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-2 text-slate-700">Attack Prompt</h4>
                <pre className="text-sm md:text-base text-on-surface whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg">{result.attackPrompt}</pre>
              </div>
            )}
            {result.response && (
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-2 text-slate-700">LLM Response</h4>
                <pre className="text-sm md:text-base text-on-surface whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg">{result.response}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};