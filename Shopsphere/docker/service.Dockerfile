FROM node:22-alpine

WORKDIR /app

COPY package.json ./

COPY services ./services

ARG SERVICE

ENV SERVICE=${SERVICE}

EXPOSE 3000

CMD ["sh", "-c", "node services/$SERVICE/server.js"]
