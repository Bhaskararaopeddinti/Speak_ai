import OpenAI from 'openai';
import { LLMProvider, LLMAnalysisResult } from './types.js';
import { MockService } from './mockService.js';

export class OpenAILLMProvider implements LLMProvider {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async analyze(transcription: string, targetLanguage: string): Promise<LLMAnalysisResult> {
    if (!this.openai || !process.env.OPENAI_API_KEY?.trim()) {
      console.log('ℹ️ [LLM] No OpenAI API Key found; using mock linguistic analyzer.');
      return MockService.analyzeSentence(transcription, targetLanguage);
    }

    try {
      console.log(`🤖 [LLM] Analyzing sentence in ${targetLanguage} with GPT-4o-mini: "${transcription}"`);

      const systemPrompt = `
You are an expert AI Language Tutor for ${targetLanguage}.
A language learner spoke the following sentence in ${targetLanguage}:
"${transcription}"

Carefully analyze the sentence for:
1. Grammar correctness and tense agreement
2. Vocabulary precision and word choice
3. Naturalness and native-sounding fluency

You MUST respond strictly with a valid JSON object adhering to this EXACT schema:
{
  "grammar_score": <number between 0 and 100>,
  "vocabulary_score": <number between 0 and 100>,
  "naturalness_score": <number between 0 and 100>,
  "mistakes": [
    {
      "type": "<e.g. Grammar, Vocabulary, Word Choice, Verb Tense, Preposition, Article>",
      "original": "<the exact flawed snippet or phrase>",
      "correction": "<the corrected version>",
      "explanation": "<clear, constructive explanation of why this was incorrect and how to fix it>"
    }
  ],
  "feedback": "<concise constructive overall feedback for the learner>",
  "corrected_sentence": "<the grammatically sound version of the sentence>",
  "natural_sentence": "<how a native speaker would most naturally and colloquially phrase this>"
}

If the sentence is completely correct with no mistakes, keep the "mistakes" array empty and provide high scores (90-100) with encouraging feedback.
Do NOT include markdown formatting, backticks, or other text outside the JSON.
`.trim();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this sentence: "${transcription}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI LLM');
      }

      const parsed: LLMAnalysisResult = JSON.parse(content);
      console.log(' [LLM] Linguistic analysis complete.');
      return parsed;
    } catch (error: any) {
      console.error('⚠️ [LLM] Error calling OpenAI LLM:', error?.message || error);
      console.log('ℹ️ [LLM] Falling back to intelligent mock analyzer.');
      return MockService.analyzeSentence(transcription, targetLanguage);
    }
  }
}

export const llmService = new OpenAILLMProvider();
