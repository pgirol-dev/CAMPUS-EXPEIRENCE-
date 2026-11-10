FROM node:22-alpine
ENV NODE_ENV=production DATA_DIR=/data APP_HTML=/app/app/index.html PORT=3000
WORKDIR /app
COPY server.js ./
COPY public ./public
COPY app ./app
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3000/salud || exit 1
CMD ["node", "--experimental-sqlite", "--disable-warning=ExperimentalWarning", "server.js"]
