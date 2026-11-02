# GuardLLM Quick Start Guide

## What's New?

Your GuardLLM project now includes:
- ✅ **20 Security Tests** (10 OWASP + 10 Advanced Adversarial)
- ✅ **Secure Configuration** (API keys in environment, not hardcoded)
- ✅ **Enhanced Service Layer** (URL validation, response parsing, null checks)
- ✅ **Comprehensive Documentation** (ADVANCED_TESTS.md, IMPLEMENTATION_SUMMARY.md)

## Quick Setup

### 1. Choose Your LLM Provider

**Option A: Gemini API** (Recommended for production testing)
- Pro: Fast, advanced models, good for real-world scenarios
- Setup: Get API key from [Google AI Studio](https://aistudio.google.com/app/apikeys), add to `.env.local`
- Cost: Free tier available, check [pricing](https://ai.google.dev/pricing)

**Option B: Ollama Local** (Recommended for development/free testing)
- Pro: Free, unlimited, private, no internet needed
- Setup: Install [Ollama](https://ollama.ai), run `ollama serve`, pull a model
- Models: tinyllama (1.1B), llama3.2:1b, gemma:2b, llama3.1:8b

**👉 [See LLM_SETUP_GUIDE.md](LLM_SETUP_GUIDE.md) for detailed setup of both providers**

### 2. First Time Setup

```bash
# Clone/extract the project
cd guardllm

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# If using Gemini: Add your API key to .env.local
# VITE_GEMINI_API_KEY=your_key_here

# If using Ollama: Start the server in another terminal
# ollama serve
# ollama pull tinyllama
```

### 3. Run the App

```bash
npm run dev
```

Open `http://localhost:5173` (or shown port) in your browser.

### 4. Select & Run Tests

1. **Configure Target LLM** section:
   - Choose provider: Gemini API or Local Model (Ollama)
   - If Ollama: set endpoint and model name
   - Enter system prompt for your target LLM

2. **Select & Run Tests** section:
   - Check tests in left sidebar (all 20 available)
   - Choose attack mode: Basic or Advanced
   - Click "Run Tests"

3. **View & Export Results**:
   - See vulnerability analysis for each test
   - Click "Download Report" for PDF export

## Test Categories

### OWASP LLM Top 10 (LLM01-LLM10)
Core vulnerabilities in LLM applications:
- Prompt Injection
- Information Disclosure
- Supply Chain Risks
- Data Poisoning
- Unsafe Output
- Excessive Agency
- System Prompt Leakage
- Embedding Weaknesses
- Misinformation
- Resource Exhaustion

### Advanced Adversarial (ATT01-ATT10)
Sophisticated evasion and manipulation attacks:
- Cross-Lingual Evasion
- Payload Obfuscation
- Context Exhaustion
- Persona Adoption
- Few-Shot Conditioning
- Indirect Injection
- Token Suffixing
- PII Elicitation
- Induced Hallucination
- Sycophancy Exploitation

## Key Files

| File | Purpose |
|------|---------|
| `ADVANCED_TESTS.md` | Detailed documentation of all 20 tests |
| `IMPLEMENTATION_SUMMARY.md` | Technical overview of changes |
| `.env.local.example` | Template for environment setup |
| `constants.ts` | All test definitions |
| `services/geminiService.ts` | Test execution & analysis engine |

## Security Notes

- **Never commit `.env.local`** - It contains your API key
- **Use local models for development** - Faster, cheaper, offline
- **Test non-production systems** - All attacks are designed to be non-harmful
- **Review results carefully** - Check for any accidental information leakage
- **Keep `.env.local.example` updated** - Share as template, not with secrets

## Troubleshooting

### "Gemini API key is not configured"
→ Set `VITE_GEMINI_API_KEY` in `.env.local`

### "Failed to connect to local endpoint"
→ Make sure Ollama is running: `OLLAMA_ORIGINS='*' ollama serve`

### Tests taking too long
→ Switch to "Basic" attack mode or use smaller local models (Gemma 2B)

### Want to test different LLMs?
→ Select "Local Model (Ollama)" and choose different models from the dropdown

## Next Steps

1. **Document Findings:** Export PDF reports for your security team
2. **Refine System Prompts:** Test different prompts to improve robustness
3. **Automate Testing:** Schedule weekly test runs to track improvements
4. **Share Results:** Use ADVANCED_TESTS.md to explain findings to stakeholders

## Support Resources

- OWASP: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- Gemini API: https://ai.google.dev/
- Ollama: https://ollama.ai/

---

**Build Status:** ✅ All 20 tests functional | ✅ Secure credential handling | ✅ Both test modes working
