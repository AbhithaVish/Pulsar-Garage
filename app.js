const KEY='pulsarGarage_v1';
const defaults={odo:0,tank:8,remaining:0,efficiency:0,serviceInterval:5000,lastServiceOdo:0,fuel:[],expenses:[],services:[]};
let db={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};
const $=id=>document.getElementById(id), money=n=>'LKR '+Number(n||0).toLocaleString('en-LK',{maximumFractionDigits:0}), today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
function totalFuel(){return db.fuel.reduce((s,x)=>s+Number(x.cost||0),0)}
function totalExpenses(){return db.expenses.reduce((s,x)=>s+Number(x.cost||0),0)+db.services.reduce((s,x)=>s+Number(x.cost||0),0)}
function efficiency(){const f=[...db.fuel].sort((a,b)=>a.odo-b.odo);let vals=[];for(let i=1;i<f.length;i++){let litres=Number(f[i].litres);let km=Number(f[i].odo)-Number(f[i-1].odo);if(km>0&&litres>0)vals.push(km/litres)}return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:Number(db.efficiency||0)}
function render(){
 $('odoValue').textContent=Number(db.odo||0).toLocaleString('en-LK');$('effValue').textContent=efficiency()?efficiency().toFixed(1):'—';
 const range=Math.floor(Number(db.remaining||0)*efficiency());$('rangeValue').textContent=efficiency()?range:'—';$('fuelLitres').textContent=`${Number(db.remaining||0).toFixed(1)} L remaining · ${db.tank} L tank`;
 const month=new Date().toISOString().slice(0,7);let m=[...db.fuel,...db.expenses,...db.services].filter(x=>(x.date||'').startsWith(month)).reduce((s,x)=>s+Number(x.cost||0),0);$('monthSpend').textContent=money(m);
 const due=Number(db.lastServiceOdo||0)+Number(db.serviceInterval||5000),left=due-Number(db.odo||0);$('serviceDue').textContent=Math.max(0,left).toLocaleString('en-LK');$('nextServiceTitle').textContent=left<=0?'Service overdue':'Next general service';$('nextServiceSub').textContent=left<=0?`Was due at ${due.toLocaleString()} km`:`Due at ${due.toLocaleString()} km`; $('serviceProgress').style.width=Math.min(100,Math.max(0,(Number(db.odo||0)-Number(db.lastServiceOdo||0))/Number(db.serviceInterval||5000)*100))+'%';
 $('fuelTotal').textContent=money(totalFuel());$('maintTotal').textContent=money(db.services.reduce((s,x)=>s+Number(x.cost||0),0));$('otherTotal').textContent=money(totalExpenses()-db.services.reduce((s,x)=>s+Number(x.cost||0),0));$('allTotal').textContent=money(totalFuel()+totalExpenses());
 const all=[...db.fuel.map(x=>({...x,type:'Fuel',icon:'⛽'})),...db.expenses.map(x=>({...x,type:x.category||'Expense',icon:'▤'})),...db.services.map(x=>({...x,type:x.name||'Service',icon:'⚒'}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
 $('recentList').innerHTML=all.length?all.map(x=>`<div class="activity"><div class="activity-icon">${x.icon}</div><div class="activity-main"><b>${esc(x.type)}</b><small>${esc(x.date||'')} · ${Number(x.odo||0).toLocaleString()} km</small></div><strong>${money(x.cost)}</strong></div>`).join(''):'<div class="empty">Your bike records will appear here.</div>';
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const schemas={
 odo:{title:'Update odometer',fields:[['odo','Current odometer (km)','number',db.odo]]},
 fuel:{title:'Add fuel fill-up',fields:[['date','Date','date',today()],['odo','Odometer (km)','number',db.odo],['litres','Fuel added (litres)','number',''],['cost','Total paid (LKR)','number',''],['remaining','Estimated fuel remaining (L)','number',db.remaining||''],['note','Note (optional)','text','']]},
 expense:{title:'Add bike expense',fields:[['date','Date','date',today()],['odo','Odometer (km)','number',db.odo],['category','Category','select','Fuel-related'],['cost','Amount (LKR)','number',''],['note','Description','text','']]},
 service:{title:'Record maintenance',fields:[['date','Date','date',today()],['odo','Odometer (km)','number',db.odo],['name','Work performed','select','General service'],['cost','Total cost (LKR)','number',''],['next','Next reminder interval (km)','number',5000],['note','Notes / parts used','text','']]},
 settings:{title:'Bike settings',fields:[['tank','Fuel tank capacity (L)','number',db.tank],['remaining','Current fuel remaining (L)','number',db.remaining],['efficiency','Estimated km per litre (if not calculated)','number',db.efficiency],['serviceInterval','Service interval (km)','number',db.serviceInterval]]}
};
function openModal(type){let s=schemas[type];$('modalTitle').textContent=s.title;$('formFields').innerHTML=s.fields.map(([n,label,t,val])=>{let input=t==='select'?`<select name="${n}">${(n==='category'?['Repairs','Spare parts','Insurance','Licence / revenue','Washing','Accessories','Other']:['General service','Engine oil change','Oil filter','Air filter','Spark plug','Brake service','Chain clean & lube','Tyre replacement','Other']).map(v=>`<option ${v===val?'selected':''}>${v}</option>`).join('')}</select>`:`<input name="${n}" type="${t}" value="${esc(val)}" ${t==='number'?'step="any" min="0"':''} ${['odo','cost','litres'].includes(n)?'required':''}>`;return `<div class="field"><label>${label}</label>${input}</div>`}).join('');$('recordForm').dataset.type=type;$('modalBackdrop').classList.add('show')}
document.querySelectorAll('[data-modal]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.modal)));
$('settingsBtn').onclick=()=>openModal('settings');$('closeModal').onclick=()=>$('modalBackdrop').classList.remove('show');$('modalBackdrop').onclick=e=>{if(e.target===$('modalBackdrop'))$('modalBackdrop').classList.remove('show')};
$('recordForm').onsubmit=e=>{e.preventDefault();let type=e.target.dataset.type,fd=new FormData(e.target),v=Object.fromEntries(fd.entries());for(let k of ['odo','cost','litres','remaining','tank','efficiency','serviceInterval','next'])if(v[k]!==undefined&&v[k]!=='')v[k]=Number(v[k]);
 if(type==='odo'){db.odo=Number(v.odo)}
 if(type==='settings'){db={...db,...v}}
 if(type==='fuel'){db.fuel.push(v);db.odo=Math.max(Number(db.odo||0),Number(v.odo||0));db.remaining=v.remaining!==''?Number(v.remaining):Math.min(Number(db.tank),Number(db.remaining||0)+Number(v.litres||0))}
 if(type==='expense'){db.expenses.push(v);db.odo=Math.max(Number(db.odo||0),Number(v.odo||0))}
 if(type==='service'){db.services.push(v);db.odo=Math.max(Number(db.odo||0),Number(v.odo||0));db.lastServiceOdo=Number(v.odo||db.odo);db.serviceInterval=Number(v.next||5000)}
 save();$('modalBackdrop').classList.remove('show');toast('Record saved successfully')};
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.remove('active'));if(b.closest('.bottom-nav'))b.classList.add('active');let tab=b.dataset.tab;if(tab!=='home'){toast(tab==='fuel-tab'?'Use “Add fuel” to log a fill-up':tab==='maintenance'?'Use “Service log” to record maintenance':tab==='expenses'?'Use “Add expense” to record spending':'Recent records are shown on the dashboard');if(tab==='fuel-tab')openModal('fuel');if(tab==='maintenance')openModal('service');if(tab==='expenses')openModal('expense')}else window.scrollTo({top:0,behavior:'smooth'})}));
render();
