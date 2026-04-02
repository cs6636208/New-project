FROM node:20-alpine AS build

WORKDIR /app
COPY apps/api/package.json ./apps/api/package.json
WORKDIR /app/apps/api
RUN npm install
WORKDIR /app
COPY apps/api ./apps/api
COPY prisma ./prisma
WORKDIR /app/apps/api
RUN npm run prisma:generate && npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/prisma ./prisma
WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]

