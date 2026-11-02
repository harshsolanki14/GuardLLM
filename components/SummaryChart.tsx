
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TestResult, TestStatus } from '../types';

interface SummaryChartProps {
  results: TestResult[];
}

const COLORS: { [key in TestStatus]?: string } = {
  pass: '#16a34a', // success
  fail: '#dc2626', // danger
  warning: '#f97316', // warning
  error: '#b91c1c',
  running: '#2563eb',
  pending: '#94a3b8',
};

const STATUS_NAMES: { [key in TestStatus]?: string } = {
  pass: 'Pass',
  fail: 'Fail',
  warning: 'Warning',
  error: 'Error',
  running: 'Running',
  pending: 'Pending',
};

export const SummaryChart: React.FC<SummaryChartProps> = ({ results }) => {
  const data = Object.entries(
    results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<TestStatus, number>)
  ).map(([name, value]) => ({ name: STATUS_NAMES[name as TestStatus] || 'Unknown', value }));

  return (
    <div>
        <h3 className="text-xl md:text-2xl font-semibold text-on-surface mb-4">Test Summary</h3>
        <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
            <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as TestStatus] || '#cccccc'} />
                ))}
            </Pie>
            <Tooltip wrapperStyle={{ fontSize: 14 }} />
            <Legend wrapperStyle={{ fontSize: 14 }} />
            </PieChart>
        </ResponsiveContainer>
        </div>
    </div>
  );
};
