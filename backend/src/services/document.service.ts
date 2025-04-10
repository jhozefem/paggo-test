import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from './ocr.service';
import { GptService } from './gpt.service';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ocrService: OcrService,
    private readonly gptService: GptService,
    private readonly storageService: StorageService,
  ) {}

  async createDocument(userId: string, file: Express.Multer.File) {
    // Process the file with OCR
    const textContent = await this.ocrService.processFile(file.path);

    // Upload file to S3
    const { key } = await this.storageService.uploadFile(file, userId);

    // Store document in database
    const document = await this.prismaService.document.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        textContent,
        userId,
        s3Key: key,
      },
    });

    // Get explanation from GPT
    const explanation = await this.gptService.explainDocument(textContent);

    return {
      id: document.id,
      fileName: document.fileName,
      textContent: document.textContent,
      explanation,
    };
  }

  async getDocuments(userId: string) {
    return this.prismaService.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getDocument(userId: string, id: string) {
    const document = await this.prismaService.document.findUnique({
      where: { id, userId },
      include: {
        conversations: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async askQuestion(userId: string, documentId: string, question: string) {
    // Get document
    const document = await this.prismaService.document.findUnique({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Get answer from GPT
    const answer = await this.gptService.answerQuestion(
      document.textContent,
      question,
    );

    // Store conversation in database
    await this.prismaService.conversation.create({
      data: {
        question,
        answer,
        documentId,
      },
    });

    return { question, answer };
  }

  async downloadDocument(userId: string, id: string) {
    const document = await this.prismaService.document.findUnique({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const s3Object = await this.storageService.getFileStream(document.s3Key);
    return {
      stream: s3Object.Body as Readable,
      fileName: document.fileName,
      mimeType: document.mimeType,
    };
  }
} 