import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DifficultyLevel } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Handle both data URL and raw base64 if necessary, though FileReader.readAsDataURL returns data URL
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const WRITING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Score from 0 to 10" },
    cefrLevel: { type: Type.STRING, description: "CEFR Level (e.g., A1, B2, C1)" },
    flagForReview: { type: Type.BOOLEAN, description: "Set to true if text is ambiguous, too short, or AI is uncertain" },
    generalFeedback: { type: Type.STRING, description: "Encouraging feedback for the learner" },
    improvedVersion: { type: Type.STRING, description: "A rewritten native-like version of the input" },
    criteriaScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criteria: { type: Type.STRING, description: "RSA/IELTS criteria: Grammar, Vocabulary, Coherence, Task Achievement" },
          score: { type: Type.NUMBER },
          maxScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        }
      }
    },
    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          correction: { type: Type.STRING },
          explanation: { type: Type.STRING }
        }
      }
    }
  }
};

const SPEAKING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Score from 0 to 10" },
    cefrLevel: { type: Type.STRING, description: "CEFR Level (e.g., A1, B2, C1)" },
    transcription: { type: Type.STRING, description: "The transcribed text from audio" },
    audioQualityWarning: { type: Type.STRING, description: "Warning message if audio is noisy/unclear, else null", nullable: true },
    flagForReview: { type: Type.BOOLEAN, description: "Set to true if audio is unintelligible or AI is uncertain" },
    generalFeedback: { type: Type.STRING, description: "Feedback on accent, intonation, and clarity" },
    pronunciationErrors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of words that were mispronounced"
    },
    criteriaScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criteria: { type: Type.STRING, description: "RSA criteria: Pronunciation, Fluency, Grammar/Accuracy, Vocabulary/Range" },
          score: { type: Type.NUMBER },
          maxScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        }
      }
    }
  }
};

export const assessWriting = async (text: string, level: DifficultyLevel) => {
  if (!text) throw new Error("Text is required");

  const prompt = `
    Act as an expert IELTS and English tutor for Vietnamese learners. 
    Target Level: ${level}.
    Analyze the following text. 
    1. Provide an overall score (0-10) and an estimated CEFR Level (A1-C2).
    2. Score based on RSA/IELTS criteria: Grammar Range & Accuracy, Vocabulary Resource, Coherence & Cohesion, and Task Response.
    3. Identify specific Vietnamese common errors (e.g., article misuse, verb tense consistency).
    4. Provide a rewritten 'Native Speaker' version.
    5. If the text is nonsensical, too short to judge, or you are unsure, set 'flagForReview' to true.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: prompt }, { text: `Student Text: "${text}"` }] }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: WRITING_SCHEMA,
      temperature: 0.4
    }
  });

  return JSON.parse(response.text || '{}');
};

export const assessSpeaking = async (audioBase64: string, mimeType: string, level: DifficultyLevel) => {
  const prompt = `
    Act as an expert pronunciation coach for Vietnamese learners of English.
    Target Level: ${level}.
    Listen to the audio.
    1. Assess audio quality. If it is too noisy, quiet, or unclear, provide a warning in 'audioQualityWarning'.
    2. Transcribe accurately.
    3. Grade based on RSA/Standard Speaking Rubric criteria: 
       - Pronunciation (Intonation, Stress, Phonics)
       - Fluency & Coherence
       - Grammar & Accuracy
       - Vocabulary & Range
    4. Estimate the CEFR Level (A1-C2).
    5. Check for Vietnamese specific issues: dropped ending sounds (s, t, k, ed), short/long vowel confusion, flat intonation.
    6. If the audio is unintelligible or you are uncertain, set 'flagForReview' to true.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: SPEAKING_SCHEMA,
      temperature: 0.4
    }
  });

  return JSON.parse(response.text || '{}');
};

export const createTutorChat = (systemInstruction: string) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    }
  });
};