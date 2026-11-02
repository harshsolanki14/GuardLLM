
import React from 'react';
import type { Test, TestId } from '../types';

interface SidebarProps {
  tests: Test[];
  selectedTests: Set<TestId>;
  onToggleTest: (testId: TestId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tests, selectedTests, onToggleTest }) => {
  return (
    <aside className="w-80 lg:w-96 bg-surface/95 backdrop-blur shadow-elevated h-screen sticky top-0 flex flex-col p-5 ring-1 ring-slate-200">
      <h2 className="text-xl md:text-2xl font-extrabold text-on-surface mb-1">Vulnerability Test Suite</h2>
      <p className="text-xs md:text-sm text-slate-600 mb-4">Select OWASP and advanced adversarial tests to run.</p>
      <nav className="flex-1 overflow-y-auto pr-1">
        <ul>
          {tests.map((test) => (
            <li key={test.id} className="mb-2">
              <label
                className={`flex items-start p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  test.isTestable ? 'hover:bg-blue-50' : 'opacity-60 cursor-not-allowed'
                } ${selectedTests.has(test.id) ? 'bg-blue-100 ring-1 ring-primary/40' : 'bg-transparent'}`}
              >
                <input
                  type="checkbox"
                  checked={selectedTests.has(test.id)}
                  onChange={() => test.isTestable && onToggleTest(test.id)}
                  disabled={!test.isTestable}
                  className="h-5 w-5 md:h-6 md:w-6 rounded border-gray-300 text-primary focus:ring-primary-focus mt-0.5"
                />
                <div className="ml-3">
                  <span className="font-semibold text-sm md:text-base text-on-surface">{test.id}: {test.title}</span>
                  <p className="text-xs md:text-sm text-slate-600">{test.description}</p>
                   {!test.isTestable && (
                    <p className="text-xs font-semibold text-amber-700 mt-1">Not testable via prompt analysis.</p>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-200">
        <p className="text-xs md:text-sm text-slate-500">
          <strong>LLM Providers:</strong>
          <ul className="mt-2 space-y-1 text-xs">
            <li>🔹 <strong>Gemini API</strong> - Advanced testing (requires API key)</li>
            <li>🔹 <strong>Ollama/Local</strong> - Run locally (no API needed)</li>
          </ul>
          <span className="text-slate-600 mt-2 block">Configure in "Configure Target LLM" above.</span>
        </p>
      </div>
    </aside>
  );
};