FROM node:22-alpine

WORKDIR /app

COPY gateway ./gateway
COPY frontend ./frontend
COPY services ./services
COPY package.json ./

ENV NODE_ENV=production

EXPOSE 18080

CMD ["node", "gateway/server.js"]
