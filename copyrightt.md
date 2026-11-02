# Copyright Report

## Project Information
- Project name: GuardLLM
- Repository: guardllm_-automated-llm-security-testing
- Date: [Add date]
- Prepared by: Harsh Solanki, Rudra Kareliya, Palash Thakkar

## Copyright Statement
I certify that the source code included in this report is the original work of the author(s) or is otherwise used with proper permission.

## Scope for This Report
This appendix includes only the important source files and representative logic needed for copyright review. It is intentionally shortened to keep the final PDF under 20 pages.

## Key Files Included
- [App.tsx](#apptsx)
- [types.ts](#typests)
- [constants.ts](#constantsts)
- [services/geminiService.ts](#servicesgeminiservicets)
- [scripts/check-ollama.js](#scriptscheck-ollamajs)
- [scripts/start-ollama.js](#scriptsstart-ollamajs)

## App.tsx
```tsx
const App: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [selectedTests, setSelectedTests] = useState<Set<TestId>>(new Set(OWASP_LLM_TOP_10.filter(t => t.isTestable).map(t => t.id)));
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [llmProvider, setLlmProvider] = useState<LLMProvider>(GEMINI_KEY_AVAILABLE ? 'gemini' : 'local');
  const [localModelEndpoint, setLocalModelEndpoint] = useState<string>(DEFAULT_ENDPOINT);
  const [localModelName, setLocalModelName] = useState<string>(DEFAULT_MODEL);
  const [attackMode, setAttackMode] = useState<AttackMode>('basic');

  const handleRunTests = useCallback(async () => {
    // validates prompt/provider, runs selected tests, and stores results
  }, [selectedTests, systemPrompt, llmConfig, attackMode, isValidSystemPrompt, llmProvider, localModelEndpoint, localModelName]);

  return (
    <main>
      {/* sidebar, configuration controls, run button, and results summary */}
    </main>
  );
};
```

## types.ts
```ts
export type TestId = 'LLM01' | 'LLM02' | 'LLM03' | 'LLM04' | 'LLM05' | 'LLM06' | 'LLM07' | 'LLM08' | 'LLM09' | 'LLM10' | 'ATT01' | 'ATT02' | 'ATT03' | 'ATT04' | 'ATT05' | 'ATT06' | 'ATT07' | 'ATT08' | 'ATT09' | 'ATT10';

export interface Test {
  id: TestId;
  title: string;
  description: string;
  attackExplanation: string;
  isTestable: boolean;
}

export type TestStatus = 'pass' | 'fail' | 'warning' | 'error' | 'running' | 'pending' | 'not-testable';

export interface TestResult {
  id: TestId;
  title: string;
  status: TestStatus;
  attackPrompt: string;
  response: string;
  analysis: string;
}

export type LLMProvider = 'gemini' | 'local';
export interface LLMConfig {
  provider: LLMProvider;
  endpoint?: string;
  model?: string;
}

export type AttackMode = 'basic' | 'advanced';
```

## constants.ts
```ts
export const OWASP_LLM_TOP_10: Test[] = [
  { id: 'LLM01', title: 'Prompt Injection', description: 'Instruction manipulation that attempts to override system controls.', attackExplanation: 'Checks whether attacker-controlled instructions can supersede trusted instructions.', isTestable: true },
  { id: 'LLM02', title: 'Sensitive Information Disclosure', description: 'Exposure of secrets or private context through model responses.', attackExplanation: 'Checks whether the model leaks confidential details under pressure.', isTestable: true },
  { id: 'LLM07', title: 'System Prompt Leakage', description: 'Extraction of hidden instructions or internal guardrail content.', attackExplanation: 'Tests whether hidden policy text and instruction layers can be exfiltrated.', isTestable: true },
  { id: 'ATT06', title: 'Indirect Prompt Injection', description: 'Hidden commands in content meant for summarization or retrieval.', attackExplanation: 'Simulates untrusted document ingestion to verify instruction/data separation.', isTestable: true },
  { id: 'ATT10', title: 'Sycophancy Exploitation', description: 'Manipulative pressure to force agreement over accuracy.', attackExplanation: 'Evaluates whether the model sacrifices correctness to satisfy user bias.', isTestable: true }
];
```

## services/geminiService.ts
```ts
const MAX_PROMPT_LENGTH = 32768;
const MAX_RESPONSE_LENGTH = 16384;

const validateSystemPrompt = (prompt: string): void => {
  if (typeof prompt !== 'string' || prompt.length === 0) throw new Error('System prompt must be a non-empty string.');
  if (prompt.length > MAX_PROMPT_LENGTH) throw new Error(`System prompt exceeds maximum length (${MAX_PROMPT_LENGTH} chars).`);
};

const getSafeEndpoint = (endpoint?: string): string => {
  if (!endpoint || typeof endpoint !== 'string') throw new Error('Endpoint must be a non-empty string.');
  const parsed = new URL(endpoint.trim());
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP/HTTPS protocols allowed.');
  return parsed.toString();
};

const getAttackPromptGenerationInstruction = (test: Test, systemPrompt: string, mode: AttackMode): string => {
  validateSystemPrompt(systemPrompt);
  return mode === 'advanced' ? ADVANCED_PROMPTS[test.id] : BASIC_PROMPTS[test.id];
};

const resolveDeterministicStatus = (test: Test, llmResponse: string) => {
  // classifies refusal, leakage, unsafe markup, autonomy, and other risky output patterns
};

export const runTest = async (test: Test, systemPrompt: string, llmConfig: LLMConfig, mode: AttackMode) => {
  const attackPrompt = await generateAttackPrompt(test, systemPrompt, mode, llmConfig);
  const response = await simulateTargetLLM(systemPrompt, attackPrompt, llmConfig);
  const { status, analysis } = await analyzeResponse(test, systemPrompt, attackPrompt, response, llmConfig);
  return { status, attackPrompt, response, analysis };
};
```

## scripts/check-ollama.js
```js
async function checkOllama() {
  const ollamaPath = process.env.LOCALAPPDATA + '\\Programs\\Ollama\\ollama.exe';
  const { stdout } = await execAsync(`powershell -Command "Test-Path '${ollamaPath}'"`);
  if (stdout.trim() === 'False') {
    console.error('Ollama is not installed.');
    process.exit(1);
  }

  try {
    const { stdout: models } = await execAsync(`powershell -Command "$env:Path += ';${process.env.LOCALAPPDATA}\\Programs\\Ollama'; ollama list"`);
    const hasModels = models.includes('tinyllama') || models.includes('gemma') || models.includes('llama');
    if (!hasModels) console.warn('No models found.');
  } catch (error) {
    console.warn('Could not check models.');
  }
}
```

## scripts/start-ollama.js
```js
async function startOllama() {
  const ollamaPath = process.env.LOCALAPPDATA + '\\Programs\\Ollama\\ollama.exe';

  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) return;
  } catch (error) {}

  process.env.OLLAMA_ORIGINS = '*';
  process.env.OLLAMA_GPU_LAYERS = '99';

  const ollama = spawn(ollamaPath, ['serve'], {
    env: { ...process.env, OLLAMA_ORIGINS: '*', OLLAMA_GPU_LAYERS: '99' },
    stdio: 'inherit',
    shell: false
  });

  process.on('SIGINT', () => {
    ollama.kill();
    process.exit(0);
  });
}
```

## Notes
- This version is intentionally compact to keep the PDF short.
- If you want, I can reduce it further to only 2 or 3 files for an even shorter report.
