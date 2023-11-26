FROM node:17

ENV MEDIA_SERVER_HOST=103.56.163.217
ENV MEDIA_SERVER_PORT=8888
ENV APP_SERVER_HOST=103.56.163.217
ENV APP_SERVER_PORT=8443

WORKDIR /app/signaling-server

COPY ./dist /app/signaling-server
COPY ./node_modules /app/signaling-server/node_modules
COPY ./keys /app/signaling-server/keys

EXPOSE ${APP_SERVER_PORT}
ENTRYPOINT npm start -- --ws_uri=ws://${MEDIA_SERVER_HOST}:${MEDIA_SERVER_PORT}/kurento --as_uri=http://${APP_SERVER_HOST}:${APP_SERVER_PORT}/