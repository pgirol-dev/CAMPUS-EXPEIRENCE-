/* ===== Motor de datos del dashboard (equivalente a build.py + make_data.py + build_att.py) ===== */
var CE=(function(){
var MC={'Campus Experience ONE Media Jornada':'OM','Campus Experience ONE Jornada Completa':'OJ','Campus Experience ONE Interno':'OI','Campus Experience MAX Interno':'MI','Campus Experience MAX Jornada Completa':'MJ'};
var MN={OM:'ONE - Media Jornada',OJ:'ONE - Jornada Completa',OI:'ONE - Interno',MI:'MAX - Interno',MJ:'MAX - Jornada Completa'};
var MCK=Object.keys(MC).sort(function(a,b){return b.length-a.length;});
function mcode(p){p=p||'';for(var i=0;i<MCK.length;i++){var k=MCK[i];if(p===k||p.indexOf(k+' ')===0)return MC[k];}return null;}
function nz(x){return x||0;}
function r2(x){return Math.round((x+Number.EPSILON*Math.sign(x||0))*100)/100;}
function Counter(){this.m=new Map();}
Counter.prototype.add=function(k,v){this.m.set(k,(this.m.get(k)||0)+(v===undefined?1:v));};
Counter.prototype.get=function(k){return this.m.get(k)||0;};
Counter.prototype.most=function(n){var a=Array.from(this.m.entries());a.sort(function(x,y){return y[1]-x[1];});return n===undefined?a:a.slice(0,n);};
function madridToday(){var p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return p;}
function addDays(iso,n){var d=new Date(iso+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function weekday(iso){return (new Date(iso+'T00:00:00Z').getUTCDay()+6)%7;}
function lastWord(s){var p=String(s).trim().split(/\s+/);return parseInt(p[p.length-1],10);}
var COLN={'Titulares carnet madridista (junior o premium)':'Madridistas','Socios RM':'Socios','Empleados RM y Fundación RM':'Empleados'};
function chan(r){
  var s=(r.utm_source||'').trim().toLowerCase(),m=(r.utm_medium||'').trim().toLowerCase();
  var paid=['paid','cpc','ppc','ads','display'].some(function(k){return m.indexOf(k)>=0;});
  if(s){
    if(['mailchimp','zohocrm','zoho','email','newsletter','brevo'].indexOf(s)>=0)return 'Email (newsletter)';
    if(s.indexOf('chatgpt')>=0||s.indexOf('openai')>=0)return 'ChatGPT';
    if(['meta','facebook','fb','instagram','ig','facebook.com','instagram.com','l.facebook.com','l.instagram.com'].indexOf(s)>=0)return (paid||s==='meta')?'Meta Ads':'Instagram / Facebook';
    if(s.indexOf('tiktok')>=0)return paid?'TikTok Ads':'TikTok';
    if(s.indexOf('google')>=0)return (paid||m.indexOf('cpc')>=0)?'Google Ads':'Google (orgánico)';
    if(s.indexOf('youtube')>=0)return 'YouTube';
    if(s.indexOf('linkedin')>=0)return 'LinkedIn';
    if(['twitter','x','t.co'].indexOf(s)>=0)return 'X (Twitter)';
    return s.charAt(0).toUpperCase()+s.slice(1);
  }
  if(r.GCLID||r.ga_gclid||r.Ad_Campaign_Name)return 'Google Ads';
  if(r.FBClid)return 'Meta Ads';
  if((r.referrername||'').indexOf('google.')>=0)return 'Google (orgánico)';
  return 'Directo / sin dato';
}
function colectivo(r){
  var c=r.Colectivos;if(c&&c!=='-None-')return COLN[c]||c;
  if((r.Numero_empleado_RM_FRM||'').trim())return 'Empleados';
  if((r.Numero_socio||'').trim())return 'Socios';
  if((r.Numero_carnet_madridista||'').trim())return 'Madridistas';
  return 'Sin colectivo';
}
function age(r){var y=r.A_o_de_nacimiento;if(!y)return 'N/D';return String(2027-parseInt(String(y).slice(0,4),10));}
function top(rs,f,k){var c=new Counter();rs.forEach(function(r){c.add(f(r));});return c.most(k===undefined?10:k).map(function(e){return [e[0],r2(e[1])];});}

/* provincia de residencia (dirección postal del contacto): código INE de 2 cifras, 'EXT' si vive fuera de España, 'ND' sin dato.
   Primero el código postal (sus 2 primeras cifras son la provincia); si no sirve, el texto de la provincia. */
var PROV_TXT=(function(){var m={},L={'01':'alava araba','02':'albacete','03':'alicante alacant','04':'almeria','05':'avila','06':'badajoz','07':'baleares illesbalears islasbaleares balears mallorca menorca ibiza eivissa','08':'barcelona','09':'burgos','10':'caceres','11':'cadiz','12':'castellon castello castellondelaplana','13':'ciudadreal','14':'cordoba','15':'acoruna coruna lacoruna','16':'cuenca','17':'girona gerona','18':'granada','19':'guadalajara','20':'gipuzkoa guipuzcoa','21':'huelva','22':'huesca','23':'jaen','24':'leon','25':'lleida lerida','26':'larioja rioja','27':'lugo','28':'madrid comunidaddemadrid','29':'malaga','30':'murcia regiondemurcia','31':'navarra nafarroa','32':'ourense orense','33':'asturias principadodeasturias','34':'palencia','35':'laspalmas grancanaria lanzarote fuerteventura','36':'pontevedra','37':'salamanca','38':'santacruzdetenerife tenerife tf lapalma lagomera elhierro','39':'cantabria','40':'segovia','41':'sevilla','42':'soria','43':'tarragona','44':'teruel','45':'toledo','46':'valencia valencia','47':'valladolid','48':'bizkaia vizcaya','49':'zamora','50':'zaragoza','51':'ceuta','52':'melilla'};
  Object.keys(L).forEach(function(k){L[k].split(' ').forEach(function(w){m[w]=k;});});return m;})();
function nrm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');}
function provOf(r){
  var c=nrm(r['Contact_Name.Mailing_Country']),st=PROV_TXT[nrm(r['Contact_Name.Mailing_State'])]||null,z=String(r['Contact_Name.Mailing_Zip']||'').replace(/\D/g,'');
  var es=c==='espana'||c==='spain'||c==='es'||c==='esp'||c==='espanya'||c==='reinodeespana';
  if(c&&!es)return 'EXT';
  var zp=z.length===5&&+z.slice(0,2)>=1&&+z.slice(0,2)<=52?z.slice(0,2):null;
  if(!c&&!st)return 'ND';
  return zp||st||'ND';}
/* país de residencia (dirección postal del contacto), con el nombre en español; 'ND' sin dato */
var PAIS_AL={"espana":"España","spain":"España","espanya":"España","reinodeespana":"España","esp":"España","es":"España","andorra":"Andorra","portugal":"Portugal","francia":"Francia","france":"Francia","italia":"Italia","italy":"Italia","alemania":"Alemania","germany":"Alemania","deutschland":"Alemania","reinounido":"Reino Unido","reinounidodegranbretanaeirlandadelnorte":"Reino Unido","uk":"Reino Unido","unitedkingdom":"Reino Unido","inglaterra":"Reino Unido","england":"Reino Unido","escocia":"Reino Unido","scotland":"Reino Unido","granbretana":"Reino Unido","irlanda":"Irlanda","ireland":"Irlanda","paisesbajos":"Países Bajos","holanda":"Países Bajos","netherlands":"Países Bajos","belgica":"Bélgica","belgium":"Bélgica","luxemburgo":"Luxemburgo","suiza":"Suiza","switzerland":"Suiza","austria":"Austria","dinamarca":"Dinamarca","denmark":"Dinamarca","suecia":"Suecia","sweden":"Suecia","noruega":"Noruega","norway":"Noruega","finlandia":"Finlandia","finland":"Finlandia","islandia":"Islandia","iceland":"Islandia","polonia":"Polonia","poland":"Polonia","republicacheca":"República Checa","chequia":"República Checa","czechia":"República Checa","czechrepublic":"República Checa","eslovaquia":"Eslovaquia","slovakia":"Eslovaquia","hungria":"Hungría","hungary":"Hungría","rumania":"Rumanía","romania":"Rumanía","bulgaria":"Bulgaria","grecia":"Grecia","greece":"Grecia","chipre":"Chipre","cyprus":"Chipre","croacia":"Croacia","croatia":"Croacia","eslovenia":"Eslovenia","slovenia":"Eslovenia","serbia":"Serbia","bosniayherzegovina":"Bosnia y Herzegovina","bosnia":"Bosnia y Herzegovina","montenegro":"Montenegro","albania":"Albania","macedoniadelnorte":"Macedonia del Norte","macedonia":"Macedonia del Norte","lituania":"Lituania","lithuania":"Lituania","letonia":"Letonia","latvia":"Letonia","estonia":"Estonia","ucrania":"Ucrania","ukraine":"Ucrania","moldavia":"Moldavia","moldova":"Moldavia","bielorrusia":"Bielorrusia","belarus":"Bielorrusia","rusia":"Rusia","russia":"Rusia","federacionrusa":"Rusia","georgia":"Georgia","armenia":"Armenia","azerbaiyan":"Azerbaiyán","azerbaijan":"Azerbaiyán","turquia":"Turquía","turkey":"Turquía","turkiye":"Turquía","israel":"Israel","libano":"Líbano","lebanon":"Líbano","jordania":"Jordania","jordan":"Jordania","arabiasaudi":"Arabia Saudí","arabiasaudita":"Arabia Saudí","saudiarabia":"Arabia Saudí","emiratosarabesunidos":"Emiratos Árabes Unidos","eau":"Emiratos Árabes Unidos","uae":"Emiratos Árabes Unidos","emiratosarabes":"Emiratos Árabes Unidos","unitedarabemirates":"Emiratos Árabes Unidos","catar":"Catar","qatar":"Catar","kuwait":"Kuwait","barein":"Baréin","bahrein":"Baréin","bahrain":"Baréin","oman":"Omán","egipto":"Egipto","egypt":"Egipto","marruecos":"Marruecos","morocco":"Marruecos","argelia":"Argelia","algeria":"Argelia","tunez":"Túnez","tunisia":"Túnez","nigeria":"Nigeria","ghana":"Ghana","senegal":"Senegal","costademarfil":"Costa de Marfil","ivorycoast":"Costa de Marfil","camerun":"Camerún","cameroon":"Camerún","guineaecuatorial":"Guinea Ecuatorial","equatorialguinea":"Guinea Ecuatorial","angola":"Angola","kenia":"Kenia","kenya":"Kenia","tanzania":"Tanzania","uganda":"Uganda","etiopia":"Etiopía","ethiopia":"Etiopía","sudafrica":"Sudáfrica","southafrica":"Sudáfrica","botsuana":"Botsuana","botswana":"Botsuana","namibia":"Namibia","mozambique":"Mozambique","zimbabue":"Zimbabue","zimbabwe":"Zimbabue","estadosunidos":"Estados Unidos","estadosunidosdeamerica":"Estados Unidos","eeuu":"Estados Unidos","usa":"Estados Unidos","unitedstates":"Estados Unidos","unitedstatesofamerica":"Estados Unidos","canada":"Canadá","mexico":"México","guatemala":"Guatemala","elsalvador":"El Salvador","honduras":"Honduras","nicaragua":"Nicaragua","costarica":"Costa Rica","panama":"Panamá","cuba":"Cuba","republicadominicana":"República Dominicana","dominicanrepublic":"República Dominicana","puertorico":"Puerto Rico","colombia":"Colombia","venezuela":"Venezuela","ecuador":"Ecuador","peru":"Perú","bolivia":"Bolivia","chile":"Chile","argentina":"Argentina","uruguay":"Uruguay","paraguay":"Paraguay","brasil":"Brasil","brazil":"Brasil","china":"China","japon":"Japón","japan":"Japón","coreadelsur":"Corea del Sur","korea":"Corea del Sur","southkorea":"Corea del Sur","republicadecorea":"Corea del Sur","taiwan":"Taiwán","india":"India","pakistan":"Pakistán","tailandia":"Tailandia","thailand":"Tailandia","vietnam":"Vietnam","malasia":"Malasia","malaysia":"Malasia","singapur":"Singapur","singapore":"Singapur","indonesia":"Indonesia","filipinas":"Filipinas","philippines":"Filipinas","australia":"Australia","nuevazelanda":"Nueva Zelanda","newzealand":"Nueva Zelanda","kazajistan":"Kazajistán","kazakhstan":"Kazajistán","uzbekistan":"Uzbekistán","iran":"Irán","irak":"Irak","iraq":"Irak","siria":"Siria","syria":"Siria","mongolia":"Mongolia","nepal":"Nepal","banglades":"Bangladés","bangladesh":"Bangladés"};
function paisOf(r){var raw=String(r['Contact_Name.Mailing_Country']||'').trim(),c=nrm(raw);
  if(!c)return PROV_TXT[nrm(r['Contact_Name.Mailing_State'])]?'España':'ND';
  return PAIS_AL[c]||raw.charAt(0).toUpperCase()+raw.slice(1);}
/* opt.black: sede institucional → la equipación incluida (y la que se compra aparte) es la Black */
function build(rs,ex,opt){opt=opt||{};
  var PRE='2026-10-08';
  var LN={};ex.forEach(function(e){var p=e[0],pid=e[2],sem=e[4];var c=mcode(p);if(c&&sem){(LN[pid]=LN[pid]||[]).push([c,lastWord(sem)]);}});
  function mod(r){var s=new Set((LN[r.id]||[]).map(function(x){return MN[x[0]];}));
    if(!s.size){var t=r.Tipo_Modalidad;if(!t)return 'Sin definir';return t.indexOf(',')>=0?'Varias':t;}
    return s.size===1?Array.from(s)[0]:'Varias';}
  var day=function(r){return r.Created_Time.slice(0,10);};
  var today=madridToday();var mon=addDays(today,-weekday(today));
  var dc=new Counter();rs.forEach(function(r){dc.add(day(r));});
  /* registros = semanas contratadas de cada inscripción, en el día en que se inscribió (como «Jugadores por semana de campus») */
  function nreg(r){var ws=new Set((LN[r.id]||[]).map(function(x){return x[1];}));if(!ws.size)(r.Weeks||[]).forEach(function(x){ws.add(lastWord(x));});return ws.size;}
  var rc=new Counter();rs.forEach(function(r){rc.add(day(r),nreg(r));});
  var keys=Array.from(dc.m.keys()).sort();var maxk=keys.length?keys[keys.length-1]:null;
  function days_series(dc){var out=[['pre',keys.filter(function(k){return k<PRE;}).reduce(function(a,k){return a+dc.get(k);},0)]];
    var x=PRE,z=maxk&&maxk>today?maxk:today;if(!maxk&&PRE>today)z=PRE;
    while(x<=z){out.push([x,dc.get(x)]);x=addDays(x,1);}return out;}
  function weeks_series(dc){var out=[['pre','','2026-10-07',keys.filter(function(k){return k<PRE;}).reduce(function(a,k){return a+dc.get(k);},0)]];
    var s=PRE,e='2026-10-11',z=maxk&&maxk>today?maxk:today;if(!maxk&&PRE>today)z=PRE;
    while(s<=z){var tot=0;keys.forEach(function(k){if(k>=s&&k<=e)tot+=dc.get(k);});out.push([out.length,s,e,tot]);s=addDays(e,1);e=addDays(s,6);}return out;}
  function hours_series(w){var c=new Counter();rs.forEach(function(r){c.add(parseInt(r.Created_Time.slice(11,13),10),w?w(r):1);});var o=[];for(var h=0;h<24;h++)o.push([h,c.get(h)]);return o;}
  var fact=0,cobr=0;rs.forEach(function(r){fact+=nz(r.Total);cobr+=nz(r.Paid);});
  var LI={},EXT=new Counter();
  ex.forEach(function(e){var p=e[0],imp=e[1],pid=e[2],sem=e[4];var c=mcode(p);if(c&&sem)(LI[pid]=LI[pid]||[]).push([MN[c],imp||0]);else if(!c)EXT.add(pid,imp||0);/* todo lo que no es una semana de campus es un extra (también «Campus Experience Autobus…») */});
  var mcnt=new Counter(),mrev=new Counter(),extrev=0;
  rs.forEach(function(r){var T=nz(r.Total);var e=Math.min(Math.max(EXT.get(r.id),0),T);extrev+=e;var prog=T-e;var ls=LI[r.id];
    if(!ls){var m=mod(r);mcnt.add(m);mrev.add(m,prog);return;}
    var sm=ls.reduce(function(a,x){return a+x[1];},0);ls.forEach(function(x){mcnt.add(x[0]);mrev.add(x[0],prog*(sm>0?x[1]/sm:1/ls.length));});});
  var PAYMOD=new Counter();rs.forEach(function(r){PAYMOD.add(mod(r)+'\u0000'+(r.Forma_de_pago||'N/D'));});
  var TK=new Map();rs.forEach(function(r){var m=mod(r);var x=TK.get(m)||[0,0];x[0]+=1;x[1]+=nz(r.Total);TK.set(m,x);});
  var stages=Array.from(new Set(rs.map(function(r){return r.Stage;}))).sort();
  var colc=new Counter();rs.forEach(function(r){colc.add(colectivo(r));});
  var colk=Array.from(new Set(['Madridistas','Socios','Empleados'].concat(Array.from(colc.m.keys())))).filter(function(k){return k!=='Sin colectivo';}).sort();
  var col=colk.map(function(k){return [k,colc.get(k)];}).sort(function(a,b){return b[1]-a[1];}).concat([['Sin colectivo',colc.get('Sin colectivo')]]);
  var out={gen:today,
    k:{n:rs.length,hoy:dc.get(today),sem:keys.filter(function(k){return k>=mon;}).reduce(function(a,k){return a+dc.get(k);},0),
       d7:keys.filter(function(k){return k>=addDays(today,-6);}).reduce(function(a,k){return a+dc.get(k);},0),
       fact:r2(fact),cobr:r2(cobr),pend:r2(fact-cobr),ticket:rs.length?r2(fact/rs.length):0},
    day:days_series(dc),week:weeks_series(dc),hour:hours_series(),
    rday:days_series(rc),rweek:weeks_series(rc),rhour:hours_series(nreg),
    mod:mcnt.most(8).map(function(e){return [e[0],e[1]];}),modrev:mrev.most(8).map(function(e){return [e[0],r2(e[1])];}),
    gen_:top(rs,function(r){return {Male:'Masculino',Female:'Femenino'}[r.Gender]||'N/D';}),
    pos:top(rs,function(r){return r.Posicion_participante||'N/D';}),
    nat:top(rs,function(r){return r.Nationality||'N/D';},10),
    prov:top(rs,provOf,80),pais:top(rs,paisOf,300),age:top(rs,age,40),
    src:top(rs,chan,40),promo:top(rs,function(r){return r.Codigo_descuento||'Sin código';},40),
    col:col,pay:top(rs,function(r){return r.Forma_de_pago||'N/D';}),
    stage:stages.map(function(s){var a=rs.filter(function(r){return r.Stage===s;});return [s,a.length,r2(a.reduce(function(t,r){return t+nz(r.Total);},0)),r2(a.reduce(function(t,r){return t+nz(r.Paid);},0))];})};
  var wc=new Counter();
  rs.forEach(function(r){var ws=new Set((LN[r.id]||[]).map(function(x){return x[1];}));if(!ws.size)(r.Weeks||[]).forEach(function(x){ws.add(lastWord(x));});ws.forEach(function(w){wc.add('Week '+w);});});
  out.money={extras:r2(extrev),prog:r2(Array.from(mrev.m.values()).reduce(function(a,b){return a+b;},0))};
  out.paymod=PAYMOD.most().map(function(e){var p=e[0].split('\u0000');return [p[0],p[1],e[1]];});
  out.tkmod=Array.from(TK.entries()).map(function(e){return [e[0],e[1][0],r2(e[1][1])];});
  /* residencias: registros internos (ONE Interno y MAX Interno) por semana */
  var RW={};Object.keys(LN).forEach(function(pid){LN[pid].forEach(function(x){if(x[0]!=='MI'&&x[0]!=='OI')return;var w=+x[1];if(!RW[w])RW[w]={max:0,one:0};RW[w][x[0]==='MI'?'max':'one']+=1;});});
  out.resid=Object.keys(RW).map(Number).sort(function(a,b){return a-b;}).map(function(w){return {week:w,max:RW[w].max,one:RW[w].one};});
  out.campwk=Array.from(wc.m.entries()).sort(function(a,b){return lastWord(a[0])-lastWord(b[0]);});
  /* ===== Ingresos adicionales: todo lo que no es una semana de campus, del form 1 (inscripción) y del form 3 (después) =====
     Extras: minikit, kit de portero, mochila Adidas ONE y jersey Adidas · Campus Protection Plan · Servicios adicionales:
     transporte (bus de externos desde Zona Bernabéu, bus de internos desde Zona Bernabéu, transfer aeropuerto) y noches extra
     (las que se cobran solas al juntar semanas de ONE Interno y las que se contratan en el form 3).
     Unidades = «Cantidad» de la línea (si está vacía, 1). Origen: si la línea se creó más de 30 min después que la inscripción → form 3. */
  function addl(p,nn){var q=(p||'').toLowerCase();
    if(q.indexOf('uniforme portero')===0||q.indexOf('camiseta portero')===0)return ['Extras','Kit de portero'];
    if(q.indexOf('uniforme')===0)return ['Extras','Minikit'];
    if(q.indexOf('mochila')===0)return ['Extras','Mochila Adidas ONE'];
    if(q.indexOf('jersey')===0)return ['Extras','Jersey Adidas'];
    if(q.indexOf('protection')>=0||q.indexOf('portection')>=0)return ['Campus Protection Plan',q.indexOf('interno')>=0?'CPP Interno':'CPP Jornada Completa'];
    if(q.indexOf('noche')>=0||nn==='Sí'||nn==='Si')return ['Servicios adicionales','Noches extra'];
    if(q.indexOf('transfer')>=0||q.indexOf('traslado')>=0)return ['Servicios adicionales','Transfer aeropuerto'];
    if(q.indexOf('autob')>=0||/\bbus\b/.test(q))return ['Servicios adicionales',(q.indexOf('no interno')>=0||/autobus (mj|jc)/.test(q))?'Bus externos':'Bus internos'];
    return null;}
  var CATS=['Extras','Campus Protection Plan','Servicios adicionales'];
  var DCT={};rs.forEach(function(r){DCT[r.id]=Date.parse(r.Created_Time)||0;});
  var agg={};CATS.forEach(function(c){agg[c]={u:0,imp:0,ins:new Set(),prod:{}};});
  ex.forEach(function(e){var p=e[0],imp=+e[1]||0,pid=e[2],sem=e[4];if(mcode(p)&&sem)return;if(imp<0)return;
    var k=addl(p,e[3]);if(!k){if(String(p||'').indexOf('Campus Experience')===0||!imp)return;k=['Extras',p];}
    var a=agg[k[0]],u=Math.max(1,+e[5]||1);a.u+=u;a.imp+=imp;a.ins.add(pid);
    var x=a.prod[k[1]]=a.prod[k[1]]||{u:0,imp:0,ins:new Set(),pr:new Counter(),f1:0,f3:0,fi:0,ff:0};
    x.u+=u;x.imp+=imp;x.ins.add(pid);x.pr.add(r2(imp/u),u);
    var lt=Date.parse(e[6]||'')||0,dt=DCT[pid]||0,f3=!!(lt&&dt&&lt-dt>30*60000);if(f3){x.f3+=u;x.ff+=imp;}else{x.f1+=u;x.fi+=imp;}});
  var tot=CATS.reduce(function(s,c){return s+agg[c].imp;},0);var allins=new Set();CATS.forEach(function(c){agg[c].ins.forEach(function(i){allins.add(i);});});
  /* noches que tocan por semanas seguidas de ONE Interno: 2 noches (sábado y domingo) entre cada par de semanas seguidas */
  var NPID={};ex.forEach(function(e){var k=addl(e[0],e[3]);if(k&&k[1]==='Noches extra'&&(+e[1]||0)>0)NPID[e[2]]=1;});var nexp={jug:0,noches:0,con:0};Object.keys(LN).forEach(function(pid){if(!DCT.hasOwnProperty(pid))return;var w=LN[pid].filter(function(x){return x[0]==='OI';}).map(function(x){return +x[1];}).sort(function(a,b){return a-b;});
    var g=0;for(var i=1;i<w.length;i++)if(w[i]===w[i-1]+1)g++;if(g){nexp.jug++;nexp.noches+=2*g;if(NPID[pid])nexp.con++;}});
  out.extras={n:rs.length,tot:r2(tot),ins:allins.size,nexp:nexp,cats:CATS.map(function(c){var a=agg[c];return [c,a.u,r2(a.imp),a.ins.size,Object.keys(a.prod).map(function(k){var x=a.prod[k];
    return {product:k,units:x.u,amount:r2(x.imp),price:(x.pr.most(1)[0]||[0])[0],prices:x.pr.most(5).map(function(e){return [e[0],e[1]];}),ins:x.ins.size,f1:x.f1,f3:x.f3,amount_f1:r2(x.fi),amount_f3:r2(x.ff)};})];})};
  var INC={OM:[1,0],OJ:[1,0],OI:[2,0],MI:[1,1],MJ:[1,1]};
  var SZ=['Niño 128','Niño 140','Niño 152','Niño 164','Adulto S','Adulto M','Adulto L','Adulto XL'];
  var RB={};rs.forEach(function(r){RB[r.id]=r;});
  var cells={};function cell(w){return cells[w]=cells[w]||new Counter();}
  function tl(pid){var t=RB[pid].Talla_equipacion;return SZ.indexOf(t)>=0?t:'Sin talla';}
  Object.keys(LN).forEach(function(pid){if(!RB[pid])return;LN[pid].forEach(function(x){if(opt.black){cell(x[1]).add('Black|'+tl(pid),1);return;}var b=INC[x[0]];cell(x[1]).add('Blanca|'+tl(pid),b[0]);cell(x[1]).add('Light blue|'+tl(pid),b[1]);});});
  ex.forEach(function(e){var p=e[0],pid=e[2];if((p!=='Uniforme Oficial Adidas'&&p!=='Uniforme Portero Oficial Adidas')||!RB[pid]||!(LN[pid]&&LN[pid].length))return;
    var first=Math.min.apply(null,LN[pid].map(function(x){return x[1];}));cell(first).add((p==='Uniforme Oficial Adidas'?(opt.black?'Black':'Blanca'):'Portero')+'|'+tl(pid));});
  var KT=['Blanca','Light blue','Portero','Black'];
  var anySin=Object.keys(cells).some(function(w){return Array.from(cells[w].m.keys()).some(function(k){return k.split('|')[1]==='Sin talla';});});
  var SZX=SZ.concat(anySin?['Sin talla']:[]);var WK=[1,2,3,4,5,6,7,8,9];
  function cg(w,k,t){return cells[w]?cells[w].get(k+'|'+t):0;}
  function wsum(w,k){if(!cells[w])return 0;var s=0;cells[w].m.forEach(function(v,key){if(key.split('|')[0]===k)s+=v;});return s;}
  out.kits={week:WK.map(function(w){return [w].concat(KT.map(function(k){return wsum(w,k);}));}),
    size:SZX.map(function(t){return [t].concat(KT.map(function(k){return WK.reduce(function(s,w){return s+cg(w,k,t);},0);}));}),
    tot:KT.map(function(k){return WK.reduce(function(s,w){return s+wsum(w,k);},0);}),
    matrix:[]};
  WK.forEach(function(w){SZX.forEach(function(t){out.kits.matrix.push([w,t].concat(KT.map(function(k){return cg(w,k,t);})));});});
  out.sin=rs.filter(function(r){return !(LN[r.id]&&LN[r.id].length);}).length;
  return out;
}
function pyRound(x,n){var f=Math.pow(10,n||0);return Math.round(x*f)/f;}
function conv(d){
  var k=d.k,x=d.extras,fact=k.fact||1;
  var kp=[['n',k.n],['hoy',k.hoy],['sem',k.sem],['d7',k.d7],['fact',k.fact],['cobr',k.cobr],['pend',k.pend],['ticket',k.ticket],
    ['pct_cobr',pyRound(k.cobr/fact*100)],['pct_pend',pyRound(k.pend/fact*100)],
    ['extras_tot',x.tot],['extras_ins',x.ins],['extras_ins_pct',pyRound(x.ins/Math.max(k.n,1)*100)],['extras_share',pyRound(x.tot/fact*100,1)]];
  var t=[];d.day.forEach(function(e){t.push({view:'day',key:e[0],start:e[0]!=='pre'?e[0]:'',end:'',count:e[1]});});
  d.week.forEach(function(e){t.push({view:'week',key:e[0],start:e[1],end:e[2],count:e[3]});});
  d.hour.forEach(function(e){t.push({view:'hour',key:e[0],start:'',end:'',count:e[1]});});
  (d.rday||[]).forEach(function(e){t.push({view:'rday',key:e[0],start:e[0]!=='pre'?e[0]:'',end:'',count:e[1]});});
  (d.rweek||[]).forEach(function(e){t.push({view:'rweek',key:e[0],start:e[1],end:e[2],count:e[3]});});
  (d.rhour||[]).forEach(function(e){t.push({view:'rhour',key:e[0],start:'',end:'',count:e[1]});});
  var rev={};d.modrev.forEach(function(e){rev[e[0]]=e[1];});var dm=[];
  [['mod','mod'],['gen','gen_'],['pos','pos'],['age','age'],['nat','nat'],['prov','prov'],['pais','pais'],['src','src'],['promo','promo'],['col','col'],['pay','pay']].forEach(function(p){
    d[p[1]].forEach(function(e){dm.push({dim:p[0],label:e[0],count:e[1],revenue:p[0]==='mod'?(e[0] in rev?rev[e[0]]:''):''});});});
  d.campwk.forEach(function(e){dm.push({dim:'campwk',label:e[0],count:e[1],revenue:''});});
  d.modrev.forEach(function(e){dm.push({dim:'rev',label:e[0],count:e[1],revenue:''});});
  dm.push({dim:'rev',label:'Ingresos adicionales',count:d.money.extras,revenue:''});
  d.paymod.forEach(function(e){dm.push({dim:'paymod',label:e[0]+'|'+e[1],count:e[2],revenue:''});});
  d.tkmod.forEach(function(e){dm.push({dim:'tkmod',label:e[0],count:e[1],revenue:e[2]});});
  var pr=[];x.cats.forEach(function(c){c[4].forEach(function(p){pr.push(Object.assign({category:c[0]},p));});});
  return {kpis:kp.map(function(e){return {metric:e[0],value:e[1]};}),timeline:t,dims:dm,
    stages:d.stage.map(function(s){return {stage:s[0],n:s[1],total:s[2],paid:s[3]};}),
    resid:d.resid||[],
    extras_cat:x.cats.map(function(c){return {category:c[0],units:c[1],amount:c[2],inscriptions:c[3],pct_insc:pyRound(c[3]/Math.max(k.n,1)*100)};}),
    extras:pr,extras_nexp:[x.nexp||{jug:0,noches:0,con:0}],
    kits_week:d.kits.week.map(function(e){return {week:e[0],blanca:e[1],light_blue:e[2],portero:e[3],black:e[4]};}),
    kits_size:d.kits.size.map(function(e){return {talla:e[0],blanca:e[1],light_blue:e[2],portero:e[3],black:e[4]};}),
    kits_matrix:d.kits.matrix.map(function(e){return {week:e[0],talla:e[1],blanca:e[2],light_blue:e[3],portero:e[4],black:e[5]};})};
}
function kitsSum(sets){
  var W=new Map(),S=new Map(),M=new Map(),n=0,sz=[];
  function add(map,key,r){var a=map.get(key);if(!a){a=[0,0,0,0];map.set(key,a);}a[0]+=r.blanca;a[1]+=r.light_blue;a[2]+=r.portero;a[3]+=(r.black||0);}
  sets.forEach(function(o){var nk=(o.kpis||[]).filter(function(r){return r.metric==='n';})[0];n+=nk?nk.value:0;
    o.kits_week.forEach(function(r){add(W,r.week,r);});
    o.kits_size.forEach(function(r){if(sz.indexOf(r.talla)<0)sz.push(r.talla);add(S,r.talla,r);});
    o.kits_matrix.forEach(function(r){add(M,r.week+'|'+r.talla,r);});});
  var ws=Array.from(W.keys()).sort(function(a,b){return a-b;});
  var g=function(m,k){return m.get(k)||[0,0,0,0];};
  return {kpis:[{metric:'n',value:n}],
    kits_week:ws.map(function(w){var a=g(W,w);return {week:w,blanca:a[0],light_blue:a[1],portero:a[2],black:a[3]};}),
    kits_size:sz.map(function(t){var a=g(S,t);return {talla:t,blanca:a[0],light_blue:a[1],portero:a[2],black:a[3]};}),
    kits_matrix:[].concat.apply([],ws.map(function(w){return sz.map(function(t){var a=g(M,w+'|'+t);return {week:w,talla:t,blanca:a[0],light_blue:a[1],portero:a[2],black:a[3]};});}))};
}
var INS=[['yepes','Yepes'],['arges','Argés']];
var SEDES=[['andorra','Andorra'],['valencia','Valencia'],['malaga','Málaga'],['alicante','Alicante'],['almeria','Almería'],['torrevieja','Torrevieja']];
/* inputs: {madrid:{rs,ex}, andorra:{rs,ex}, ...}; prevAtt: att anterior */
function makeData(inputs,att){
  var d=build(inputs.madrid.rs,inputs.madrid.ex);
  var out=conv(d);out.gen=d.gen;
  var sedes={};SEDES.forEach(function(s){var i=inputs[s[0]]||{rs:[],ex:[]};var o=conv(build(i.rs,i.ex));o.name=s[1];sedes[s[0]]=o;});
  out.sedes=sedes;
  /* institucionales (municipios): mismo cálculo que una sede, con la equipación Black */
  var ins_sedes={};INS.forEach(function(s){var i=inputs['ins_'+s[0]]||{rs:[],ex:[]};var o=conv(build(i.rs,i.ex,{black:true}));o.name=s[1];ins_sedes[s[0]]=o;});
  out.ins_sedes=ins_sedes;
  var nac=kitsSum(SEDES.map(function(s){return sedes[s[0]];})),insk=kitsSum(INS.map(function(s){return ins_sedes[s[0]];}));
  out.storage={nac:nac,ins:insk,general:kitsSum([out,nac,insk])};
  if(att)out.att=att;
  out.ts=new Date().toISOString();
  out._chk={sinMadrid:d.sin};
  return out;
}
/* ---- call center (build_att.py) ---- */
function parseAtt(V,MV){
  function num(s){s=String(s==null?'':s).trim();if(s===''||s==='-')return 0;return parseFloat(s.replace(/\./g,'').replace('%','').replace(',','.'))||0;}
  function cell(r,i){return (r&&i<r.length&&r[i]!=null?String(r[i]):'').trim();}
  var bases=[],cur=null,mode=null;
  V.forEach(function(r){var b=cell(r,1);var m=b.match(/^\d+\.\s*BASE DE DATOS:\s*(.*?)\s*\('(.*)'\)$/);
    if(m){var nm=m[1].toLowerCase().replace(/(^|\s)\S/g,function(c){return c.toUpperCase();}).replace('Bbdd','BBDD');cur={name:nm,sheet:m[2],kpi:{},status:[],agents:[]};bases.push(cur);mode='kpih';return;}
    if(!cur)return;
    if(mode==='kpih'&&b==='TOTAL LEADS'){mode='kpi';return;}
    if(mode==='kpi'&&b){var ks=['total','gest','pend','avance','insc','pinsc'];[1,3,5,7,9,11].forEach(function(i,j){cur.kpi[ks[j]]=num(cell(r,i));});mode='tab';return;}
    if(mode==='tab'){if(b==='ESTADO DEL LEAD')return;
      if(b&&b!=='TOTAL GESTIONES')cur.status.push([b,Math.trunc(num(cell(r,2))),Math.trunc(num(cell(r,3))),Math.trunc(num(cell(r,4))),Math.trunc(num(cell(r,5)))]);
      if(b==='TOTAL GESTIONES')cur.tot_gest=Math.trunc(num(cell(r,5)));
      var a=cell(r,8);if(a&&a!=='AGENTE (ATT)'&&a!=='TOTAL AGENTES')cur.agents.push([a,Math.trunc(num(cell(r,9))),Math.trunc(num(cell(r,10))),Math.trunc(num(cell(r,11))),Math.trunc(num(cell(r,12)))]);
      if(a==='TOTAL AGENTES')cur.tot_ag=Math.trunc(num(cell(r,12)));}});
  if(!bases.length||!bases.every(function(b){return Object.keys(b.kpi).length;}))throw new Error('estructura no reconocida');
  var SH={'Lead esp':'Leads España','Lead eng':'Leads internacional','BBDD extranjeros 2026':'Extranjeros 2026','BBDD españoles 2026':'Españoles 2026'};
  bases.forEach(function(b){b.label=SH[b.sheet]||b.name;});
  var out={bases:bases};
  if(MV){for(var i=0;i<MV.length;i++){var r=MV[i];if(cell(r,1).toUpperCase()==='TOTAL GESTIONES'&&i+1<MV.length){var v=MV[i+1],met=[];for(var c=1;c<r.length;c+=2){var lab=cell(r,c);if(lab)met.push([lab,num(cell(v,c))]);}out.metrics=met;break;}}}
  return out;
}
/* ---- comprobaciones antes de publicar ---- */
function check(D,minN){
  var K={};D.kpis.forEach(function(r){K[r.metric]=r.value;});var n=K.n,e=[];
  var dim=function(x){return D.dims.filter(function(r){return r.dim===x;}).reduce(function(a,r){return a+(+r.count);},0);};
  if(!(n>0))e.push('Madrid sin registros');if(minN&&n<minN)e.push('Madrid tiene menos registros ('+n+') que la última versión ('+minN+')');
  if(Math.abs(K.cobr+K.pend-K.fact)>1)e.push('cobrado + pendiente ≠ facturación');
  if(D.timeline.filter(function(r){return r.view==='week';}).reduce(function(a,r){return a+r.count;},0)!==n)e.push('el gráfico semanal no suma el total');
  ['gen','pos','age','src','promo','col','pay','paymod','prov','pais'].forEach(function(x){if(dim(x)!==n)e.push('el reparto «'+x+'» no suma el total');});
  var rwk=D.timeline.filter(function(r){return r.view==='rweek';});if(rwk.length&&rwk.reduce(function(a,r){return a+r.count;},0)!==dim('campwk'))e.push('el ritmo de registros no suma las semanas contratadas');
  if(dim('mod')!==dim('campwk'))e.push('modalidades ≠ semanas contratadas');
  if(Math.abs(dim('rev')-K.fact)>1)e.push('el reparto de facturación no suma el total');
  if(D._chk&&D._chk.sinMadrid)e.push(D._chk.sinMadrid+' inscripciones de Madrid sin línea de modalidad');
  if(D.att&&JSON.stringify(D.att).indexOf('@')>=0)e.push('el call center contiene emails');
  return e;
}
return {build:build,conv:conv,kitsSum:kitsSum,makeData:makeData,parseAtt:parseAtt,check:check,SEDES:SEDES,INS:INS};
})();
if(typeof module!=='undefined')module.exports=CE;
