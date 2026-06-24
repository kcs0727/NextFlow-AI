import OpenAI from 'openai';

export const geminiAI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || 'mock_key',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});
