import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

@Injectable()
export class AgentService {
  private llm: ChatGroq;
  private searchTool: DuckDuckGoSearch;

  constructor() {
    // Initialize the Groq AI model (using Llama 3.1)
    this.llm = new ChatGroq({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      apiKey: process.env.GROQ_API_KEY,
    });

    // Initialize DuckDuckGo Search Tool
    this.searchTool = new DuckDuckGoSearch({ maxResults: 3 });
  }

  async generateLinkedInPost(topic: string): Promise<string> {
    try {
      let searchResults = '';

      // Step 1: Try to search the web, but gracefully handle DuckDuckGo blocks
      try {
        console.log(`Searching the web for: ${topic}...`);
        searchResults = (await this.searchTool.invoke(topic)) as string;
        console.log('Search completed successfully.');
      } catch {
        // Fallback: If DDG blocks the request, use AI's internal knowledge
        console.warn(
          'DuckDuckGo search blocked. Using AI internal knowledge instead.',
        );
        searchResults =
          'No recent web information could be retrieved. Please use your internal knowledge to write the post.';
      }

      // Step 2: Setup instructions for the AI
      const prompt = PromptTemplate.fromTemplate(`
        You are an expert professional LinkedIn content creator. 
        I will provide you with a topic and some recent information from the web (if available).
        
        Topic: "{topic}"
        Web Information: "{context}"
        
        Write a highly engaging LinkedIn text post based on the above topic.
        
        Requirements:
        - Use simple English.
        - Include relevant emojis.
        - Separate paragraphs clearly for better readability.
        - Add 3 to 5 relevant hashtags at the bottom.
      `);

      // Step 3: Connect the prompt template with the AI model
      const chain = prompt.pipe(this.llm);

      // Step 4: Get the generated content from the AI
      // Explicitly type the response to avoid ESLint warnings
      const response = (await chain.invoke({
        topic: topic,
        context: searchResults,
      })) as Record<string, any>;

      return response.content as string;
    } catch (error) {
      console.error('Error generating post:', error);
      throw new Error('Failed to generate LinkedIn post');
    }
  }
}
