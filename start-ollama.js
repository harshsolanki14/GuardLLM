import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function startOllama() {
  console.log('🚀 Starting Ollama server with CORS enabled...');
  
  const ollamaPath = process.env.LOCALAPPDATA + '\\Programs\\Ollama\\ollama.exe';
  
  try {
    // Check if Ollama is already running
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        console.log('✅ Ollama is already running');
        console.log('🔗 Ollama API: http://localhost:11434');
        console.log('');
        // Keep the process alive to work with concurrently
        await new Promise(() => {}); // Never resolves, keeps running
        return;
      }
    } catch (error) {
      // Ollama is not running, continue to start it
    }
    
    // Kill any existing Ollama processes first
    try {
      await execAsync('taskkill /F /IM ollama.exe 2>nul');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      // Ignore errors if process doesn't exist
    }
    
    // Set CORS and GPU environment variables
    process.env.OLLAMA_ORIGINS = '*';
    process.env.OLLAMA_GPU_LAYERS = '99';
    process.env.OLLAMA_LLM_LIBRARY = 'cuda_v13';
    process.env.CUDA_VISIBLE_DEVICES = '0';
    
    console.log('🔧 Starting Ollama with GPU acceleration...');
    console.log('🎮 GPU: NVIDIA GeForce RTX 5070 Ti (11.9 GiB VRAM)');
    console.log('⚡ CUDA v13 enabled for GPU acceleration');
    console.log('🌐 CORS enabled (OLLAMA_ORIGINS=*)');
    
    // Start Ollama server with GPU configuration
    const ollama = spawn(ollamaPath, ['serve'], {
      env: {
        ...process.env,
        OLLAMA_ORIGINS: '*',
        OLLAMA_GPU_LAYERS: '99',
        OLLAMA_LLM_LIBRARY: 'cuda_v13',
        CUDA_VISIBLE_DEVICES: '0'
      },
      stdio: 'inherit',
      shell: false
    });
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify it's running
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        console.log('✅ Ollama server started successfully');
        console.log('🔗 Ollama API: http://localhost:11434');
        console.log('🎮 GPU: RTX 5070 Ti with 11.9 GiB VRAM');
        console.log('⚡ CUDA v13: ENABLED');
        console.log('🌐 CORS: ENABLED for browser access');
        console.log('');
      }
    } catch (error) {
      console.error('⚠️  Ollama started but API check failed:', error.message);
    }
    
    ollama.on('error', (error) => {
      console.error('❌ Error starting Ollama:', error.message);
      process.exit(1);
    });
    
    ollama.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`❌ Ollama exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping Ollama...');
      ollama.kill();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      ollama.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start Ollama:', error.message);
    console.error('💡 Make sure Ollama is installed: https://ollama.com/download');
    process.exit(1);
  }
}

startOllama();
