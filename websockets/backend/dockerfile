FROM node:alpine
ENV NODE_ENV=production
COPY ./websockets /app
WORKDIR /app/backend
RUN npm --omit=dev ci
ENTRYPOINT ["node", "backend.js"]