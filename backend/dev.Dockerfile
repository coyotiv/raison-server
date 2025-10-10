FROM node:21-alpine
RUN apk add --no-cache ca-certificates
WORKDIR /app

ADD package.json ./

RUN npm install

ADD bin ./bin

CMD [ "npm", "run", "dev" ]
