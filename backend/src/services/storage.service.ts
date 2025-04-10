import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: AWS.S3;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET') || 'documents';

    // Configure AWS SDK
    const s3Config: AWS.S3.ClientConfiguration = {
      accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      region: this.configService.get<string>('S3_REGION') || 'us-east-1',
    };

    // If we're using MinIO or a custom endpoint
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    if (endpoint) {
      s3Config.endpoint = endpoint;
      s3Config.s3ForcePathStyle = true; // Needed for MinIO
      s3Config.signatureVersion = 'v4';
    }

    this.s3 = new AWS.S3(s3Config);
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ key: string }> {
    try {
      // Generate unique filename
      const fileId = uuidv4();
      const extension = path.extname(file.originalname);
      const key = `${userId}/${fileId}${extension}`;

      // Upload file to S3
      await this.s3
        .upload({
          Bucket: this.bucket,
          Key: key,
          Body: fs.createReadStream(file.path),
          ContentType: file.mimetype,
        })
        .promise();

      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        key
      };
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`);
      throw error;
    }
  }

  async getFileStream(key: string): Promise<AWS.S3.GetObjectOutput> {
    try {
      return await this.s3
        .getObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
    } catch (error) {
      this.logger.error(`Error getting file from S3: ${error.message}`);
      throw error;
    }
  }
} 