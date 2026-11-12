/* ===== Botón «Actualizar» (versión Catalyst): pide al servidor que lea Zoho CRM ahora y recarga ===== */
(function(){
var $=function(s){return document.querySelector(s);};
var btn=$('#upd-btn'),ts=$('#upd-ts'),msg=$('#upd-msg');if(!btn)return;
function fmtTs(){try{var d=DATA.ts?new Date(DATA.ts):null;if(!d||isNaN(d))return null;
  var o={timeZone:'Europe/Madrid'};var day=d.toLocaleDateString('es-ES',Object.assign({day:'2-digit',month:'2-digit'},o));
  var now=new Date().toLocaleDateString('es-ES',Object.assign({day:'2-digit',month:'2-digit'},o));
  var hm=d.toLocaleTimeString('es-ES',Object.assign({hour:'2-digit',minute:'2-digit'},o));
  return {txt:'Zoho · '+(day===now?hm:day+' '+hm),today:day===now,full:'Datos de Zoho CRM del '+day+' a las '+hm};}catch(e){return null;}}
var F=fmtTs();if(F){ts.innerHTML='<i class="upd-dot"></i><span></span>';ts.querySelector('span').textContent=F.txt;if(!F.today)ts.classList.add('old');ts.title=F.full;btn.title=F.full+' · pulsa para leer ahora Zoho CRM';}else{ts.hidden=true;}
function say(t,kind){msg.hidden=false;msg.className='upd-msg'+(kind?' '+kind:'');msg.textContent=t;}
if(window.CE_DATA_WARN)say('No se han podido leer los datos nuevos de Zoho CRM; se muestran los últimos guardados. ('+window.CE_DATA_WARN+')','err');
var busy=false;
btn.addEventListener('click',async function(){
  if(busy)return;busy=true;btn.disabled=true;btn.textContent='Actualizando…';
  say('Leyendo las inscripciones de Zoho CRM…');
  try{
    var r=await fetch('/server/dashboard_api/api/dashboard/refresh',{method:'POST',headers:{'X-CE':'1'},credentials:'same-origin'});
    var j=await r.json().catch(function(){return {};});
    if(r.status===401){location.replace('login.html');return;}
    if(!r.ok)throw new Error(j.error||('error '+r.status));
    say('Actualizado. Cargando…','ok');location.reload();
  }catch(e){say('No se ha podido actualizar: '+(e.message||e)+'. El dashboard sigue con los datos anteriores.','err');}
  finally{busy=false;btn.disabled=false;btn.textContent='Actualizar';}
});
})();
