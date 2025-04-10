import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async explainDocument(text: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that explains documents and invoices. Extract key information like dates, amounts, parties involved, and summarize the content concisely.',
          },
          {
            role: 'user',
            content: `Please explain this document: ${text}`,
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error(`GPT processing error: ${error.message}`);
      throw new Error('Failed to process document with GPT');
    }
  }

  async answerQuestion(textContent: string, question: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that answers questions about documents and invoices. Be precise and concise.',
          },
          {
            role: 'user',
            content: `Document content: ${textContent}\n\nQuestion: ${question}`,
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error(`GPT processing error: ${error.message}`);
      throw new Error('Failed to answer question with GPT');
    }
  }
} 