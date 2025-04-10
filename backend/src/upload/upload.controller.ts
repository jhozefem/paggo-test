import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus, Get, Param, Body, UseGuards, Req, Res, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from '../services/document.service';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { Readable } from 'stream';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }
      
      const document = await this.documentService.createDocument(req.user.id, file);
      
      return {
        message: 'Document processed successfully',
        document,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error processing document', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getDocuments(@Req() req: RequestWithUser) {
    return this.documentService.getDocuments(req.user.id);
  }

  @Get(':id')
  async getDocument(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.documentService.getDocument(req.user.id, id);
  }

  @Post(':id/ask')
  async askQuestion(
    @Param('id') id: string,
    @Body('question') question: string,
    @Req() req: RequestWithUser,
  ) {
    return this.documentService.askQuestion(req.user.id, id, question);
  }

  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string, 
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ) {
    const fileData = await this.documentService.downloadDocument(req.user.id, id);
    
    // Set Content-Disposition header to make the browser download the file
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
    res.setHeader('Content-Type', fileData.mimeType);
    
    return new StreamableFile(fileData.stream);
  }
} 