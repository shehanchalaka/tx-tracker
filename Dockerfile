# build stage
FROM node:21-alpine AS builder

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .

USER node

# install stage
FROM node:21-alpine AS installer

WORKDIR /use/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules 
COPY --chown=node:node . .

RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force

USER node

# run stage
FROM node:21-alpine AS runner

WORKDIR /use/src/app

COPY --chown=node:node --from=installer /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=installer /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]