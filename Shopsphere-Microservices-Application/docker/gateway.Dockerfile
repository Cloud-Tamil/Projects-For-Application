FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY gateway ./gateway
COPY frontend ./frontend
COPY services ./services

ENV NODE_ENV=production
ENV PORT=18080

EXPOSE 18080

CMD ["node", "gateway/server.js"]
