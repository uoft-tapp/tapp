FROM node:12.16-alpine

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

COPY package.json .
COPY yarn.lock .

RUN yarn

RUN mkdir /app
WORKDIR /app