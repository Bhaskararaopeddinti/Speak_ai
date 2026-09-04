import { LLMAnalysisResult } from './types.js';

export class MockService {
  /**
   * Generates realistic transcription if Whisper API key is absent
   */
  static mockTranscription(targetLanguage: string = 'Spanish'): string {
    const samples: { [key: string]: string[] } = {
      Spanish: [
        'Yo querer ir al supermercado ayer pero no tuve tiempo.',
        'Ayer yo he fue a la tienda comprar manzanas.',
        'Me gusta mucho los libros de historia y yo lee cada noche.',
        'Por favor, puede usted decirme donde esta la estacion de tren?'
      ],
      French: [
        'Hier je suis allé au magasin pour acheter du pain.',
        'Je voudrais parler avec le professeur demain matin.',
        'Moi aimer beaucoup visiter Paris en automne.',
        'Est-ce que vous pouvez m\'aider avec mes devoirs?'
      ],
      German: [
        'Gestern ich habe gegangen zu dem Supermarkt.',
        'Ich möchte ein kaltes Bier trinken bitte.',
        'Weil das Wetter schön ist, ich gehe spazieren.',
        'Können Sie mir bitte den Weg zum Bahnhof erklären?'
      ],
      Italian: [
        'Ieri ho andato al mercato con i miei amici.',
        'Vorrei ordinare una pizza margherita e un caffe.',
        'Questa citta e molto bella specialmente la notte.'
      ],
      Japanese: [
        '昨日、私はスーパーに行きました。',
        '日本語を勉強するのがとても楽しいです。',
        '明日の天気はどうですか。'
      ],
      English: [
        'I have went to the store yesterday.',
        'She don\'t know the answer to this question.',
        'I am looking forward to meet you next week.',
        'He suggested me to read that book.'
      ]
    };

    const list = samples[targetLanguage] || samples['English'];
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Generates intelligent, structured linguistic analysis
   */
  static analyzeSentence(transcription: string, targetLanguage: string): LLMAnalysisResult {
    const textLower = transcription.toLowerCase().trim();

    // Check English specific common mistake patterns
    if (textLower.includes('have went')) {
      return {
        grammar_score: 75,
        vocabulary_score: 88,
        naturalness_score: 80,
        mistakes: [
          {
            type: 'Past Tense',
            original: 'have went',
            correction: 'went',
            explanation: '"have went" is incorrect. When specifying a finished past time ("yesterday"), use the simple past tense "went" instead of the present perfect.'
          }
        ],
        feedback: 'Great sentence! Your message is completely clear. The main adjustment needed is using the simple past "went" instead of "have went" for events completed at a specified past time.',
        corrected_sentence: transcription.replace(/have went/i, 'went'),
        natural_sentence: 'I went to the store yesterday.'
      };
    }

    if (textLower.includes("she don't") || textLower.includes("he don't")) {
      const match = textLower.includes("she don't") ? "she don't" : "he don't";
      const correction = match.startsWith("she") ? "she doesn't" : "he doesn't";
      return {
        grammar_score: 78,
        vocabulary_score: 90,
        naturalness_score: 82,
        mistakes: [
          {
            type: 'Subject-Verb Agreement',
            original: match,
            correction: correction,
            explanation: 'Third-person singular subjects (he/she/it) require "does not / doesn\'t" instead of "don\'t".'
          }
        ],
        feedback: 'Nice attempt! Remember that third-person singular subjects take "doesn\'t" in the present tense.',
        corrected_sentence: transcription.replace(new RegExp(match, 'i'), correction),
        natural_sentence: transcription.replace(new RegExp(match, 'i'), correction)
      };
    }

    if (textLower.includes('forward to meet')) {
      return {
        grammar_score: 80,
        vocabulary_score: 92,
        naturalness_score: 85,
        mistakes: [
          {
            type: 'Prepositions & Gerunds',
            original: 'forward to meet',
            correction: 'forward to meeting',
            explanation: 'The phrase "look forward to" is followed by a gerund (-ing form), not an infinitive verb.'
          }
        ],
        feedback: 'Very natural phrasing! Just remember that "look forward to" requires the gerund form "meeting".',
        corrected_sentence: transcription.replace(/forward to meet/i, 'forward to meeting'),
        natural_sentence: 'I am really looking forward to meeting you next week!'
      };
    }

    // Spanish common patterns
    if (targetLanguage.toLowerCase() === 'spanish') {
      if (textLower.includes('yo querer')) {
        return {
          grammar_score: 70,
          vocabulary_score: 85,
          naturalness_score: 75,
          mistakes: [
            {
              type: 'Verb Conjugation',
              original: 'yo querer',
              correction: 'yo quería / quise',
              explanation: 'The infinitive "querer" must be conjugated in the past tense to match "ayer" (yesterday).'
            }
          ],
          feedback: '¡Buen intento! Conjugating verbs into the preterite or imperfect tense gives your sentence native fluency.',
          corrected_sentence: 'Yo quise ir al supermercado ayer pero no tuve tiempo.',
          natural_sentence: 'Ayer quise ir al supermercado, pero no tuve tiempo.'
        };
      }
      if (textLower.includes('he fue')) {
        return {
          grammar_score: 72,
          vocabulary_score: 86,
          naturalness_score: 78,
          mistakes: [
            {
              type: 'Compound Tense',
              original: 'he fue',
              correction: 'fui / he ido',
              explanation: 'In Spanish, you can use the preterite "fui" with "ayer", or the past participle "ido" with "he".'
            }
          ],
          feedback: 'Gran trabajo comunicando la idea. En español, usa el pretérito indefinido "fui" cuando indiques "ayer".',
          corrected_sentence: 'Ayer fui a la tienda a comprar manzanas.',
          natural_sentence: 'Ayer fui a la tienda a comprar unas manzanas.'
        };
      }
    }

    // French common patterns
    if (targetLanguage.toLowerCase() === 'french' && textLower.includes('moi aimer')) {
      return {
        grammar_score: 68,
        vocabulary_score: 84,
        naturalness_score: 72,
        mistakes: [
          {
            type: 'Pronouns & Conjugation',
            original: 'Moi aimer',
            correction: "J'aime",
            explanation: 'Subject pronoun is "Je" and "aimer" should be conjugated as "aime".'
          }
        ],
        feedback: 'Bon travail! Pensez à conjuguer le verbe avec le pronom sujet "J\'aime".',
        corrected_sentence: "J'aime beaucoup visiter Paris en automne.",
        natural_sentence: "J'adore visiter Paris en automne."
      };
    }

    // German common patterns
    if (targetLanguage.toLowerCase() === 'german' && textLower.includes('habe gegangen')) {
      return {
        grammar_score: 72,
        vocabulary_score: 85,
        naturalness_score: 74,
        mistakes: [
          {
            type: 'Auxiliary Verb',
            original: 'habe gegangen',
            correction: 'bin gegangen',
            explanation: 'Movement verbs in German take "sein" as their auxiliary verb in Perfekt ("bin gegangen").'
          }
        ],
        feedback: 'Sehr gut! Beachte, dass Verben der Ortsveränderung wie "gehen" das Hilfsverb "sein" verlangen.',
        corrected_sentence: 'Gestern bin ich in den Supermarkt gegangen.',
        natural_sentence: 'Gestern bin ich zum Supermarkt gegangen.'
      };
    }

    // Default intelligent analysis
    const hasPunctuation = /[.!?]$/.test(transcription);
    const cleaned = transcription.trim();
    const finalPunctuation = hasPunctuation ? cleaned : cleaned + '.';

    return {
      grammar_score: 92,
      vocabulary_score: 90,
      naturalness_score: 88,
      mistakes: [
        {
          type: 'Nuance & Style',
          original: cleaned.split(' ').slice(0, 2).join(' '),
          correction: cleaned.split(' ').slice(0, 2).join(' '),
          explanation: 'Accurate syntax! Adding conversational discourse markers can make this sound even more native.'
        }
      ],
      feedback: 'Excellent pronunciation and phrasing! Your sentence is grammatically sound and easy to understand.',
      corrected_sentence: finalPunctuation,
      natural_sentence: finalPunctuation
    };
  }

  /**
   * Generates a lightweight synthetic audio WAV buffer
   * (A valid 1.5-second tone waveform with proper RIFF header so browsers can play it natively)
   */
  static generateFallbackAudioBuffer(): Buffer {
    const sampleRate = 22050;
    const duration = 1.2;
    const numSamples = Math.floor(sampleRate * duration);
    const blockAlign = 2; // 16-bit mono
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF chunk descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // fmt sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
    buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
    buffer.writeUInt16LE(1, 22);  // num channels (1 = mono)
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(16, 34); // bits per sample

    // data sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Gentle musical chime synthesis
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 440 + Math.sin(t * 8) * 40; // subtle sweep
      const envelope = Math.exp(-t * 2.5); // decay
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.35 * 32767;
      buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
    }

    return buffer;
  }
}
