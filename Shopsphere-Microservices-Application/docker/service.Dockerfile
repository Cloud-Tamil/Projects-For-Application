FROM node:22-alpine

WORKDIR /app

ARG SERVICE

COPY package.json ./
COPY services ./services

ENV NODE_ENV=production

RUN test -n "$SERVICE"

EXPOSE 4001 4002 4003 4004 4005

CMD ["sh", "-c", "node services/$SERVICE/server.js"]
