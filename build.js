#!/usr/bin/env node
/* Genera las versiones del software a partir de la aplicación (index.html de la raíz):
     client/   → Zoho Catalyst · Web Client Hosting (con login y API en /server/campus_api)
     selfhost/ → servidor propio
   Uso: node build.js   (no necesita instalar nada) */
"use strict";
const fs = require("fs"), path = require("path");
const R = (...p) => path.join(__dirname, ...p);
const app = fs.readFileSync(R("index.html"), "utf8");
const shared = ["ce-shim.js", "login.html", "favicon.svg"];

const HEAD = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n';
const BASE_CSS = '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n';

/* Catalyst: la app pide sus accesos a la función antes de arrancar */
const catalystHead = HEAD + BASE_CSS +
  '<script>window.CE_API_BASE="/server/campus_api";window.CE_LOGIN_URL="login.html";window.CE_POLL=true;</script>\n' +
  '<script src="/server/campus_api/acl.js"></script>\n<script src="ce-shim.js"></script>\n<link rel="icon" href="favicon.svg">\n</head>\n<body>\n';
fs.mkdirSync(R("client"), { recursive: true });
fs.writeFileSync(R("client", "index.html"), catalystHead + app + "\n</body>\n</html>\n");
for (const f of shared) {
  let s = fs.readFileSync(R("selfhost", "public", f), "utf8");
  if (f === "login.html") s = s.replace('<link rel="icon" href="/favicon.svg">', '<link rel="icon" href="favicon.svg">\n<script>window.CE_API_BASE="/server/campus_api";window.CE_APP_URL="index.html";</script>');
  fs.writeFileSync(R("client", f), s);
}

/* servidor propio: el servidor añade los accesos al servir la página */
fs.mkdirSync(R("selfhost", "app"), { recursive: true });
fs.writeFileSync(R("selfhost", "app", "index.html"), app);

console.log("Listo: client/ (Catalyst) y selfhost/app/ actualizados.");
