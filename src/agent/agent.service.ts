import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

@Injectable()
export class AgentService {
  private llm: ChatGoogleGenerativeAI;

  constructor() {
    // Initialize the Gemini AI model
    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash', // Changed from modelName to model
      maxOutputTokens: 2048,
      apiKey: process.env.GOOGLE_API_KEY, // Explicitly cast as string
    });
  }

  async generateLinkedInPost(topic: string): Promise<string> {
    try {
      // Setup instructions for the AI
      const prompt = PromptTemplate.fromTemplate(`
        You are an expert professional LinkedIn content creator. 
        Write a highly engaging LinkedIn text post about the following topic: "{topic}".
        
        Requirements:
        - Use simple English.
        - Include relevant emojis.
        - Separate paragraphs clearly for better readability.
        - Add 3 to 5 relevant hashtags at the bottom.
      `);

      // Connect the prompt template with the AI model
      const chain = prompt.pipe(this.llm);

      // Get the generated content from the AI
      const response = await chain.invoke({ topic });

      return response.content as string;
    } catch (error) {
      console.error('Error generating post:', error);
      throw new Error('Failed to generate LinkedIn post');
    }
  }
}
