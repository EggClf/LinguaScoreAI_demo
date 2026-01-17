import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TestType, TargetLevel } from "../types";
import rubricData from "./rubric.json";

// Fix: Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
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
      description:
        "2-3 short strings explaining the specific technical factors behind this score component",
    },
  },
};

const REFERENCE_ANSWER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    band: { type: Type.STRING, description: "e.g. 6.0, 7.0, 8.0" },
    content: {
      type: Type.STRING,
      description:
        "A reference sample answer at this band level for the same context",
    },
    rationale: {
      type: Type.STRING,
      description: "Why this content qualifies for this specific band",
    },
  },
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
      items: CRITERIA_SCORE_SCHEMA,
    },
    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          correction: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
      },
    },
    recommendedLessons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
      },
    },
    learningPath: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    referenceAnswers: {
      type: Type.ARRAY,
      items: REFERENCE_ANSWER_SCHEMA,
      description:
        "Provide high-quality reference examples for Band 6, 7, and 8 based on the student's topic.",
    },
  },
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
      items: { type: Type.STRING },
    },
    criteriaScores: {
      type: Type.ARRAY,
      items: CRITERIA_SCORE_SCHEMA,
    },
    recommendedLessons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
      },
    },
    learningPath: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    referenceAnswers: {
      type: Type.ARRAY,
      items: REFERENCE_ANSWER_SCHEMA,
      description:
        "Provide high-quality reference transcriptions for Band 6, 7, and 8 based on the student's topic.",
    },
  },
};

export const assessWriting = async (
  text: string,
  testType: TestType,
  targetLevel: TargetLevel
) => {
  // Select appropriate rubric based on test type
  const rubric =
    testType === TestType.IELTS
      ? rubricData.IELTS.WritingTask2
      : rubricData.TOEIC.Writing;

  let prompt = "";

  if (testType === TestType.IELTS) {
    prompt = `
    Act as an expert IELTS Writing examiner. Target Level: ${targetLevel}.
    
    You must evaluate the student's writing using the official IELTS Writing Task 2 Band Descriptors:
    
    TASK RESPONSE (Band 0-9):
    ${Object.entries(rubric["TaskResponse"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    COHERENCE AND COHESION (Band 0-9):
    ${Object.entries(rubric["CoherenceCohesion"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    LEXICAL RESOURCE (Band 0-9):
    ${Object.entries(rubric["LexicalResource"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    GRAMMATICAL RANGE AND ACCURACY (Band 0-9):
    ${Object.entries(rubric["GrammaticalRange"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    Instructions:
    1. Carefully assess each criterion against the band descriptors above.
    2. Assign a band score (0-9) for each criterion with confidence level (Low/Medium/High).
    3. Provide 2-3 specific key factors explaining why this band was assigned (reference specific rubric indicators).
    4. Calculate overall band score (average of the 4 criteria, rounded to nearest 0.5).
    5. Map to CEFR level (A1-C2).
    6. Identify specific errors and provide corrections with explanations.
    7. Generate an improved native-speaker version.
    8. Provide 3 reference answers at Band 6, 7, and 8 levels for the same topic.
    9. Recommend specific lessons based on weaknesses identified.
    10. Flag for review if scores are inconsistent or text is suspicious.
  `;
  } else {
    prompt = `
    Act as an expert TOEIC Writing examiner. Target Level: ${targetLevel}.
    
    You must evaluate the student's writing using the official TOEIC Writing Level Descriptors:
    
    ${Object.entries(rubric)
      .map(([level, desc]) => `${level}: ${desc}`)
      .join("\n\n")}
    
    Instructions:
    1. Carefully assess the writing against the level descriptors above.
    2. Assign a level (1-9) with corresponding score range.
    3. Provide confidence level (Low/Medium/High) for the assessment.
    4. Provide 2-3 specific key factors explaining why this level was assigned (reference specific rubric indicators).
    5. Map to CEFR level (A1-C2).
    6. Identify specific errors and provide corrections with explanations.
    7. Generate an improved native-speaker version.
    8. Provide 3 reference answers at different levels for the same topic.
    9. Recommend specific lessons based on weaknesses identified.
    10. Flag for review if the assessment is uncertain or text is suspicious.
  `;
  }

  // Fix: Call generateContent directly on ai.models and use the .text property to get the string result.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { text: `Student Text: "${text}"` }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: WRITING_SCHEMA,
      temperature: 0.3,
    },
  });

  return JSON.parse(response.text || "{}");
};

export const assessSpeaking = async (
  audioBase64: string,
  mimeType: string,
  testType: TestType,
  targetLevel: TargetLevel
) => {
  // Select appropriate rubric based on test type
  const rubric =
    testType === TestType.IELTS
      ? rubricData.IELTS.Speaking
      : rubricData.TOEIC.Speaking;

  let prompt = "";

  if (testType === TestType.IELTS) {
    prompt = `
    Act as an expert IELTS Speaking examiner. Target Level: ${targetLevel}.
    
    You must evaluate the student's speaking using the official IELTS Speaking Band Descriptors:
    
    FLUENCY AND COHERENCE (Band 0-9):
    ${Object.entries(rubric["FluencyCoherence"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    LEXICAL RESOURCE (Band 0-9):
    ${Object.entries(rubric["LexicalResource"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    GRAMMATICAL RANGE AND ACCURACY (Band 0-9):
    ${Object.entries(rubric["GrammaticalRange"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    PRONUNCIATION (Band 0-9):
    ${Object.entries(rubric["Pronunciation"])
      .map(([band, desc]) => `Band ${band}: ${desc}`)
      .join("\n")}
    
    Instructions:
    1. Transcribe the audio accurately.
    2. Check audio quality and warn if unclear/noisy.
    3. Carefully assess each criterion against the band descriptors above.
    4. Assign a band score (0-9) for each criterion with confidence level (Low/Medium/High).
    5. Provide 2-3 specific key factors for each score (reference specific rubric indicators like "long pauses", "limited vocabulary", "errors in complex structures").
    6. Calculate overall band score (average of the 4 criteria, rounded to nearest 0.5).
    7. Map to CEFR level (A1-C2).
    8. Identify specific pronunciation errors with timestamps if possible.
    9. Provide 3 reference transcripts at Band 6, 7, and 8 levels for the same topic.
    10. Recommend specific lessons based on weaknesses identified.
    11. Flag for review if audio quality is poor or scores are inconsistent.
  `;
  } else {
    prompt = `
    Act as an expert TOEIC Speaking examiner. Target Level: ${targetLevel}.
    
    You must evaluate the student's speaking using the official TOEIC Speaking Level Descriptors:
    
    ${Object.entries(rubric)
      .map(([level, desc]) => `${level}: ${desc}`)
      .join("\n\n")}
    
    Instructions:
    1. Transcribe the audio accurately.
    2. Check audio quality and warn if unclear/noisy.
    3. Carefully assess the speaking against the level descriptors above.
    4. Assign a level (1-8) with corresponding score range.
    5. Provide confidence level (Low/Medium/High) for the assessment.
    6. Provide 2-3 specific key factors explaining why this level was assigned (reference specific rubric indicators).
    7. Calculate overall score based on the level assigned.
    8. Map to CEFR level (A1-C2).
    9. Identify specific pronunciation, grammar, and vocabulary issues.
    10. Provide 3 reference transcripts at different levels for the same topic.
    11. Recommend specific lessons based on weaknesses identified.
    12. Flag for review if audio quality is poor or the assessment is uncertain.
  `;
  }

  // Fix: Call generateContent directly on ai.models and use the .text property to get the string result.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: SPEAKING_SCHEMA,
      temperature: 0.3,
    },
  });

  return JSON.parse(response.text || "{}");
};

export const createTutorChat = (systemInstruction: string) => {
  // Fix: Chat creation using ai.chats.create for complex text tasks.
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });
};
