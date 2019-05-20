FROM node:8.15-alpine

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

RUN mkdir /app
WORKDIR /app

COPY . ./

RUN yarn
