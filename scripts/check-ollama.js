import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkOllama() {
  console.log('🔍 Checking Ollama installation...');
  
  try {
    // Check if Ollama is installed
    const ollamaPath = process.env.LOCALAPPDATA + '\\Programs\\Ollama\\ollama.exe';
    const { stdout } = await execAsync(`powershell -Command "Test-Path '${ollamaPath}'"`);
    
    if (stdout.trim() === 'False') {
      console.error('❌ Ollama is not installed!');
      console.error('Please install Ollama from: https://ollama.com/download');
      process.exit(1);
    }
    
    console.log('✅ Ollama is installed');
    
    // Check if required models are available
    console.log('🔍 Checking for required models...');
    try {
      const { stdout: models } = await execAsync(`powershell -Command "$env:Path += ';${process.env.LOCALAPPDATA}\\Programs\\Ollama'; ollama list"`);
      
      const hasModels = models.includes('tinyllama')
        || models.includes('gemma')
        || models.includes('llama')
        || models.includes('gemma4')
        || models.includes('gemma:4')
        || models.includes('phi3')
        || models.includes('phi-3')
        || models.includes('phi-3-mini');
      
      if (!hasModels) {
        console.warn('⚠️  No models found. You can pull models using:');
        console.warn('   ollama pull tinyllama');
        console.warn('   ollama pull gemma:2b');
        console.warn('   ollama pull gemma:4  # if you have Gemma 4 available');
        console.warn('   ollama pull gemma4   # alternate tag names');
        console.warn('   ollama pull llama3.1:8b');
        console.warn('   ollama pull phi-3-mini  # Phi-3 mini alias');
      } else {
        console.log('✅ Models are available');
      }
    } catch (error) {
      console.warn('⚠️  Could not check models (Ollama might not be running yet)');
    }
    
    console.log('✅ Pre-flight checks complete\n');
  } catch (error) {
    console.error('❌ Error checking Ollama:', error.message);
    process.exit(1);
  }
}

checkOllama();
