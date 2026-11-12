#!/bin/bash
# Comprueba que el dashboard de registros sigue incluido antes de publicar en Catalyst.
# Lo usan publicar.sh y el despliegue automático de GitHub. Sale con error si falta algo.
cd "$(dirname "$0")/.." || exit 1
ok=1
falta() { echo "❌ $1"; ok=0; }
[ -f functions/dashboard_api/index.js ]      || falta "Falta la función functions/dashboard_api (datos del dashboard)."
[ -f functions/dashboard_api/dashboard.js ]  || falta "Falta functions/dashboard_api/dashboard.js."
[ -f functions/dashboard_api/ce_engine.js ]  || falta "Falta functions/dashboard_api/ce_engine.js."
grep -q '"dashboard_api"' catalyst.json      || falta "catalyst.json no incluye la función dashboard_api en «targets»."
[ -f client/dashboard.html ]                 || falta "Falta client/dashboard.html (la página del dashboard)."
[ -f client/dashboard-menu.js ]              || falta "Falta client/dashboard-menu.js (el acceso «Dashboard» del menú)."
grep -q 'dashboard-menu.js' build.js         || falta "build.js ya no enlaza dashboard-menu.js (el acceso del menú)."
grep -q 'dashboard-menu.js' client/index.html || falta "client/index.html no enlaza dashboard-menu.js: ejecuta node build.js."
if [ "$ok" = 0 ]; then
  echo
  echo "El dashboard de registros forma parte del software y se perdería al publicar."
  echo "Seguramente se está trabajando sobre una copia antigua: ejecuta 'git pull origin main' y vuelve a probar."
  exit 1
fi
echo "✓ Dashboard de registros incluido."
