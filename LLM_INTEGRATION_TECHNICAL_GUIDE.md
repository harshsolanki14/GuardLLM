# GuardLLM - Technical Integration Guide

This document explains the architecture and implementation of Gemini API and Ollama integration in GuardLLM.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    React App (App.tsx)              │
│  - LLM Provider Selection (UI)                      │
│  - Configuration Management                         │
│  - Test Orchestration                               │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│         Service Layer (geminiService.ts)            │
│  - runTest() - Main test executor                   │
│  - Routes to Gemini or Local based on config       │
└─────────────────────────────────────────────────────┘
                    ┌───────┴────────┐
                    ▼                ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Gemini API      │  │  Ollama/Local    │
        │  (Google GenAI)  │  │  (Chat API)      │
        └──────────────────┘  └──────────────────┘
```

---

## 1. Gemini API Integration

### Files Involved
- `services/geminiService.ts` - Main implementation
- `App.tsx` - UI provider selection
- `.env.local` - API key storage

### How It Works

#### Step 1: API Initialization (geminiService.ts)
```typescript
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? null;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
```

#### Step 2: Provider Detection (App.tsx)
```typescript
const GEMINI_KEY_AVAILABLE = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

// Default to Gemini if available, otherwise Local
const [llmProvider, setLlmProvider] = useState<LLMProvider>(
  GEMINI_KEY_AVAILABLE ? 'gemini' : 'local'
);
```

#### Step 3: Test Execution Flow
```
User clicks "Run Tests"
       │
       ▼
runTest(test, systemPrompt, llmConfig, mode)
       │
       ├─ generateAttackPrompt() 
       │  └─ generateAttackPromptGemini()
       │     └─ ai.models.generateContent({model: 'gemini-2.5-flash'})
       │
       ├─ simulateTargetLLM()
       │  └─ simulateTargetLLMGemini()
       │     └─ ai.models.generateContent({model: 'gemini-2.5-flash'})
       │
       ├─ analyzeResponse()
       │  └─ analyzeResponseGemini()
       │     └─ ai.models.generateContent({model: 'gemini-2.5-pro'})
       │
       └─ Return TestResult
```

### Gemini Models Used

| Step | Model | Purpose |
|------|-------|---------|
| Attack Prompt Generation | `gemini-2.5-flash` | Generate attack vectors |
| Target LLM Simulation | `gemini-2.5-flash` | Simulate target model responses |
| Response Analysis | `gemini-2.5-pro` | Analyze vulnerability indicators |

### Key Functions

#### generateAttackPromptGemini()
```typescript
async function generateAttackPromptGemini(instruction: string): Promise<string> {
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
    });
    return response.text.trim();
}
```

#### simulateTargetLLMGemini()
```typescript
async function simulateTargetLLMGemini(
    systemPrompt: string, 
    attackPrompt: string
): Promise<string> {
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: attackPrompt,
        config: {
            systemInstruction: systemPrompt
        }
    });
    return response.text.trim();
}
```

#### analyzeResponseGemini()
```typescript
async function analyzeResponseGemini(
    test: Test, 
    analysisPrompt: string, 
    llmResponse: string
): Promise<{ status: 'pass' | 'fail' | 'warning'; analysis: string }> {
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: analysisPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema
        }
    });
    // Parse and validate response...
}
```

---

## 2. Ollama/Local Integration

### Files Involved
- `services/geminiService.ts` - Implementation
- `App.tsx` - Configuration UI
- `types.ts` - Type definitions

### How It Works

#### Step 1: Configuration (App.tsx)
```typescript
const [localModelEndpoint, setLocalModelEndpoint] = useState<string>(
  'http://localhost:11434/v1/chat/completions'
);
const [localModelName, setLocalModelName] = useState<string>('tinyllama');

// Model selection dropdown
<select id="local-model-name" value={localModelName} onChange={(e) => setLocalModelName(e.target.value)}>
    <option value="llama3.1:8b">Llama 3.1 8B (Robust)</option>
    <option value="gemma:2b">Gemma 2B (Moderate Security)</option>
    <option value="tinyllama">TinyLlama 1.1B (⚠️ Highly Vulnerable)</option>
    <option value="llama3.2:1b">Llama 3.2 1B</option>
    <option value="phi3">Phi-3 Mini</option>
</select>
```

#### Step 2: LLM Config Creation (App.tsx)
```typescript
const llmConfig: LLMConfig = useMemo(() => ({
    provider: llmProvider,
    ...(llmProvider === 'local' && { 
        endpoint: localModelEndpoint, 
        model: localModelName 
    })
}), [llmProvider, localModelEndpoint, localModelName]);
```

#### Step 3: Test Execution Flow
```
User clicks "Run Tests"
       │
       ▼
runTest(test, systemPrompt, llmConfig, mode)
       │
       ├─ generateAttackPrompt() 
       │  └─ generateAttackPromptLocal(instruction, config)
       │     └─ fetch("http://localhost:11434/v1/chat/completions", {...})
       │        └─ Return attack prompt
       │
       ├─ simulateTargetLLM()
       │  └─ simulateTargetLLMLocal(systemPrompt, attackPrompt, config)
       │     └─ fetch(endpoint, {
       │          model: config.model,
       │          messages: [{system}, {user: attackPrompt}]
       │        })
       │        └─ Return target model response
       │
       ├─ analyzeResponse()
       │  └─ analyzeResponseLocal(test, analysisPrompt, response, config)
       │     └─ fetch(endpoint) - Analyze vulnerability
       │        └─ Return { status: 'pass'|'fail'|'warning', analysis: string }
       │
       └─ Return TestResult
```

### Key Functions

#### generateAttackPromptLocal()
```typescript
async function generateAttackPromptLocal(
    instruction: string, 
    config: LLMConfig
): Promise<string> {
    const endpoint = getSafeEndpoint(config.endpoint);
    const payload = {
        model: config.model,
        messages: [{ role: 'user', content: instruction }],
        stream: false
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
    });

    const data = await response.json();
    return parseChatCompletionContent(data);
}
```

#### simulateTargetLLMLocal()
```typescript
async function simulateTargetLLMLocal(
    systemPrompt: string, 
    attackPrompt: string, 
    config: LLMConfig
): Promise<string> {
    const endpoint = getSafeEndpoint(config.endpoint);
    const payload = {
        model: config.model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: attackPrompt }
        ],
        stream: false
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
    });

    const data = await response.json();
    return parseChatCompletionContent(data);
}
```

#### analyzeResponseLocal()
```typescript
async function analyzeResponseLocal(
    test: Test, 
    analysisPrompt: string, 
    llmResponse: string, 
    config: LLMConfig
): Promise<{ status: 'pass' | 'fail' | 'warning'; analysis: string }> {
    // Deterministic status first
    const deterministic = resolveDeterministicStatus(test, llmResponse);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: analysisPrompt }],
                stream: false
            })
        });

        // Parse response, extract JSON
        const result = JSON.parse(responseText);
        
        // Combine with deterministic check
        const status = combineStatus(test, deterministic.status, result.vulnerable);
        return { status, analysis: ... };
    } catch (error) {
        // Fallback to deterministic
        return { status: deterministic.status, analysis: ... };
    }
}
```

### Ollama API Endpoint

The application uses the **OpenAI-compatible API** provided by Ollama:

```
Endpoint: http://localhost:11434/v1/chat/completions
```

This is OpenAI ChatCompletion format:
```json
{
  "model": "tinyllama",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant..."},
    {"role": "user", "content": "..."}
  ],
  "stream": false
}
```

---

## 3. Routing and Configuration

### Type Definition (types.ts)
```typescript
export type LLMProvider = 'gemini' | 'local';

export interface LLMConfig {
    provider: LLMProvider;
    endpoint?: string;      // Required for 'local'
    model?: string;         // Required for 'local'
}
```

### Conditional Execution (geminiService.ts)

```typescript
export const runTest = async (
    test: Test, 
    systemPrompt: string, 
    llmConfig: LLMConfig, 
    mode: AttackMode
): Promise<Omit<TestResult, 'id' | 'title'>> => {
    // Validation
    if (llmConfig.provider === 'gemini' && !API_KEY) {
        throw new Error("Gemini API key not configured.");
    }

    // Route to correct provider
    const attackPrompt = llmConfig.provider === 'gemini'
        ? await generateAttackPromptGemini(...)
        : await generateAttackPromptLocal(...);

    const response = llmConfig.provider === 'gemini'
        ? await simulateTargetLLMGemini(...)
        : await simulateTargetLLMLocal(...);

    const { status, analysis } = llmConfig.provider === 'gemini'
        ? await analyzeResponseGemini(...)
        : await analyzeResponseLocal(...);

    return { status, attackPrompt, response, analysis };
};
```

---

## 4. Error Handling and Resilience

### Retry Logic
Both Gemini and Ollama use exponential backoff:
```typescript
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1000;

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
        // API call
    } catch (error) {
        if (!isRetriableError(error) || attempt === MAX_RETRIES) {
            throw error;
        }
        await new Promise(resolve => 
            setTimeout(resolve, getBackoffDelay(attempt))
        );
    }
}
```

### Timeout Protection
```typescript
const TIMEOUT_MS = 60000;

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

const response = await fetch(endpoint, {
    // ... other options
    signal: controller.signal
});

clearTimeout(timeoutId);
```

### Fallback Analysis
If AI analysis fails, use deterministic pattern matching:
```typescript
const deterministic = resolveDeterministicStatus(test, llmResponse);

// Uses regex patterns to detect vulnerability indicators
// Provides at least basic assessment if AI is unavailable
```

---

## 5. Environment Configuration

### .env.local
```bash
# Gemini API (optional)
VITE_GEMINI_API_KEY=sk_abcdef123456...

# Ollama (optional - defaults used if not set)
VITE_OLLAMA_ENDPOINT=http://localhost:11434/v1/chat/completions
VITE_OLLAMA_MODEL=tinyllama
```

### Default Values (if not in .env.local)
```typescript
const DEFAULT_ENDPOINT = 'http://localhost:11434/v1/chat/completions';
const DEFAULT_MODEL = 'tinyllama';
```

---

## 6. Comparison Table

| Feature | Gemini | Ollama |
|---------|--------|--------|
| **API Type** | REST (googlegenai) | OpenAI-compatible |
| **Authentication** | API Key (env var) | None (local) |
| **Response Format** | Google-specific | OpenAI standard |
| **Timeout** | 60s | 60s |
| **Retries** | 3 with backoff | 3 with backoff |
| **Response Schema** | JSON structured output | Standard completions |
| **Fallback** | Error message | Deterministic analysis |

---

## 7. Adding New LLM Providers

To add a new provider (e.g., OpenAI, Anthropic):

1. **Update Type** (types.ts):
```typescript
export type LLMProvider = 'gemini' | 'local' | 'openai'; // Add here
```

2. **Add UI** (App.tsx):
```typescript
<label>
    <input type="radio" value="openai" onChange={() => setLlmProvider('openai')} />
    OpenAI API
</label>
```

3. **Implement Functions** (geminiService.ts):
```typescript
async function generateAttackPromptOpenAI(instruction: string): Promise<string> {
    // Implementation using OpenAI API
}

async function simulateTargetLLMOpenAI(systemPrompt: string, attackPrompt: string): Promise<string> {
    // Implementation
}

async function analyzeResponseOpenAI(...): Promise<{ status:..., analysis:... }> {
    // Implementation
}
```

4. **Add to Routing**:
```typescript
const attackPrompt = 
    llmConfig.provider === 'gemini' ? await generateAttackPromptGemini(...)
    : llmConfig.provider === 'openai' ? await generateAttackPromptOpenAI(...)
    : await generateAttackPromptLocal(...);
```

---

## 8. Testing Both Providers

### Test Script
```bash
#!/bin/bash

echo "Testing Gemini API..."
export VITE_GEMINI_API_KEY=your_key
npm run dev
# Select "Gemini API" in UI, run tests

echo "Testing Ollama..."
ollama serve &
ollama pull tinyllama
# Select "Local Model (Ollama)" in UI, run tests
```

---

## Summary

- **Gemini**: Powerful multi-step testing using Google's advanced models
- **Ollama**: Free, private, offline testing using local open-source models
- **Unified Interface**: Single UI supports both providers via configuration
- **Smart Routing**: `runTest()` automatically routes to correct implementation
- **Robust**: Timeout, retry, and fallback mechanisms for both

Both providers follow the same test workflow and produce identical output format, allowing seamless switching for testing.
