import fs from 'fs';
import OpenAI from 'openai';
import { STTProvider } from './types.js';
import { MockService } from './mockService.js';

export class WhisperSTTProvider implements STTProvider {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async transcribe(audioFilePath: string, language?: string): Promise<string> {
    // If no OpenAI API key is set, fall back to mock
    if (!this.openai || !process.env.OPENAI_API_KEY?.trim()) {
      console.log('ℹ️ [STT] No OpenAI API Key found; using mock speech-to-text transcription.');
      return MockService.mockTranscription(language);
    }

    try {
      console.log(`🎙️ [STT] Transcribing audio with Whisper API (${audioFilePath})...`);
      const fileStream = fs.createReadStream(audioFilePath);
      
      const response = await this.openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        language: language ? this.mapLanguageCode(language) : undefined,
      });

      console.log(` [STT] Whisper transcription result: "${response.text}"`);
      return response.text.trim();
    } catch (error: any) {
      console.error('⚠️ [STT] Whisper API error:', error?.message || error);
      console.log('ℹ️ [STT] Falling back to realistic mock transcription.');
      return MockService.mockTranscription(language);
    }
  }

  private mapLanguageCode(language: string): string | undefined {
    const map: { [key: string]: string } = {
      spanish: 'es',
      french: 'fr',
      german: 'de',
      italian: 'it',
      japanese: 'ja',
      mandarin: 'zh',
      chinese: 'zh',
      english: 'en',
      portuguese: 'pt',
      russian: 'ru',
    };
    return map[language.toLowerCase()];
  }
}

export const sttService = new WhisperSTTProvider();
