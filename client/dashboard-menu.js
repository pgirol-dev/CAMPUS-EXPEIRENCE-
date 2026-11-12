/* Acceso «Dashboard» en el menú lateral del software operativo (solo versión Catalyst).
   Este archivo es INDEPENDIENTE de index.html a propósito: build.js lo enlaza en client/index.html,
   así que aunque se publique una versión nueva de la aplicación, el acceso al dashboard no se pierde.
   No hay que tocar index.html para que aparezca. */
(function () {
  "use strict";
  if (!window.CE_ACL) return; // sin sesión no hay menú
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M6 16v-5M11 16V6M16 16v-8M21 16v-3"/></svg>';
  function add() {
    var nav = document.getElementById("sbNav");
    if (!nav || nav.querySelector(".sb-dash")) return;
    var a = document.createElement("a");
    a.className = "si sb-dash"; a.href = "dashboard.html"; a.title = "Dashboard de registros";
    a.innerHTML = '<span class="ic">' + ICON + '</span><span class="sl">Dashboard</span>';
    var after = nav.querySelector(".sb-season");
    if (after && after.nextSibling) nav.insertBefore(a, after.nextSibling);
    else if (after) nav.appendChild(a);
    else nav.insertBefore(a, nav.firstChild);
  }
  function watch() {
    var nav = document.getElementById("sbNav");
    if (!nav) return setTimeout(watch, 300);
    add();
    new MutationObserver(add).observe(nav, { childList: true }); // el menú se vuelve a pintar a menudo
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
})();
