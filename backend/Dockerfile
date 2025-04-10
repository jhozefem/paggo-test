FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
RUN apk add --no-cache python3 make g++ openssl openssl-dev wget tesseract-ocr tesseract-ocr-data-eng

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy Prisma schema
COPY prisma ./prisma/

# Copy the rest of the code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Make start script executable
RUN chmod +x start.sh

# Use non-root user
USER node

# Expose port
EXPOSE 3001

# Start app
CMD ["sh", "./start.sh"]