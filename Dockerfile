FROM node:10-alpine

COPY harmony /app/harmony
COPY issuebot /app/issuebot

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++

RUN cd /app/issuebot/ && npm install
RUN cd /app/harmony && npm link && cd /app/issuebot && npm link discord-harmony
# npm link is pretty broken.
RUN cd /app/issuebot/ && npm install @types/node@14.6.2 typescript@^3.0.0 discord.js@^11.0.0 nedb@^1.8.0 &&  ln -s ../../harmony node_modules/discord-harmony

WORKDIR /app/issuebot

RUN npm run build

ENTRYPOINT ["npm"]
CMD ["run", "start-nobuild"]
