FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY app/package.json ./app/package.json
RUN npm ci
COPY app ./app
COPY schemas ./schemas
COPY data/normalized ./data/normalized
RUN npm run build -w app

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/app/dist ./app/dist
COPY --chown=node:node scripts/serve.mjs ./scripts/serve.mjs
USER node
EXPOSE 3000
CMD ["node", "scripts/serve.mjs"]
