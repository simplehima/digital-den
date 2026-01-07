# Use official Node.js LTS image
FROM node:20-alpine

# Install ffmpeg for audio processing (needed for voice)
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port (for web dashboard)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
