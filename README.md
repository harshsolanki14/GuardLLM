## Features

- **20 Security Tests:** Updated OWASP LLM Top 10 + 10 advanced adversarial attack scenarios
- **Dual Testing Modes:** Basic attacks for quick assessment, Advanced mode for deep security validation
- **Multiple LLM Support:** Test Gemini, every model installed in Ollama, or any OpenAI-compatible API
- **Comprehensive Reporting:** PDF export with detailed vulnerability analysis
- **Advanced Attack Coverage:** Cross-lingual evasion, obfuscation, context exhaustion, persona hijacking, and more

See [ADVANCED_TESTS.md](ADVANCED_TESTS.md) for detailed documentation on all 20 tests.

## Run Locally

**Prerequisites:**  Node.js

### Quick Start - Choose Your Provider

#### Option A: Gemini API (Recommended)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikeys)
3. Create `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Run:
   ```bash
   npm run dev:vite
   ```
5. In UI: Select **"Gemini API"** provider

#### Option B: Ollama (all installed models)
1. Install [Ollama](https://ollama.ai)
2. Start Ollama:
   ```bash
   ollama serve
   ```
3. Pull a model (in another terminal):
   ```bash
   ollama pull tinyllama    # Recommended for testing
   ```
4. Install & run app:
   ```bash
   npm install
   npm run dev
   ```
5. In the UI, select **"Local Model (Ollama)"**. GuardLLM queries Ollama's `/api/tags` endpoint and lists every model installed on that server. You can also type a model tag manually.

#### Option C: Any OpenAI-compatible LLM API
1. Select **"Custom OpenAI-Compatible API"** in the UI.
2. Paste the provider's chat-completions URL, model name, and API key.
3. The key is held in browser memory only, sent as a Bearer token, and never saved or uploaded.

The custom option supports providers that implement `POST /v1/chat/completions` with `messages`, `model`, and `stream: false`. Your provider must allow browser CORS requests.

`npm run dev` now starts both Ollama and Vite together.

**📖 See [LLM_SETUP_GUIDE.md](LLM_SETUP_GUIDE.md) for detailed setup instructions for all providers.**

---

### Environment Setup
- Copy [.env.local.example](.env.local.example) to `.env.local`
- Add `VITE_GEMINI_API_KEY=your_key` for Gemini API
- **⚠️ Never commit `.env.local` to version control**
- Ollama model discovery and custom API requests require the server/provider to allow browser CORS requests.
