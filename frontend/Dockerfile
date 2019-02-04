FROM node:8.15-alpine

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

COPY package.json .

RUN yarn

RUN mkdir /app
WORKDIR /app

