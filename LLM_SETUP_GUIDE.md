# GuardLLM - LLM Provider Setup Guide

This guide explains how to configure **Gemini API**, every installed **Ollama** model, and any **OpenAI-compatible API** for security testing.

---

## Option 1: Gemini API (Recommended for Advanced Testing)

### Setup Steps:

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
   - Create a new API key
   - Copy the key

2. **Configure Environment Variable**
   - Create a `.env.local` file in the project root:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with your actual API key
   - Restart the development server

3. **Use in UI**
   - In the app, select **"Gemini API"** under "LLM Provider"
   - Configure your System Prompt
   - Choose Attack Strategy (Basic or Advanced)
   - Click "Run Tests"

### Models Used:
- **gemini-2.5-flash**: Attack prompt generation & target simulation
- **gemini-2.5-pro**: Response analysis & vulnerability assessment

### Cost:
- Gemini API has free tier with limitations
- Check [Google Pricing](https://ai.google.dev/pricing) for details

---

## Option 2: Ollama - Local LLM Testing

### Setup Steps:

1. **Install Ollama**
   - Download from [ollama.ai](https://ollama.ai)
   - Follow platform-specific installation

2. **Start Ollama Server**
   - Run: `ollama serve`
   - Server will start on `http://localhost:11434`

3. **Pull Your Preferred Model**
   - Run: `ollama pull llama3.1:8b`
   - Or try lighter models:
     ```bash
     ollama pull tinyllama        # 1.1B - Highly vulnerable (best for testing)
     ollama pull gemma:2b         # 2B - Moderate security
     ollama pull llama3.2:1b      # 1B - Lightweight
     ollama pull phi3             # 3.8B - Efficient
     ```

4. **Verify Server Running**
   - Test: `curl http://localhost:11434/api/tags`
   - Should return list of available models

5. **Use in UI**
   - Select **"Local Model (Ollama)"** under "LLM Provider"
   - **Ollama Server URL**: `http://localhost:11434` (default)
   - **Installed Model**: GuardLLM discovers every model from Ollama's `/api/tags` endpoint. Select one or type a model tag manually.
   - Configure System Prompt
   - Click "Run Tests"

### Recommended Models for Testing:

| Model | Size | Security | Best For |
|-------|------|----------|----------|
| **TinyLlama** | 1.1B | ⚠️ High Vulnerability | Finding easy exploits |
| **Llama 3.2 1B** | 1B | ⚠️ High Vulnerability | Testing attack coverage |
| **Gemma 2B** | 2B | ⚠️ Moderate | Balanced testing |
| **Llama 3.1 8B** | 8B | ✅ Good | Production-like testing |

---

## Option 3: Custom OpenAI-Compatible API

Use this option for hosted inference services or self-hosted gateways that implement the OpenAI chat-completions format.

1. Select **"Custom OpenAI-Compatible API"**.
2. Enter the complete chat-completions URL, for example `https://api.example.com/v1/chat/completions`.
3. Enter the provider's model name and paste its API key.
4. The key stays in browser memory only and is sent as a Bearer authorization header. It is never written to `.env.local`, logged, or uploaded.

The provider must accept `POST` requests containing `model`, `messages`, and `stream: false`, return `choices[0].message.content`, and allow browser CORS requests.

## Comparison: Gemini vs Ollama vs Custom API

| Feature | Gemini API | Ollama Local |
|---------|-----------|--------------|
| **Setup Time** | 5 minutes | 15-30 minutes |
| **Cost** | Free tier + paid | Free (local compute) |
| **Privacy** | Data sent to Google | Local only |
| **Speed** | API dependent | Fast (local) |
| **Model Control** | Limited (Google's models) | Full (any GGUF model) |
| **Internet Required** | Yes | No |
| **Best For** | Production testing | Development & research |

---

## Troubleshooting

### Gemini API Issues
- **"API key not configured"**: Make sure `.env.local` has `VITE_GEMINI_API_KEY`
- **"Quota Exceeded"**: Switch to Ollama or upgrade to paid API
- **Connection Error**: Check internet connection

### Ollama Issues
- **"Connection refused"**: Make sure `ollama serve` is running
- **"Model not found"**: Run `ollama pull <model-name>`
- **Port conflict**: Ollama defaults to port 11434. Change with: `ollama serve --address="127.0.0.1:3000"`
- **Slow responses**: Try smaller model (TinyLlama instead of Llama 3.1 8B)

### To verify Ollama endpoint:
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "tinyllama", "prompt": "hello"}'
```

---

## Quick Start Script

Save as `setup-ollama.sh` and run:

```bash
#!/bin/bash

echo "🚀 Starting Ollama..."
ollama serve &
sleep 3

echo "📦 Pulling TinyLlama (recommended for testing)..."
ollama pull tinyllama

echo "✅ Setup complete!"
echo "Access at: http://localhost:11434"
echo "Use in GuardLLM: Select 'Local Model (Ollama)' provider"
```

---

## Environment Variables Reference

### .env.local
```
# For Gemini API
VITE_GEMINI_API_KEY=your_api_key_here

# For Ollama (optional - defaults work fine)
VITE_OLLAMA_ENDPOINT=http://localhost:11434/v1/chat/completions
VITE_OLLAMA_MODEL=tinyllama
```

---

## Running Tests

### With Gemini:
1. Select "Gemini API" provider
2. Enter system prompt
3. Select tests
4. Click "Run Tests"
5. ✅ Gemini will generate attacks and analyze responses

### With Ollama:
1. Select "Local Model (Ollama)" provider
2. Enter Ollama endpoint (default: `http://localhost:11434/v1/chat/completions`)
3. Select model from dropdown
4. Enter system prompt
5. Select tests
6. Click "Run Tests"
7. ✅ Local model will be tested against attacks

---

## Performance Tips

- **Ollama on older hardware**: Use 1B models (TinyLlama, Llama 3.2 1B)
- **Ollama on modern hardware**: Can handle 7B-13B models comfortably
- **Batch testing**: 10 OWASP tests typically take 2-5 minutes per provider

---

Need help? Check the [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)
