import React from 'react';
import { TestCard } from './TestCard';
import type { TestResult, Test } from '../types';

interface ResultsDisplayProps {
  results: TestResult[];
  tests: Test[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, tests }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-on-surface">Detailed Results</h3>
      {results.map((result) => {
        const testData = tests.find(t => t.id === result.id);
        return testData ? <TestCard key={result.id} result={result} test={testData} /> : null;
      })}
    </div>
  );
};