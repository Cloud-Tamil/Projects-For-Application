FROM node:22-alpine

WORKDIR /app

COPY . .

ENV NODE_ENV=production

EXPOSE 18080

CMD ["node", "gateway/server.js"]
