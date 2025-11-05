# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
ENV PORT=4000
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start"]
