FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

# 👇 ADD THIS (important)
RUN apk add --no-cache bash

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "sleep 10 && node server.js"]