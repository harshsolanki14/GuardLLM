import React, { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ResultsDisplay } from './components/ResultsDisplay';
import { SummaryChart } from './components/SummaryChart';
import type { TestResult, TestId, LLMProvider, LLMConfig, AttackMode } from './types';
import { OWASP_LLM_TOP_10 } from './constants';
import { listOllamaModels, runTest } from './services/geminiService';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AppState {
    systemPrompt: string;
    selectedTests: Set<TestId>;
    testResults: TestResult[];
    isLoading: boolean;
    currentTest: string | null;
    llmProvider: LLMProvider;
    localModelEndpoint: string;
    localModelName: string;
    attackMode: AttackMode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant.";
const DEFAULT_ENDPOINT = 'http://localhost:11434';
const DEFAULT_MODEL = 'tinyllama';
const BATCH_TEST_DELAY_MS = 100;
const GEMINI_KEY_AVAILABLE = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

const App: React.FC = () => {
    const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);
    const [selectedTests, setSelectedTests] = useState<Set<TestId>>(new Set(OWASP_LLM_TOP_10.filter(t => t.isTestable).map(t => t.id)));
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentTest, setCurrentTest] = useState<string | null>(null);
    const [llmProvider, setLlmProvider] = useState<LLMProvider>(GEMINI_KEY_AVAILABLE ? 'gemini' : 'local');
    const [localModelEndpoint, setLocalModelEndpoint] = useState<string>(DEFAULT_ENDPOINT);
    const [localModelName, setLocalModelName] = useState<string>(DEFAULT_MODEL);
    const [ollamaModels, setOllamaModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [modelDiscoveryError, setModelDiscoveryError] = useState<string | null>(null);
    const [customEndpoint, setCustomEndpoint] = useState('');
    const [customModelName, setCustomModelName] = useState('');
    const [customApiKey, setCustomApiKey] = useState('');
    const [attackMode, setAttackMode] = useState<AttackMode>('basic');

    // Memoized test selection handler
    const handleToggleTest = useCallback((testId: TestId) => {
        setSelectedTests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(testId)) {
                newSet.delete(testId);
            } else {
                newSet.add(testId);
            }
            return newSet;
        });
    }, []);

    // Memoized LLM config builder
    useEffect(() => {
        if (llmProvider !== 'local') return;
        let cancelled = false;
        setIsLoadingModels(true);
        setModelDiscoveryError(null);
        listOllamaModels(localModelEndpoint)
            .then(models => {
                if (!cancelled) {
                    setOllamaModels(models);
                    if (models.length > 0 && !models.includes(localModelName)) {
                        setLocalModelName(models[0]);
                    }
                }
            })
            .catch(error => {
                if (!cancelled) {
                    setModelDiscoveryError(error instanceof Error ? error.message : 'Could not discover Ollama models.');
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingModels(false);
            });
        return () => { cancelled = true; };
    }, [llmProvider, localModelEndpoint]);

    const llmConfig: LLMConfig = useMemo(() => ({
        provider: llmProvider,
        ...(llmProvider === 'local' && { endpoint: localModelEndpoint, model: localModelName }),
        ...(llmProvider === 'custom' && { endpoint: customEndpoint, model: customModelName, apiKey: customApiKey })
    }), [llmProvider, localModelEndpoint, localModelName, customEndpoint, customModelName, customApiKey]);

    // Validate system prompt
    const isValidSystemPrompt = useMemo(() => {
        return systemPrompt.trim().length > 0 && systemPrompt.length <= 32768;
    }, [systemPrompt]);

    const handleRunTests = useCallback(async () => {
        if (!isValidSystemPrompt) {
            alert('System prompt invalid (must be 1-32768 chars)');
            return;
        }

        if (llmProvider === 'gemini' && !GEMINI_KEY_AVAILABLE) {
            alert('Gemini provider requires VITE_GEMINI_API_KEY. Add it in .env.local or switch to Local Model (Ollama).');
            return;
        }

        if (llmProvider === 'local' && (!localModelEndpoint.trim() || !localModelName.trim())) {
            alert('Ollama requires an endpoint URL and an installed model.');
            return;
        }

        if (llmProvider === 'custom' && (!customEndpoint.trim() || !customModelName.trim() || !customApiKey.trim())) {
            alert('Custom API requires an OpenAI-compatible endpoint, model name, and API key.');
            return;
        }

        setIsLoading(true);
        setTestResults([]);

        const initialResults: TestResult[] = OWASP_LLM_TOP_10
            .filter(test => selectedTests.has(test.id))
            .map(test => ({
                id: test.id,
                title: test.title,
                status: 'pending',
                attackPrompt: '',
                response: '',
                analysis: 'Awaiting test execution...',
            }));
        setTestResults(initialResults);

        const selectedTestsList = Array.from(OWASP_LLM_TOP_10).filter(test => 
            selectedTests.has(test.id) && test.isTestable
        );

        for (let idx = 0; idx < selectedTestsList.length; idx++) {
            const test = selectedTestsList[idx];
            try {
                setCurrentTest(test.title);
                setTestResults(prev =>
                    prev.map(r => r.id === test.id ? { ...r, status: 'running' } : r)
                );

                const result = await runTest(test, systemPrompt, llmConfig, attackMode);
                setTestResults(prev =>
                    prev.map(r => r.id === test.id ? { ...r, ...result } : r)
                );

                // Delay between tests to avoid rate limiting
                if (idx < selectedTestsList.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, BATCH_TEST_DELAY_MS));
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "Unknown error";
                setTestResults(prev =>
                    prev.map(r => r.id === test.id ? {
                        ...r,
                        status: 'error',
                        analysis: errorMsg
                    } : r)
                );
            }
        }

        setIsLoading(false);
        setCurrentTest(null);
    }, [selectedTests, systemPrompt, llmConfig, attackMode, isValidSystemPrompt, llmProvider, localModelEndpoint, localModelName]);

    const handleDownloadReport = () => {
        const input = document.getElementById('results-container');
        if (!input) {
            alert("Results not found. Run tests first.");
            return;
        }
    
        const header = document.getElementById('main-header');
        const config = document.getElementById('config-section');

        html2canvas(input, { 
            scale: 2, 
            logging: false, 
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Header
            pdf.setFontSize(22);
            pdf.setTextColor(40);
            pdf.text("GuardLLM Security Test Report", 15, 20);
            pdf.setFontSize(11);
            pdf.setTextColor(100);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 28);
            
            // Image of results
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * (pdfWidth - 30)) / imgProps.width;
            let heightLeft = imgHeight;
            let position = 35;

            pdf.addImage(imgData, 'PNG', 15, position, pdfWidth - 30, imgHeight);
            heightLeft -= (pdfHeight - position - 15);

            while (heightLeft > 0) {
                position -= (pdfHeight - 30);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 15, position, pdfWidth - 30, imgHeight);
                heightLeft -= (pdfHeight - 30);
            }
    
            pdf.save('GuardLLM_Security_Report.pdf');
        }).catch((error) => {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF report.');
        });
    };

    return (
        <div className="flex min-h-screen font-sans">
            <Sidebar
                tests={OWASP_LLM_TOP_10}
                selectedTests={selectedTests}
                onToggleTest={handleToggleTest}
            />
            <main className="flex-1 px-4 sm:px-8 md:px-10 lg:px-14 py-6 md:py-10">
                <div className="max-w-[1400px] mx-auto">
                <header id="main-header" className="mb-8 md:mb-10">
                     <div className="flex items-center gap-4">
                        <ShieldCheckIcon className="h-12 w-12 md:h-14 md:w-14 text-primary drop-shadow-title" />
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">GuardLLM</h1>
                            <p className="text-sm md:text-lg text-slate-600">Automated Security Testing for LLM Applications</p>
                        </div>
                    </div>
                </header>

                <div id="config-section" className="bg-surface/90 backdrop-blur rounded-2xl shadow-soft ring-1 ring-slate-200 p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-on-surface">1. Configure Target LLM</h2>
                    
                    <div className="mb-6">
                        <span className="block text-sm md:text-base font-medium text-slate-700 mb-3">LLM Provider</span>
                        <div className="flex gap-6">
                            <label className={`flex items-center ${!GEMINI_KEY_AVAILABLE ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                    type="radio"
                                    name="llmProvider"
                                    value="gemini"
                                    checked={llmProvider === 'gemini'}
                                    onChange={() => GEMINI_KEY_AVAILABLE && setLlmProvider('gemini')}
                                    className="form-radio h-5 w-5 text-primary focus:ring-primary"
                                    disabled={!GEMINI_KEY_AVAILABLE}
                                />
                                <span className="ml-3 text-base text-on-surface">Gemini API</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="llmProvider" value="local" checked={llmProvider === 'local'} onChange={() => setLlmProvider('local')} className="form-radio h-5 w-5 text-primary focus:ring-primary"/>
                                <span className="ml-3 text-base text-on-surface">Local Model (Ollama)</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="llmProvider" value="custom" checked={llmProvider === 'custom'} onChange={() => setLlmProvider('custom')} className="form-radio h-5 w-5 text-primary focus:ring-primary"/>
                                <span className="ml-3 text-base text-on-surface">Custom OpenAI-Compatible API</span>
                            </label>
                        </div>
                        {!GEMINI_KEY_AVAILABLE && (
                            <p className="text-xs md:text-sm text-amber-700 mt-2">
                                Gemini disabled: set VITE_GEMINI_API_KEY in .env.local to enable.
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <span className="block text-sm md:text-base font-medium text-slate-700 mb-3">Attack Strategy</span>
                        <div className="flex flex-wrap gap-4">
                            <label className={`flex items-center px-4 py-2 rounded-xl ring-1 ring-slate-300 cursor-pointer ${attackMode === 'basic' ? 'bg-blue-50 ring-primary/40' : 'bg-white'}`}>
                                <input type="radio" name="attackMode" value="basic" checked={attackMode === 'basic'} onChange={() => setAttackMode('basic')} className="form-radio h-5 w-5 text-primary focus:ring-primary"/>
                                <span className="ml-3 text-base">Basic Attacks</span>
                            </label>
                            <label className={`flex items-center px-4 py-2 rounded-xl ring-1 ring-slate-300 cursor-pointer ${attackMode === 'advanced' ? 'bg-blue-50 ring-primary/40' : 'bg-white'}`}>
                                <input type="radio" name="attackMode" value="advanced" checked={attackMode === 'advanced'} onChange={() => setAttackMode('advanced')} className="form-radio h-5 w-5 text-primary focus:ring-primary"/>
                                <span className="ml-3 text-base">Advanced Attacks</span>
                            </label>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mt-2">Advanced uses stronger, modern jailbreak and evasion techniques for deeper security testing.</p>
                    </div>

                    {llmProvider === 'local' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-5 border rounded-xl bg-slate-50">
                            <div>
                                <label htmlFor="local-model-endpoint" className="block text-sm font-medium text-slate-700 mb-2">Ollama Server URL</label>
                                <input id="local-model-endpoint" type="url" value={localModelEndpoint} onChange={(e) => setLocalModelEndpoint(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary" disabled={isLoading} />
                            </div>
                             <div>
                                <label htmlFor="local-model-name" className="block text-sm font-medium text-slate-700 mb-2">Installed Model</label>
                                <input id="local-model-name" list="ollama-models" value={localModelName} onChange={(e) => setLocalModelName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary" disabled={isLoading} />
                                <datalist id="ollama-models">{ollamaModels.map(model => <option key={model} value={model} />)}</datalist>
                                <p className="text-xs text-slate-500 mt-2">{isLoadingModels ? 'Discovering installed models...' : `${ollamaModels.length} installed model${ollamaModels.length === 1 ? '' : 's'} discovered.`}</p>
                            </div>
                            {modelDiscoveryError && <p className="md:col-span-2 text-sm text-amber-700">{modelDiscoveryError} Check that Ollama is running and accessible from this browser.</p>}
                        </div>
                    )}

                    {llmProvider === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-5 border rounded-xl bg-slate-50">
                            <div className="md:col-span-2">
                                <label htmlFor="custom-endpoint" className="block text-sm font-medium text-slate-700 mb-2">OpenAI-Compatible Chat Completions URL</label>
                                <input id="custom-endpoint" type="url" value={customEndpoint} onChange={(e) => setCustomEndpoint(e.target.value)} placeholder="https://api.example.com/v1/chat/completions" className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary" disabled={isLoading} />
                            </div>
                            <div>
                                <label htmlFor="custom-model" className="block text-sm font-medium text-slate-700 mb-2">Model Name</label>
                                <input id="custom-model" type="text" value={customModelName} onChange={(e) => setCustomModelName(e.target.value)} placeholder="model-name" className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary" disabled={isLoading} />
                            </div>
                            <div>
                                <label htmlFor="custom-api-key" className="block text-sm font-medium text-slate-700 mb-2">API Key (kept in memory only)</label>
                                <input id="custom-api-key" type="password" autoComplete="off" value={customApiKey} onChange={(e) => setCustomApiKey(e.target.value)} placeholder="Paste provider key" className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary" disabled={isLoading} />
                            </div>
                            <p className="md:col-span-2 text-xs text-slate-500">The endpoint must accept OpenAI-compatible chat-completion requests. The key is never stored, logged, or uploaded.</p>
                        </div>
                    )}

                    <label htmlFor="system-prompt" className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                        System Prompt
                    </label>
                    <textarea
                        id="system-prompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="e.g., You are a helpful assistant that only answers questions about science."
                        className="w-full h-28 md:h-36 p-4 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
                        disabled={isLoading}
                    />
                    <p className="text-xs md:text-sm text-slate-500 mt-2">Define the core instruction or persona of the LLM you want to test.</p>
                </div>
                
                <div className="bg-surface/90 backdrop-blur rounded-2xl shadow-soft ring-1 ring-slate-200 p-6 md:p-8 mb-8">
                     <h2 className="text-2xl font-semibold mb-3 text-on-surface">2. Select & Run Tests</h2>
                     <p className="text-sm md:text-base text-slate-600 mb-6">Choose which tests to run from the sidebar, including updated OWASP LLM Top 10 checks and 10 advanced adversarial attack tests.</p>
                    <button
                        onClick={handleRunTests}
                        disabled={isLoading || selectedTests.size === 0}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-primary-focus text-white font-bold rounded-xl hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center text-base md:text-lg shadow-soft"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="truncate">Testing: {currentTest}...</span>
                            </>
                        ) : (
                            `Run ${selectedTests.size} Selected Tests`
                        )}
                    </button>
                </div>
                
                {testResults.length > 0 && (
                    <div id="results-container" className="bg-surface/90 backdrop-blur rounded-2xl shadow-soft ring-1 ring-slate-200 p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
                             <h2 className="text-2xl font-semibold text-on-surface">3. Analysis & Results</h2>
                             <button
                                onClick={handleDownloadReport}
                                className="px-5 py-3 bg-secondary text-white font-semibold text-sm md:text-base rounded-xl hover:opacity-90 transition-opacity shadow-soft"
                            >
                                Download Report
                            </button>
                        </div>
                         <div className="mb-8">
                            <SummaryChart results={testResults} />
                        </div>
                        <ResultsDisplay results={testResults} tests={OWASP_LLM_TOP_10} />
                    </div>
                )}
                </div>
            </main>
        </div>
    );
};

export default App;