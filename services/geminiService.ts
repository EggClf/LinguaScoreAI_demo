
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DifficultyLevel } from "../types";

// Fix: Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const CRITERIA_SCORE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    criteria: { type: Type.STRING },
    score: { type: Type.NUMBER },
    maxScore: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    confidence: { type: Type.STRING, description: "Low, Medium, or High" },
    keyFactors: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "2-3 short strings explaining the specific technical factors behind this score component"
    }
  }
};

const REFERENCE_ANSWER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    band: { type: Type.STRING, description: "e.g. 6.0, 7.0, 8.0" },
    content: { type: Type.STRING, description: "A reference sample answer at this band level for the same context" },
    rationale: { type: Type.STRING, description: "Why this content qualifies for this specific band" }
  }
};

const WRITING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    cefrLevel: { type: Type.STRING },
    flagForReview: { type: Type.BOOLEAN },
    generalFeedback: { type: Type.STRING },
    improvedVersion: { type: Type.STRING },
    criteriaScores: {
      type: Type.ARRAY,
      items: CRITERIA_SCORE_SCHEMA
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
    },
    recommendedLessons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          rationale: { type: Type.STRING }
        }
      }
    },
    learningPath: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    referenceAnswers: {
      type: Type.ARRAY,
      items: REFERENCE_ANSWER_SCHEMA,
      description: "Provide high-quality reference examples for Band 6, 7, and 8 based on the student's topic."
    }
  }
};

const SPEAKING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    cefrLevel: { type: Type.STRING },
    transcription: { type: Type.STRING },
    audioQualityWarning: { type: Type.STRING, nullable: true },
    flagForReview: { type: Type.BOOLEAN },
    generalFeedback: { type: Type.STRING },
    pronunciationErrors: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    criteriaScores: {
      type: Type.ARRAY,
      items: CRITERIA_SCORE_SCHEMA
    },
    recommendedLessons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          rationale: { type: Type.STRING }
        }
      }
    },
    learningPath: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    referenceAnswers: {
      type: Type.ARRAY,
      items: REFERENCE_ANSWER_SCHEMA,
      description: "Provide high-quality reference transcriptions for Band 6, 7, and 8 based on the student's topic."
    }
  }
};

export const assessWriting = async (text: string, level: DifficultyLevel) => {
  const prompt = `
    Act as an expert IELTS and English tutor. Target Level: ${level}.
    Analyze the text provided. 
    1. Score components (Grammar, Vocabulary, Coherence, Task Response) with confidence levels.
    2. Provide key factors for each score.
    3. Generate 3 reference answers (Band 6, 7, 8) relevant to the user's topic to show them what 'better' looks like.
    4. Provide grammar corrections and a native version.
  `;

  // Fix: Call generateContent directly on ai.models and use the .text property to get the string result.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: prompt }, { text: `Student Text: "${text}"` }] }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: WRITING_SCHEMA,
      temperature: 0.3
    }
  });

  return JSON.parse(response.text || '{}');
};

export const assessSpeaking = async (audioBase64: string, mimeType: string, level: DifficultyLevel) => {
  const prompt = `
    Act as an expert pronunciation and speaking coach. Target Level: ${level}.
    Listen to the audio.
    1. Assess with confidence levels for Pronunciation, Fluency, Grammar, and Vocabulary.
    2. Provide key factors for why each score was assigned (e.g. "dropped s", "flat intonation", "hesitation markers").
    3. Provide 3 reference transcripts (Band 6, 7, 8) for this topic.
    4. Identify specific pronunciation errors.
  `;

  // Fix: Call generateContent directly on ai.models and use the .text property to get the string result.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
      temperature: 0.3
    }
  });

  return JSON.parse(response.text || '{}');
};

export const createTutorChat = (systemInstruction: string) => {
  // Fix: Chat creation using ai.chats.create for complex text tasks.
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    }
  });
};
