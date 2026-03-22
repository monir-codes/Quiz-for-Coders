import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Language, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuizQuestions(category: string, language: Language, difficulty: Difficulty): Promise<QuizQuestion[]> {
  const difficultyContext = {
    Easy: "Focus on fundamental concepts, basic syntax, and common definitions. Suitable for beginners or junior developers.",
    Medium: "Focus on practical application, intermediate patterns, and common problem-solving scenarios. Suitable for mid-level developers.",
    Hard: "Focus on advanced architecture, performance optimization, edge cases, and complex system design. Suitable for senior developers or experts."
  };

  const prompt = `You are an expert technical interviewer for top-tier tech companies. 
  Generate 5 highly researched, professional interview questions for a ${category} role.
  
  Category: ${category}.
  Difficulty Level: ${difficulty}.
  Difficulty Context: ${difficultyContext[difficulty]}.
  Language: ${language === 'BN' ? 'Bengali' : 'English'}.
  
  Requirements:
  1. For "JavaScript", focus on "Raw JS" (ES6+, Closures, Event Loop, Prototypes, Async/Await, DOM manipulation).
  2. For "React", focus on Hooks, Performance optimization, Virtual DOM, and State management.
  3. For "Node/MongoDB", focus on Architecture, Middleware, Schema design, and Scaling.
  4. For "Frontend", focus on HTML5, CSS3 (Flexbox/Grid), Responsive Design, Web Performance, Accessibility (a11y), and Basic JavaScript/React integration.
  5. For "GitHub", focus on Git commands, branching strategies, pull requests, merge conflicts, and collaboration workflows.
  6. For "MongoDB", focus on NoSQL concepts, aggregation pipelines, indexing, and schema modeling.
  
  Return as a JSON array of objects.
  Each object must have:
  - question: string
  - options: string array (exactly 4)
  - correct: number (0-3)
  - explanation: string (A comprehensive explanation. Start with why the correct answer is right, followed by a brief note on why the other options are incorrect or common pitfalls to avoid. Use Markdown for code snippets.)
  - category: string (the category provided)
  - difficulty: string (the difficulty provided)`;

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
            difficulty: { type: Type.STRING },
          },
          required: ["question", "options", "correct", "explanation", "category", "difficulty"],
        },
      },
    },
  });

  return JSON.parse(response.text);
}
