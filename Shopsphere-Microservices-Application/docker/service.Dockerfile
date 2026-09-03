FROM node:22-alpine

ARG SERVICE

WORKDIR /app

COPY . .

ENV NODE_ENV=production
ENV SERVICE=${SERVICE}

CMD ["sh", "-c", "node services/$SERVICE/server.js"]
