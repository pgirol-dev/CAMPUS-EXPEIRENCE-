#!/bin/bash
# Publica el software en Catalyst, guarda la copia en GitHub y avisa con una notificación del Mac.
# Uso:  ./publicar.sh "qué ha cambiado"
cd "$(dirname "$0")" || exit 1
MSG="${1:-Actualización del software}"
avisar() { osascript -e "display notification \"$2\" with title \"Campus Experience\" subtitle \"$1\" sound name \"$3\"" 2>/dev/null; }

echo "▶ Publicando en Catalyst…"
LOG=$(mktemp)
catalyst deploy 2>&1 | tee "$LOG"
if grep -q "Catalyst deploy complete" "$LOG" && ! grep -qE "✖|deploy skipped|Error:" "$LOG"; then
  echo "▶ Guardando la copia en GitHub…"
  git add . && git commit -q -m "$MSG"; git push -q 2>&1
  if [ $? -eq 0 ]; then
    avisar "Publicado ✓" "El equipo ya tiene la nueva versión. Recarga la página." "Glass"
    echo; echo "✅ PUBLICADO: el equipo ya tiene la nueva versión (y está guardado en GitHub)."
  else
    avisar "Publicado, pero GitHub falló" "El software está publicado; la copia de GitHub no se ha subido." "Basso"
    echo; echo "⚠️  PUBLICADO en Catalyst, pero GitHub ha fallado. Pásale el mensaje de arriba a Claude."
  fi
else
  avisar "No se ha publicado" "Ha habido un error. Copia lo que sale en la Terminal y pásaselo a Claude." "Basso"
  echo; echo "❌ NO SE HA PUBLICADO. Copia lo que sale arriba y pásaselo a Claude."
fi
rm -f "$LOG"
