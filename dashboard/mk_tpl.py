t=open('template_natv.html').read()
eng=open('ce_engine.js').read();ui=open('upd_ui.js').read()
assert '__DATA__' not in eng and '__DATA__' not in ui
def rep(o,n):
    global t
    assert t.count(o)==1,(o[:60],t.count(o));t=t.replace(o,n)
rep('<button class="theme" id="theme" type="button">Claro / Oscuro</button>','<span class="upd-ts" id="upd-ts"></span><button class="upd-btn" id="upd-btn" type="button" title="Leer los datos de Zoho CRM y del call center ahora">Actualizar</button><button class="theme" id="theme" type="button">Claro / Oscuro</button>')
rep('  <div class="top"><div class="wrap">','  <div class="upd-msg" id="upd-msg" role="status" hidden></div>\n  <div class="top"><div class="wrap">')
css='''.ce .upd-ts{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:8px;font:800 12px var(--font);letter-spacing:.08em;text-transform:uppercase;color:var(--color-fg-muted);white-space:nowrap;padding-right:12px}
.ce .upd-dot{width:9px;height:9px;border-radius:50%;background:#3fbf87;flex:none}
.ce .upd-ts.old .upd-dot{background:#e0a33a}
.ce .upd-btn{flex:none;cursor:pointer;border:1.5px solid color-mix(in srgb,var(--color-fg) 25%,transparent);background:transparent;color:var(--color-fg);border-radius:96px;font:800 12px var(--font);letter-spacing:.08em;text-transform:uppercase;padding:9px 20px;margin-right:10px;transition:border-color .15s,background .15s}
.ce .upd-btn:hover{border-color:var(--color-fg);background:var(--color-panel)}.ce .upd-btn:disabled{opacity:.6;cursor:progress}
.ce .upd-ts+.upd-btn+.theme{margin-left:0}
.ce .upd-msg{position:sticky;top:52px;z-index:19;margin:0 auto;max-width:1200px;padding:10px 16px;border-radius:0 0 10px 10px;background:var(--navy);color:#fff;font:600 12.5px var(--font)}
.ce .upd-msg.ok{background:#2f8f5b}.ce .upd-msg.err{background:#b3364f}
@media(max-width:1480px){.ce .nav button.tab{padding:8px 10px}.ce .nav .logo{font-size:1.15rem}.ce .theme{font-size:0;padding:8px 11px}.ce .theme::before{content:'◐';font-size:14px;line-height:1}}
@media(max-width:1180px){.ce .upd-ts{display:none}.ce .upd-btn{margin-left:auto}}
.ce .pill.live-tag{'''
rep('.ce .pill.live-tag{',css)
rep('const DATA=/*DATA_START*/__DATA__/*DATA_END*/;','const DATA=/*DATA_START*/__DATA__/*DATA_END*/;\n</script>\n<script>\n/*CE_ENGINE_START*/\n'+eng+'\n/*CE_ENGINE_END*/')
i=t.rfind('</body>');t=t[:i]+'<script>\n'+ui+'</script>\n'+t[i:]
open('template_upd.html','w').write(t);print('ok',t.count('__DATA__'))
