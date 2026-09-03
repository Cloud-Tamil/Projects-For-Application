FROM node:22-alpine

WORKDIR /app

COPY package.json ./

COPY gateway ./gateway
COPY frontend ./frontend

ENV PORT=8080

EXPOSE 8080

CMD ["node", "gateway/server.js"]
