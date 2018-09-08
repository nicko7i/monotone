FROM node:10-alpine
EXPOSE 3030

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN cd /app && npm install --production
COPY src /app/src

ENV MONOTONE_DATA=/data/build-data.sqlite
WORKDIR /app
ENTRYPOINT ["node", "."]
