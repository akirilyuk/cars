FROM node:14-alpine

WORKDIR /usr/app

COPY ./src ./src
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock

RUN yarn --registry https://registry.yarnpkg.com

#Add docker-compose-wait tool -------------------
ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

CMD yarn start
