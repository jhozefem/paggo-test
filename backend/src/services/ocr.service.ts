import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extractTextFromImage(filePath: string): Promise<string> {
    try {
      const worker = await createWorker({
        logger: progress => {
          if (progress.status === 'recognizing text') {
            this.logger.debug(`OCR progress: ${(progress.progress * 100).toFixed(2)}%`);
          }
        }
      });
      
      // Try to initialize with language and catch specific errors
      try {
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
      } catch (langError) {
        this.logger.error(`Language initialization error: ${langError.message}`);
        // Fallback to default if language fails
        await worker.initialize();
      }

      console.log('filePath', filePath);

      const { data } = await worker.recognize(filePath);
      await worker.terminate();

      return data.text;
    } catch (error) {
      this.logger.error(`OCR processing error: ${error.message}`);
      throw new Error('Failed to process image with OCR');
    }
  }

  async processFile(filePath: string): Promise<string> {
    return this.extractTextFromImage(filePath);
  }
} 