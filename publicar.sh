#!/bin/bash
# Publica el software en Catalyst, guarda la copia en GitHub y avisa con una notificación del Mac.
# Uso:  ./publicar.sh "qué ha cambiado"
# Orden: guarda los cambios (commit) → trae lo último de GitHub → comprueba el dashboard → publica → sube a GitHub.
cd "$(dirname "$0")" || exit 1
MSG="${1:-Actualización del software}"
avisar() { osascript -e "display notification \"$2\" with title \"Campus Experience\" subtitle \"$1\" sound name \"$3\"" 2>/dev/null; }
parar() { avisar "No se ha publicado" "$1" "Basso"; echo; echo "❌ NO SE HA PUBLICADO: $1"; echo "Copia lo que sale arriba y pásaselo a Claude."; exit 1; }

echo "▶ Guardando los cambios…"
git add . && { git diff --cached --quiet || git commit -q -m "$MSG"; }

echo "▶ Trayendo lo último de GitHub (así no se borra lo que otros han subido)…"
git pull --no-rebase --no-edit -q || parar "no se ha podido juntar lo último de GitHub (git pull)."

echo "▶ Comprobando el dashboard de registros…"
bash scripts/comprobar_dashboard.sh || parar "falta el dashboard de registros; se borraría al publicar."

echo "▶ Publicando en Catalyst…"
LOG=$(mktemp)
catalyst deploy 2>&1 | tee "$LOG"
if grep -q "Catalyst deploy complete" "$LOG" && ! grep -qE "✖|deploy skipped|Error:" "$LOG"; then
  echo "▶ Guardando la copia en GitHub…"
  git push -q 2>&1
  if [ $? -eq 0 ]; then
    avisar "Publicado ✓" "El equipo ya tiene la nueva versión. Recarga la página." "Glass"
    echo; echo "✅ PUBLICADO: el equipo ya tiene la nueva versión (y está guardado en GitHub)."
  else
    avisar "Publicado, pero GitHub falló" "El software está publicado; la copia de GitHub no se ha subido." "Basso"
    echo; echo "⚠️  PUBLICADO en Catalyst, pero GitHub ha fallado. Pásale el mensaje de arriba a Claude."
  fi
else
  rm -f "$LOG"; parar "Catalyst ha dado un error al publicar."
fi
rm -f "$LOG"
