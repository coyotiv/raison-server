FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY tsconfig.json ./
COPY types ./types
COPY src ./src
COPY bin ./bin

RUN npm run build

RUN npm prune --omit=dev

ENV NODE_ENV=production

CMD ["npm", "start"]

