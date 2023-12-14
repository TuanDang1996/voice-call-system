FROM node:17

ENV MEDIA_SERVER_HOST=103.56.163.217
ENV MEDIA_SERVER_PORT=8888
ENV APP_SERVER_HOST=localhost
ENV APP_SERVER_PORT=8443

WORKDIR /app/signaling-server

COPY ./dist /app/signaling-server
COPY ./node_modules /app/signaling-server/node_modules
COPY ./package.json /app/signaling-server

RUN chmod 777 /app/signaling-server/package.json

EXPOSE ${APP_SERVER_PORT}
ENTRYPOINT node /app/signaling-server/app.js -- --ws_uri=ws://${MEDIA_SERVER_HOST}:${MEDIA_SERVER_PORT}/kurento --as_uri=https://${APP_SERVER_HOST}:${APP_SERVER_PORT}/