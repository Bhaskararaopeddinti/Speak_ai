import OpenAI from 'openai';
import { TTSProvider } from './types.js';
import { MockService } from './mockService.js';

export class OpenAITTSProvider implements TTSProvider {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async synthesize(text: string, voice: string = 'alloy', _language?: string): Promise<Buffer> {
    if (!this.openai || !process.env.OPENAI_API_KEY?.trim()) {
      console.log('ℹ️ [TTS] No OpenAI API Key found; using synthetic audio buffer fallback.');
      return MockService.generateFallbackAudioBuffer();
    }

    try {
      console.log(`🔊 [TTS] Synthesizing speech with OpenAI TTS-1 (voice: ${voice}): "${text.slice(0, 50)}..."`);
      
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: (voice as any) || 'alloy',
        input: text,
        speed: 1.0,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      console.log(` [TTS] Speech synthesized (${buffer.length} bytes).`);
      return buffer;
    } catch (error: any) {
      console.error('⚠️ [TTS] OpenAI TTS error:', error?.message || error);
      console.log('ℹ️ [TTS] Falling back to synthetic audio buffer.');
      return MockService.generateFallbackAudioBuffer();
    }
  }
}

export const ttsService = new OpenAITTSProvider();
