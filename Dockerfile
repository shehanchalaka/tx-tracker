# build stage
FROM node:21-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# run stage
FROM node:21-alpine AS run

ENV NODE_ENV production

WORKDIR /app

COPY --from=build /app/dist dist
COPY --from=build /app/node_modules node_modules

EXPOSE 3000

USER node

CMD [ "node", "dist/main.js" ]