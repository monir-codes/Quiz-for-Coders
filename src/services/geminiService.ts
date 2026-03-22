import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuizQuestions(category: string, language: Language): Promise<QuizQuestion[]> {
  const prompt = `You are an expert technical interviewer for top-tier tech companies. 
  Generate 5 highly researched, professional interview questions for a ${category === 'Frontend' ? 'Junior Frontend Developer' : category + ' Developer'} role.
  
  Category: ${category}.
  Target Audience: ${category === 'Frontend' ? 'Junior Frontend Developers (0-2 years experience)' : 'Frontend and MERN Stack Developers'}.
  Language: ${language === 'BN' ? 'Bengali' : 'English'}.
  
  Requirements:
  1. Focus on core concepts, advanced patterns, and common "tricky" interview scenarios.
  2. For "JavaScript", focus on "Raw JS" (ES6+, Closures, Event Loop, Prototypes, Async/Await, DOM manipulation).
  3. For "React", focus on Hooks, Performance optimization, Virtual DOM, and State management.
  4. For "Node/MongoDB", focus on Architecture, Middleware, Schema design, and Scaling.
  5. For "Frontend", focus on HTML5, CSS3 (Flexbox/Grid), Responsive Design, Web Performance, Accessibility (a11y), and Basic JavaScript/React integration.
  6. For "GitHub", focus on Git commands, branching strategies, pull requests, merge conflicts, and collaboration workflows.
  7. For "MongoDB", focus on NoSQL concepts, aggregation pipelines, indexing, and schema modeling.
  
  Return as a JSON array of objects.
  Each object must have:
  - question: string
  - options: string array (exactly 4)
  - correct: number (0-3)
  - explanation: string (detailed, educational explanation for the answer, use Markdown for code snippets)
  - category: string (the category provided)`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["question", "options", "correct", "explanation", "category"],
        },
      },
    },
  });

  return JSON.parse(response.text);
}
