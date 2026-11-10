# Tarea programada: actualizar el dashboard Campus Experience 2027

Pega este documento como instrucciones de una tarea programada en Claude Cowork (cada hora). Requiere el conector de Zoho CRM activo en Cowork.

## Qué hace la tarea
1. Leer del módulo Deals (Applications) de Zoho CRM todos los registros con Ano_Campus = 2027.
2. Recalcular las métricas con las reglas de abajo.
3. Regenerar el dashboard y republicarlo en el MISMO enlace: https://claude.ai/artifact/EQ3ML11Bgm2A5yX5K5DMKi (Artifact, action publish con url).
4. Si algo falla, no publicar a medias: dejar el dashboard anterior y avisar del error.

## Paso 1 · Extraer datos (executeCOQLQuery, paginando de 200 en 200)
Repetir con OFFSET = 0, 200, 400… hasta que una página devuelva menos de 200 filas. Unir todas las filas por `id` y guardarlas ordenadas por Created_Time en /home/claude/ce27.json (lista de objetos).
```sql
select id, Created_Time, Stage, Tipo_Modalidad, Gender, Nationality, Weeks, Lead_Source, utm_source, utm_medium, utm_campaign, Total, Paid, Discount, Refund, Promociones, Posicion_participante, Forma_de_pago, A_o_de_nacimiento, Extras_Paid, First_Instalment_Amount, First_Instalment_Status, Second_Instalment_Amount, Second_Instalment_Status, Third_Instalment_Amount, Third_Instalment_Status, Reservation_Status, Currency, Event_Name, Ubicacion, Colectivos, Agencia, Codigo_descuento, Promo_Code from Deals where Ano_Campus = 2027 order by Created_Time asc limit 200 offset {OFFSET}
```
Nota: en COQL los campos fórmula (p. ej. Importe_total1) no se pueden seleccionar; usar Total y Paid.

## Reglas de negocio (ya validadas con el director del proyecto)
- Proyecto: Ano_Campus = 2027.
- Se excluyen las pruebas: utm_source que empieza por "qa_", utm_campaign en qa_ce_original_campaign, test2027, ce27_qa_promo, y Codigo_descuento que contiene "TEST" o igual a SOCIALMEDIATEST.
- Se excluye Stage = Trash de todas las métricas (solo se muestra su recuento).
- Formularios rellenados = no prueba y no Trash. Han pagado = Stage en Paid, 1st Payment, Reservation Payment Completed. No han pagado = Unpaid.
- Carrito abandonado = Unpaid y Tipo_Modalidad vacío. Va aparte y fuera de las métricas por modalidad, género, etc.
- Todo lo que está bajo «Solo registros pagados» se calcula solo con los que han pagado al menos una vez.
- Facturación confirmada = suma de Total de los pagados; Cobrado = suma de Paid; Pendiente = Total − Paid.
- Moneda: el CRM dice USD pero son euros; mostrar «€».

## Paso 2 · Calcular (guardar como /home/claude/build.py y ejecutar: genera agg.json)
```python
import json,collections as C,datetime as D
rs=json.load(open('ce27.json'))
def test(r):
    return (r.get('utm_source') or '').startswith('qa_') or (r.get('utm_campaign') or '') in('qa_ce_original_campaign','test2027','ce27_qa_promo') or 'TEST' in (r.get('Codigo_descuento') or '') or r.get('Codigo_descuento')=='SOCIALMEDIATEST'
real=[r for r in rs if not test(r)]
val=[r for r in real if r['Stage']!='Trash']
CONF=('Paid','1st Payment','Reservation Payment Completed')
conf=[r for r in val if r['Stage'] in CONF]
n=lambda x:x or 0
def mod(r):
    t=r.get('Tipo_Modalidad')
    if not t: return 'Sin definir'
    if ',' in t: return 'Varias'
    if t.lower().startswith('media'): return 'ONE - Media Jornada'
    return t
def top(rows,f,k=10,w=None):
    c=C.Counter()
    for r in rows:
        v=f(r)
        c[v]+= (w(r) if w else 1)
    return [[a,round(b,2)] for a,b in c.most_common(k)]
def day(r): return r['Created_Time'][:10]
def wk(r):
    d=D.date.fromisoformat(day(r)); m=d-D.timedelta(days=d.weekday()); return m.isoformat()
def series(f):
    a=C.Counter(f(r) for r in val); b=C.Counter(f(r) for r in conf)
    ks=sorted(a); return [[k,a[k],b[k]] for k in ks]
def age(r):
    y=r.get('A_o_de_nacimiento')
    if not y: return 'N/D'
    a=2027-int(y[:4])
    return '≤6' if a<=6 else '7-9' if a<=9 else '10-12' if a<=12 else '13-15' if a<=15 else '16+'
def src(r):
    return r.get('utm_source') or 'Directo / sin dato'
out={
 'gen':str(D.date.today()),
 'k':{'total':len(real),'trash':len(real)-len(val),'val':len(val),'conf':len(conf),'unpaid':sum(r['Stage']=='Unpaid' for r in val),'aband':sum(1 for r in val if r['Stage']=='Unpaid' and mod(r)=='Sin definir'),'confnomod':sum(1 for r in conf if mod(r)=='Sin definir'),'ref':sum(r['Stage']=='Refund' for r in val),'test':len(rs)-len(real),
  'fact':round(sum(n(r['Total']) for r in conf),2),'cobr':round(sum(n(r['Paid']) for r in conf),2),'pend':round(sum(n(r['Total'])-n(r['Paid']) for r in conf),2),'unpaidamt':round(sum(n(r['Total']) for r in val if r['Stage']=='Unpaid'),2)},
 'day':series(day),'week':series(wk),
 'mod':top(conf,mod,8),'modrev':top(conf,mod,8,lambda r:n(r['Total'])),
 'gen_':top(conf,lambda r:{'Male':'Masculino','Female':'Femenino'}.get(r.get('Gender'),'N/D')),
 'pos':top(conf,lambda r:r.get('Posicion_participante') or 'N/D'),
 'nat':top(conf,lambda r:r.get('Nationality') or 'N/D',10),'age':top(conf,age,6),
 'src':top(conf,src,8),'promo':top(conf,lambda r:r.get('Codigo_descuento') or 'Sin código',8),
 'pay':top(conf,lambda r:r.get('Forma_de_pago') or 'N/D'),
 'stage':[[s,sum(1 for r in val if r['Stage']==s),round(sum(n(r['Total']) for r in val if r['Stage']==s),2),round(sum(n(r['Paid']) for r in val if r['Stage']==s),2)] for s in ['Paid','1st Payment','Reservation Payment Completed']],
 'wks':top([r for r in conf if r.get('Weeks')],lambda r:len(r['Weeks']),6)}
# weeks selected per camp week
wc=C.Counter()
for r in conf:
    for w in r.get('Weeks') or []: wc[w]+=1
out['campwk']=sorted(wc.items())
print(json.dumps(out['k']),out['stage'],out['mod'],out['pay'])
json.dump(out,open('agg.json','w'),ensure_ascii=False)

```

## Paso 3 · Generar el HTML (guardar como /home/claude/html.py y ejecutar: escribe el .html en /mnt/user-data/outputs/)
```python
import json
d=json.load(open('agg.json'))
tpl=r'''<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Campus Experience 2027 · Dashboard de registros</title>
<style>
:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);--bg:#f6f7f9;--card:#fff;--tx:#14213d;--mut:#667085;--ln:#e4e7ec;--a:#1f4fd8;--b:#12a37a;--c:#e08a00;--r:#d64545}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f141b;--card:#18202a;--tx:#e8edf3;--mut:#9aa7b6;--ln:#273241;--a:#6d93ff;--b:#35c79b;--c:#f0a830;--r:#ef7676}}
:root[data-theme="dark"]{--bg:#0f141b;--card:#18202a;--tx:#e8edf3;--mut:#9aa7b6;--ln:#273241;--a:#6d93ff;--b:#35c79b;--c:#f0a830;--r:#ef7676}
html{scroll-padding-top:env(safe-area-inset-top,0px)}*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:16px}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:0 0 10px}.sub{color:var(--mut);font-size:12px;margin:2px 0 14px}
.g{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:12px}.g2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.c{background:var(--card);border:1px solid var(--ln);border-radius:10px;padding:12px;min-width:0}
.k b{display:block;font-size:22px}.k span{color:var(--mut);font-size:12px}
.row{display:grid;grid-template-columns:minmax(80px,38%) 1fr auto;gap:8px;align-items:center;margin:4px 0;font-size:12px}
.bar{height:10px;background:var(--ln);border-radius:5px;overflow:hidden}.bar i{display:block;height:100%;background:var(--a)}
.row em{font-style:normal;color:var(--mut);white-space:nowrap}.lab{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ch{display:flex;align-items:flex-end;gap:2px;height:130px;overflow-x:auto;padding-bottom:2px}
.col{flex:1 0 12px;display:flex;flex-direction:column;justify-content:flex-end;height:100%;position:relative}
.col i{display:block;background:var(--a);opacity:.35;border-radius:2px 2px 0 0}.col u{display:block;background:var(--b);border-radius:2px 2px 0 0;text-decoration:none}
.lg{font-size:11px;color:var(--mut);margin-top:6px}.lg s{display:inline-block;width:10px;height:10px;border-radius:2px;margin:0 4px 0 8px;vertical-align:-1px;text-decoration:none}
table{width:100%;border-collapse:collapse;font-size:12px}td,th{padding:5px 4px;border-bottom:1px solid var(--ln);text-align:right}td:first-child,th:first-child{text-align:left}
.tabs button{border:1px solid var(--ln);background:var(--card);color:var(--tx);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px}.tabs button.on{background:var(--a);color:#fff;border-color:var(--a)}
.note{color:var(--mut);font-size:11px;margin-top:10px}
</style></head><body>
<h1>Campus Experience Madrid 2027</h1>
<div class="sub">Applications en Zoho CRM · datos a __GEN__ · excluye pruebas internas y registros en Trash</div>
<h2>Todos los registros</h2><div class="g" id="k"></div>
<div class="c" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h2 style="margin:0">Formularios en el tiempo</h2><div class="tabs"><button id="td" class="on">Diario</button> <button id="tw">Semanal</button></div></div><div class="ch" id="ch"></div><div class="lg"><s style="background:var(--a);opacity:.35"></s>Formularios rellenados<s style="background:var(--b)"></s>Con pago</div></div>
<h2 style="margin-top:18px">Solo registros pagados</h2><div class="g" id="e"></div><div class="g g2" id="a"></div>
<div class="g g2"><div class="c"><h2>Facturación por fase de pago</h2><table id="st"></table></div><div class="c"><h2>Facturación confirmada por modalidad</h2><div id="mr"></div></div></div>
<div class="g g2" id="b"></div>
<div class="note">Lo que hay bajo “Solo registros pagados” incluye únicamente los que han pagado al menos una vez (Paid, 1st Payment, Reservation). Carritos abandonados = sin pagar y sin modalidad. Fecha de registro = fecha de creación del formulario. Cobrado = campo “Paid” de cada registro. Pendiente = facturación − cobrado. El CRM marca USD pero los importes son euros.</div>
<script>
const D=__DATA__,f=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(n),m=n=>f(n)+' €',$=i=>document.getElementById(i);
const K=D.k,pc=(a,b)=>b?Math.round(a/b*100)+'%':'–';
$('k').innerHTML='<div class="c k"><span>Formularios rellenados</span><b>'+f(K.val)+'</b><span>sin pruebas ni Trash ('+f(K.trash)+' en Trash)</span></div><div class="c k"><span>Han pagado (al menos 1 pago)</span><b>'+f(K.conf)+'</b><span>tasa de pago '+pc(K.conf,K.val)+'</span></div><div class="c k"><span>No han pagado</span><b>'+f(K.unpaid)+'</b><span>tasa de impago '+pc(K.unpaid,K.val)+'</span></div><div class="c k"><span>Carritos abandonados</span><b>'+f(K.aband)+'</b><span>sin modalidad · '+m(K.unpaidamt)+' en carritos</span></div>';
$('e').innerHTML=[['Facturación confirmada',m(K.fact),'registros que han pagado ≥ 1 vez'],['Cobrado',m(K.cobr),pc(K.cobr,K.fact)+' de la facturación'],['Pendiente de cobrar',m(K.pend),'pago fraccionado']].map(x=>`<div class="c k"><span>${x[0]}</span><b>${x[1]}</b><span>${x[2]}</span></div>`).join('');
function chart(s){const mx=Math.max(...s.map(x=>x[1]),1);$('ch').innerHTML=s.map(x=>`<div class="col" title="${x[0]}: ${x[1]} registros, ${x[2]} confirmados"><i style="height:${x[1]/mx*100}%"></i><u style="height:${x[2]/mx*100}%;margin-top:-${x[2]/mx*100}%"></u></div>`).join('')}
let s=D.day.slice(-45);chart(s);$('td').onclick=()=>{chart(D.day.slice(-45));$('td').className='on';$('tw').className=''};$('tw').onclick=()=>{chart(D.week);$('tw').className='on';$('td').className=''};
function bars(t,rows,fmt){const mx=Math.max(...rows.map(r=>r[1]),1);return `<div class="c"><h2>${t}</h2>${rows.map(r=>`<div class="row"><span class="lab" title="${r[0]}">${r[0]}</span><div class="bar"><i style="width:${r[1]/mx*100}%"></i></div><em>${fmt?fmt(r[1]):f(r[1])}</em></div>`).join('')}</div>`}
$('a').innerHTML=bars('Por modalidad',D.mod)+bars('Por género',D.gen_)+bars('Posición',D.pos)+bars('Por edad (a 2027)',D.age)+bars('Semanas de campus elegidas',D.campwk)+bars('Top nacionalidades',D.nat);
$('b').innerHTML=bars('Origen (utm_source)',D.src)+bars('Códigos de descuento',D.promo)+bars('Forma de pago',D.pay);
const L={'Paid':'Pagado completo','1st Payment':'1.er pago','Reservation Payment Completed':'Reserva'};
$('mr').outerHTML=bars('',D.modrev,m).replace('<h2></h2>','').replace('class="c"','');
$('st').innerHTML='<tr><th>Estado</th><th>Nº</th><th>Importe</th><th>Cobrado</th></tr>'+D.stage.map(r=>`<tr><td>${L[r[0]]}</td><td>${r[1]}</td><td>${m(r[2])}</td><td>${m(r[3])}</td></tr>`).join('');
</script></body></html>'''
open('/mnt/user-data/outputs/dashboard_campus_experience_2027.html','w').write(tpl.replace('__DATA__',json.dumps(d,ensure_ascii=False)).replace('__GEN__',d['gen']))

```

## Paso 4 · Publicar
Artifact → action "publish" con url = https://claude.ai/artifact/EQ3ML11Bgm2A5yX5K5DMKi y file_path = /mnt/user-data/outputs/dashboard_campus_experience_2027.html.
Comprobar que k.val ≈ nº de formularios y que cobrado ≤ facturación antes de publicar.
