export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profilePic?: string;
  joinedDate: string;
  role: 'user' | 'admin';
}

export interface QuizResult {
  id?: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  category: string;
  language: 'EN' | 'BN';
  difficulty: Difficulty;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  difficulty: Difficulty;
}

export type Language = 'EN' | 'BN';
export type Theme = 'light' | 'dark';
