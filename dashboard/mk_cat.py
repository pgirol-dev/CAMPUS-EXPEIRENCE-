# Genera la versión Catalyst del dashboard (client/dashboard.html del software operativo)
import sys
out=sys.argv[1]
t=open('template_natv.html').read();ui=open('cat_ui.js').read()
def rep(o,n):
    global t
    assert t.count(o)==1,(o[:60],t.count(o));t=t.replace(o,n)
src=open('mk_tpl.py').read()
css=src.split("css='''",1)[1].split("'''",1)[0]
css=css.rsplit('.ce .pill.live-tag{',1)[0]
rep('<button class="theme" id="theme" type="button">Claro / Oscuro</button>','<button class="upd-op" type="button" onclick="location.href=\'index.html\'" title="Volver al software operativo">← Operativa</button><span class="upd-ts" id="upd-ts"></span><button class="upd-btn" id="upd-btn" type="button" title="Leer ahora los datos de Zoho CRM">Actualizar</button><button class="theme" id="theme" type="button">Claro / Oscuro</button>')
rep('  <div class="top"><div class="wrap">','  <div class="upd-msg" id="upd-msg" role="status" hidden></div>\n  <div class="top"><div class="wrap">')
rep('.ce .pill.live-tag{',css+'''
.ce .nav button.upd-op,.ce button.upd-op{all:unset;cursor:pointer;box-sizing:border-box;flex:none;margin-left:auto;margin-right:14px;font:800 12px var(--font);letter-spacing:.08em;text-transform:uppercase;color:var(--color-fg-muted);text-decoration:none;white-space:nowrap}.ce .upd-op:hover{color:var(--color-fg)}
.ce .upd-op+.upd-ts{margin-left:0}
@media(max-width:1180px){.ce .upd-op+.upd-ts+.upd-btn{margin-left:0}}
.ce .pill.live-tag{''')
rep('const DATA=/*DATA_START*/__DATA__/*DATA_END*/;','const DATA=window.CE_DATA||{};')
head='''<script src="/server/campus_api/acl.js"></script>
<script src="/server/campus_api/dashboard.js"></script>
<script>if(!window.CE_DATA)document.addEventListener('DOMContentLoaded',function(){var d=document.createElement('div');d.style.cssText='font:15px/1.5 system-ui,sans-serif;max-width:640px;margin:15vh auto;padding:24px';d.innerHTML='<h2>No se han podido cargar los datos del dashboard</h2><p></p><p><a href="dashboard.html">Volver a intentarlo</a> · <a href="index.html">Ir al software operativo</a></p>';d.querySelector('p').textContent=window.CE_DATA_ERR||'Error desconocido';document.body.replaceChildren(d);});</script>
<link rel="icon" href="favicon.svg">
'''
i=t.index('<head>')+len('<head>')
j=t.index('>',t.index('<meta charset',i))+1
t=t[:j]+'\n'+head+t[j:]
i=t.rfind('</body>');t=t[:i]+'<script>\n'+ui+'</script>\n'+t[i:]
assert '__DATA__' not in t and 'claude.use' not in t
open(out,'w').write(t);print('ok',len(t))
