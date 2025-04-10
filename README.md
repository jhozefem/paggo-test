# Paggo Test

A full-stack application for document processing with OCR and AI-powered analysis. Upload images of documents, extract text using OCR, and ask questions about their content.

## Tech Stack

### Backend
- NestJS (Node.js framework)
- Prisma (ORM)
- PostgreSQL (Database)
- Tesseract.js (OCR)
- OpenAI API (for document analysis)
- MinIO (S3-compatible storage)
- JWT Authentication

### Frontend
- Next.js
- Tailwind CSS
- React Icons
- Axios

## Prerequisites

- Docker and Docker Compose
- OpenAI API key

## Setup and Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd paggo-test
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_openai_api_key
```

### 3. Start the application with Docker

```bash
docker-compose up --build
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MinIO Console: http://localhost:9001 (login: minioadmin/minioadmin)
- PostgreSQL database

### 4. First-time setup

The application will:
- Create database tables automatically
- Set up a "documents" bucket in MinIO
- Create a test user with credentials:
  - Email: email@email.com
  - Password: 123456