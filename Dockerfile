FROM node:14-alpine

WORKDIR /usr/app

COPY ./src ./src
COPY ./package.json ./package.json

RUN yarn --registry https://registry.yarnpkg.com

CMD yarn start
