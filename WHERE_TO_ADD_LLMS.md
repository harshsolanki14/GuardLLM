# GuardLLM - Where to Add/Configure LLMs

Quick reference for where to configure Gemini API and Ollama in the application.

---

## 🔷 GEMINI API - Setup Locations

### 1️⃣ Get API Key
- **Where**: [Google AI Studio](https://aistudio.google.com/app/apikeys)
- **Action**: Create a new API key and copy it

### 2️⃣ Store API Key
- **Where**: `.env.local` file (in project root)
- **Add this line**:
  ```
  VITE_GEMINI_API_KEY=your_api_key_here
  ```
- **Example**: 
  ```
  VITE_GEMINI_API_KEY=sk_abcdef123456xyz789...
  ```

### 3️⃣ Client Initialization
- **File**: [services/geminiService.ts](services/geminiService.ts) (Line ~40)
- **Code**:
  ```typescript
  import { GoogleGenAI } from "@google/genai";
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? null;
  const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
  ```
- **What it does**: Initializes Google GenAI client with your API key

### 4️⃣ Provider Detection
- **File**: [App.tsx](App.tsx) (Line ~34)
- **Code**:
  ```typescript
  const GEMINI_KEY_AVAILABLE = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
  ```
- **What it does**: Checks if API key is configured to enable Gemini in UI

### 5️⃣ UI Selection
- **File**: [App.tsx](App.tsx) (Line ~160)
- **Component**: "LLM Provider" radio buttons
- **Action**: User selects "Gemini API" in the app

### 6️⃣ Test Execution
- **File**: [services/geminiService.ts](services/geminiService.ts) (Line ~774)
- **Function**: `export const runTest()`
- **Routing**:
  ```typescript
  if (llmConfig.provider === 'gemini') {
      // Use Gemini endpoints
  }
  ```
- **Models Used**:
  - `gemini-2.5-flash` - Generate attacks & simulate responses
  - `gemini-2.5-pro` - Analyze vulnerabilities

---

## 🔶 OLLAMA - Setup Locations

### 1️⃣ Install Ollama
- **Where**: [ollama.ai](https://ollama.ai)
- **Action**: Download and install for your OS

### 2️⃣ Start Ollama Server
- **Command**: 
  ```bash
  ollama serve
  ```
- **Runs on**: `http://localhost:11434`
- **Status**: Check with `curl http://localhost:11434/api/tags`

### 3️⃣ Pull a Model
- **Command Options**:
  ```bash
  ollama pull tinyllama              # 1.1B - Highly vulnerable (RECOMMENDED)
  ollama pull llama3.2:1b            # 1B - Lightweight
  ollama pull gemma:2b               # 2B - Moderate
  ollama pull llama3.1:8b            # 8B - Production-like
  ```

### 4️⃣ Configure Endpoint (Optional)
- **File**: `.env.local` (optional - defaults work fine)
- **Line**:
  ```env
  VITE_OLLAMA_ENDPOINT=http://localhost:11434/v1/chat/completions
  ```
- **Default in Code** ([App.tsx](App.tsx), Line ~30):
  ```typescript
  const DEFAULT_ENDPOINT = 'http://localhost:11434/v1/chat/completions';
  ```

### 5️⃣ UI Configuration
- **File**: [App.tsx](App.tsx) (Lines ~160-180)
- **Location**: "LLM Provider" section
- **Fields**:
  - Radio button: **"Local Model (Ollama)"**
  - Text input: **"Ollama Endpoint URL"**
  - Dropdown: **"Model Name"** (pre-filled with options)

### 6️⃣ Model Selection
- **File**: [App.tsx](App.tsx) (Lines ~178-183)
- **Location**: Model dropdown menu
- **Options**:
  ```html
  <option value="llama3.1:8b">Llama 3.1 8B (Robust)</option>
  <option value="gemma:2b">Gemma 2B (Moderate Security)</option>
  <option value="tinyllama">TinyLlama 1.1B (⚠️ Highly Vulnerable - Best for Testing)</option>
  <option value="llama3.2:1b">Llama 3.2 1B</option>
  <option value="phi3">Phi-3 Mini</option>
  ```

### 7️⃣ Test Execution
- **File**: [services/geminiService.ts](services/geminiService.ts)
- **Routing** (Line ~600):
  ```typescript
  if (config.provider === 'local') {
      return simulateTargetLLMLocal(systemPrompt, attackPrompt, config);
  }
  ```
- **Functions Used**:
  - `generateAttackPromptLocal()` (Line ~550)
  - `simulateTargetLLMLocal()` (Line ~600)
  - `analyzeResponseLocal()` (Line ~700)

---

## 📋 File Structure Reference

```
guardllm_-automated-llm-security-testing/
├── App.tsx                          ← UI provider selection
├── .env.local                       ← Add VITE_GEMINI_API_KEY here
├── types.ts                         ← LLMProvider type definition
├── services/
│   └── geminiService.ts            ← Gemini & Ollama implementations
├── components/
│   ├── Sidebar.tsx                 ← Test selection (updated info text)
│   └── ...
├── LLM_SETUP_GUIDE.md              ← Setup instructions (NEW)
├── LLM_INTEGRATION_TECHNICAL_GUIDE.md ← Technical details (NEW)
└── README.md                        ← Updated with dual provider setup
```

---

## 🎯 Quick Validation Checklist

### For Gemini API:
- [ ] API key obtained from [aistudio.google.com](https://aistudio.google.com/app/apikeys)
- [ ] `.env.local` file created with `VITE_GEMINI_API_KEY=...`
- [ ] Application restarted after adding env var
- [ ] "Gemini API" option appears in LLM Provider selector
- [ ] Run tests and see Gemini being used

### For Ollama:
- [ ] Ollama installed from [ollama.ai](https://ollama.ai)
- [ ] `ollama serve` running in terminal
- [ ] Model pulled: `ollama pull tinyllama`
- [ ] API responds: `curl http://localhost:11434/api/tags`
- [ ] "Local Model (Ollama)" selected in LLM Provider
- [ ] Endpoint: `http://localhost:11434/v1/chat/completions`
- [ ] Model name selected from dropdown
- [ ] Run tests and see Ollama being used

---

## 🚨 Common Issues & Solutions

### Gemini Issues

| Error | Solution |
|-------|----------|
| "VITE_GEMINI_API_KEY not configured" | Add to `.env.local`, restart `npm run dev` |
| "Quota Exceeded" | Switch to Ollama or upgrade API tier |
| "Connection refused" | Check internet connection |
| "Invalid API key" | Verify key copied correctly from AI Studio |

### Ollama Issues

| Error | Solution |
|-------|----------|
| "Connection refused" | Run `ollama serve` first |
| "Model not found" | Run `ollama pull tinyllama` |
| "Port already in use" | Kill existing Ollama or use different port |
| "Slow responses" | Use smaller model (TinyLlama instead of 8B) |
| "Endpoint not working" | Verify URL: `http://localhost:11434/v1/chat/completions` |

---

## 🔄 Switching Between Providers at Runtime

The app allows instant switching:

1. **In UI**: Select either "Gemini API" or "Local Model (Ollama)"
2. **Configure**: Set system prompt, attack mode
3. **Run Tests**: Will use the selected provider
4. **Switch**: Can change provider and run again

No restart or code changes needed!

---

## 📊 Feature Comparison

| Feature | Gemini | Ollama |
|---------|--------|--------|
| Setup Time | 5 min | 15-30 min |
| Setup Location | `.env.local` | Terminal + dropdown |
| Cost | Free tier + $ | Free |
| Privacy | Cloud | Local |
| Speed | API dependent | Hardware dependent |
| Configuration UI | None needed | Built-in fields |
| Model Selection | Fixed (Google's) | Choose any GGUF model |
| Internet Required | Yes | No |

---

## 💡 Recommendation for Different Use Cases

### For Production Testing 🏢
→ Use **Gemini API**
- Advanced models
- Precise vulnerability detection
- Consistent results
- Professional report generation

### For Development/Testing 🧪
→ Use **Ollama**
- Free unlimited testing
- Offline capability
- Local data (privacy)
- Fast iteration
- Good for finding common vulnerabilities

### For Learning 📚
→ Use **Ollama (TinyLlama)**
- Understand how attacks work
- See common vulnerabilities
- Fast feedback
- Educational purposes

### For Both? 🔄
→ Use **Both** (compare results)
- Run same tests on both providers
- See how different models respond
- Comprehensive security assessment

---

## 📖 More Information

- **Setup Guide**: See [LLM_SETUP_GUIDE.md](LLM_SETUP_GUIDE.md)
- **Technical Details**: See [LLM_INTEGRATION_TECHNICAL_GUIDE.md](LLM_INTEGRATION_TECHNICAL_GUIDE.md)
- **OWASP Tests**: See [ADVANCED_TESTS.md](ADVANCED_TESTS.md)
- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
