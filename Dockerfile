FROM node:10-alpine
EXPOSE 3030

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN cd /app                     \
  && npm install --production   \
  && mkdir /data
COPY src /app/src

ENV MONOTONE_DB_FILE=/data/monotone.sqlite
ENV NODE_ENV=production
WORKDIR /app
ENTRYPOINT ["node", "."]
