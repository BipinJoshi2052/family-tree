"use strict";
document.documentElement.setAttribute("data-bs-theme","dark");

/* ======================= ICONS ======================= */
const sv=(d,w=16)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I={
  trees:sv('<rect x="3" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="3" width="7" height="6" rx="1.5"/><rect x="8.5" y="15" width="7" height="6" rx="1.5"/><path d="M6.5 9v3h11V9M12 12v3"/>',20),
  shared:sv('<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><circle cx="17" cy="7" r="3"/><path d="M18 14c2.5.5 4 2.3 4 5"/>',20),
  act:sv('<path d="M3 12h4l3-8 4 16 3-8h4"/>',20),
  gear:sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  open:sv('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
  edit:sv('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  copy:sv('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  link:sv('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
  invite:sv('<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M19 8v6M16 11h6"/>'),
  json:sv('<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"/>'),
  trash:sv('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'),
  leave:sv('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
  out:sv('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
  play:sv('<path d="M5 3l14 9-14 9z"/>'),
  folder:sv('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',18),
  dl:sv('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),
  up:sv('<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>'),
  star:sv('<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',16),
  more:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  globe:sv('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',18),
  lock:sv('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',18),
  eye:sv('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',18),
  eyeOff:sv('<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',18)
};
// inject icons into static markup placeholders
document.querySelectorAll('[data-eye]').forEach(b=>b.innerHTML=I.eye);
document.querySelectorAll('.dropdown-menu').forEach(el=>{ el.innerHTML=el.innerHTML.replace(/\$\{I\.(\w+)\}/g,(m,k)=>I[k]||""); });

/* ======================= HELPERS ======================= */
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt=d=>{ if(!d) return ""; const [y,m,dd]=d.split("-"); return m? `${+dd} ${MON[+m-1]} ${y}` : y; };
const yr=d=>d?d.slice(0,4):"";
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const UCOL=["#039be5","#fb8c00","#7e57c2","#26a69a","#ec407a","#5c6bc0","#8d6e63","#43a047"];
const initials=n=>String(n||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
const uav=(u,cls="")=>`<span class="uav ${cls}" style="background:${u.color||UCOL[hash(u.email||u.name)%UCOL.length]}" title="${esc(u.name||u.email)}">${esc(initials(u.name||u.email))}</span>`;
function ago(t){ const s=(Date.now()-t)/1000; if(s<60) return "just now"; const m=s/60; if(m<60) return `${Math.floor(m)} min ago`; const h=m/60; if(h<24) return `${Math.floor(h)}h ago`; const d=h/24; if(d<7) return `${Math.floor(d)}d ago`; const dt=new Date(t); return `${dt.getDate()} ${MON[dt.getMonth()]} ${dt.getFullYear()}`; }
const uid=p=>p+Date.now().toString(36)+Math.floor(Math.random()*1e5).toString(36);
const clone=o=>JSON.parse(JSON.stringify(o));
function toast(msg,g){ const $t=$(`<div class="ntoast" style="--c:${g==="female"?"var(--female)":g==="danger"?"var(--danger)":g==="ok"?"var(--ok)":"var(--male)"}">${esc(msg)}</div>`).appendTo("#toasts"); setTimeout(()=>$t.fadeOut(300,()=>$t.remove()),3200); }
function copyText(text,$fallback,okMsg){
  const ok=()=>toast(okMsg||"Link copied.","ok");
  const fb=()=>{ if($fallback){ $fallback.trigger("select"); toast("Copy was blocked here. The link is selected so you can copy it yourself."); } else toast("Copy was blocked in this view."); };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok,fb); else fb(); }catch(_){ fb(); }
}
const emailOk=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const nameFromEmail=e=>e.split("@")[0].split(/[._-]+/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(" ")||"Family member";

/* tiny sessionStorage helpers: used to carry UI state (which dashboard tab, filters) across the
   real page navigations between trees.html and editor.html */
function ssGet(k,def){ try{ const v=sessionStorage.getItem(k); return v===null?def:v; }catch(_){ return def; } }
function ssSet(k,v){ try{ sessionStorage.setItem(k,v); }catch(_){} }
function ssDel(k){ try{ sessionStorage.removeItem(k); }catch(_){} }

/* ======================= SAMPLE DATA ======================= */
const A="@auto";
const mk=(id,name,gender,birth,o={})=>Object.assign({id,name,gender,birthDate:birth||"",status:"living",birthplace:"",img:A,pids:[],bio:""},o);
function sampleWhitmore(){ return [
 mk("harold","Harold Whitmore","male","1921-03-14",{deathDate:"1994-11-02",status:"deceased",birthplace:"Bristol, England",pids:["margaret","clara"],bio:"Merchant navy radio officer who settled ashore in 1949 and ran a hardware shop for thirty years. Widowed young, he remarried in 1960."}),
 mk("margaret","Margaret Ellis","female","1924-07-30",{deathDate:"1958-02-19",status:"deceased",birthplace:"Bath, England",pids:["harold"],bio:"Schoolteacher and church organist. Died at 33, leaving Harold with Robert and Alice."}),
 mk("clara","Clara Benton","female","1930-05-08",{deathDate:"2011-09-23",status:"deceased",birthplace:"Cardiff, Wales",img:"",pids:["harold"],bio:"Bookkeeper who became Harold's second wife and the family's keeper of photo albums."}),
 mk("thomas","Thomas Reed","male","1922-01-11",{deathDate:"1960-08-04",status:"deceased",birthplace:"Plymouth, England",pids:["eleanor"],bio:"Dockyard engineer at Devonport."}),
 mk("eleanor","Eleanor Vance","female","1926-10-02",{deathDate:"2015-04-17",status:"deceased",birthplace:"Exeter, England",pids:["thomas","walter"],bio:"Ward sister in Exeter. Married Thomas Reed until his death, then Walter Hayes in 1962."}),
 mk("walter","Walter Hayes","male","1925-12-19",{deathDate:"2003-06-30",status:"deceased",birthplace:"Truro, England",img:"",pids:["eleanor"],bio:"Postmaster in Truro and a keen sailor."}),
 mk("robert","Robert Whitmore","male","1947-09-05",{deathDate:"2018-01-27",status:"deceased",birthplace:"Bristol, England",fid:"harold",mid:"margaret",pids:["helen"],bio:"Civil engineer on the Severn Bridge maintenance team."}),
 mk("alice","Alice Whitmore","female","1950-04-22",{birthplace:"Bristol, England",fid:"harold",mid:"margaret",bio:"Retired midwife living in Bath."}),
 mk("sofia","Sofia Marín","female","1963-08-14",{birthplace:"Valencia, Spain",pids:["daniel"],bio:"Translator. Married Daniel in 1988; divorced 1994."}),
 mk("daniel","Daniel Whitmore","male","1962-06-01",{birthplace:"Bristol, England",fid:"harold",mid:"clara",pids:["sofia","nadia"],bio:"Architect in London with two marriages and three children."}),
 mk("nadia","Nadia Karim","female","1968-11-29",{birthplace:"Manchester, England",pids:["daniel"],bio:"Paediatrician. Married Daniel in 1996."}),
 mk("grace","Grace Whitmore","female","1965-03-17",{birthplace:"Bristol, England",img:"",fid:"harold",mid:"clara",bio:"Marine biologist based in Aberdeen."}),
 mk("helen","Helen Reed","female","1949-12-09",{deathDate:"2020-05-12",status:"deceased",birthplace:"Plymouth, England",fid:"thomas",mid:"eleanor",pids:["robert"],bio:"Primary school headteacher who joined the Reed and Whitmore lines."}),
 mk("james","James Reed","male","1953-07-21",{birthplace:"Plymouth, England",fid:"thomas",mid:"eleanor",pids:["linda"],bio:"Harbour master at Newlyn."}),
 mk("linda","Linda Cho","female","1957-01-30",{birthplace:"Vancouver, Canada",img:"",pids:["james"],bio:"Landscape painter in St Ives."}),
 mk("mark","Mark Finley","male","1961-04-04",{birthplace:"Swansea, Wales",img:"",pids:["ruth"],bio:"Sound engineer; Ruth's first husband."}),
 mk("ruth","Ruth Hayes","female","1964-02-26",{birthplace:"Truro, England",fid:"walter",mid:"eleanor",pids:["mark","samuel"],bio:"Solicitor in Exeter, married twice, with a child from each marriage."}),
 mk("samuel","Samuel Ortiz","male","1960-10-13",{birthplace:"Seville, Spain",pids:["ruth"],bio:"Chef and restaurant owner."}),
 mk("michael","Michael Whitmore","male","1974-05-19",{birthplace:"Bristol, England",fid:"robert",mid:"helen",pids:["anna"],bio:"Software developer and the family's amateur genealogist."}),
 mk("anna","Anna Novak","female","1976-09-03",{birthplace:"Brno, Czechia",pids:["michael"],bio:"Violinist with the Bristol Philharmonic."}),
 mk("sarah","Sarah Whitmore","female","1977-11-11",{birthplace:"Bristol, England",img:"",fid:"robert",mid:"helen",bio:"Journalist in Edinburgh."}),
 mk("lucas","Lucas Whitmore","male","1990-02-08",{birthplace:"London, England",fid:"daniel",mid:"sofia",pids:["priya"],bio:"Product designer who grew up between London and Valencia."}),
 mk("priya","Priya Shah","female","1991-07-14",{birthplace:"Leicester, England",pids:["lucas"],bio:"Data scientist."}),
 mk("leila","Leila Whitmore","female","1998-03-02",{birthplace:"London, England",fid:"daniel",mid:"nadia",bio:"Medical student at King's College London."}),
 mk("omar","Omar Whitmore","male","2001-12-20",{birthplace:"London, England",img:"",fid:"daniel",mid:"nadia",bio:"Studying aeronautical engineering in Southampton."}),
 mk("jordan","Jordan Reed","male","1985-08-08",{birthplace:"Penzance, England",fid:"james",mid:"linda",bio:"Illustrator and printmaker."}),
 mk("chloe","Chloe Finley","female","1990-01-15",{birthplace:"Exeter, England",fid:"mark",mid:"ruth",bio:"Primary school teacher."}),
 mk("diego","Diego Ortiz","male","1996-05-27",{birthplace:"Exeter, England",img:"",fid:"samuel",mid:"ruth",bio:"Sous chef in his father's restaurant."}),
 mk("oliver","Oliver Whitmore","male","2008-04-12",{birthplace:"Bristol, England",fid:"michael",mid:"anna",bio:"Plays cello and county-level rugby."}),
 mk("mia","Mia Whitmore","female","2011-10-30",{birthplace:"Bristol, England",img:"",fid:"michael",mid:"anna",bio:"Keeps a notebook of every comet sighting."}),
 mk("aarav","Aarav Whitmore","male","2021-09-09",{birthplace:"London, England",fid:"lucas",mid:"priya",bio:"The youngest member of the family."})
];}
const sOrtiz=()=>[
 mk("samuel","Samuel Ortiz","male","1960-10-13",{birthplace:"Seville, Spain",pids:["ruth"]}), mk("ruth","Ruth Hayes","female","1964-02-26",{birthplace:"Truro, England",pids:["samuel"]}),
 mk("diego","Diego Ortiz","male","1996-05-27",{fid:"samuel",mid:"ruth",pids:["leila2"],birthplace:"Exeter, England"}), mk("leila2","Leila Haddad","female","1997-02-08",{pids:["diego"],birthplace:"Beirut, Lebanon"}),
 mk("noah","Noah Ortiz","male","2022-01-30",{fid:"diego",mid:"leila2",img:""}), mk("nora","Nora Ortiz","female","2024-04-17",{fid:"diego",mid:"leila2"})];
const sShrestha=()=>[
 mk("ram","Ram Bahadur Shrestha","male","1938-04-13",{nameNe:"राम बहादुर श्रेष्ठ",status:"deceased",deathDate:"2009-11-02",birthplace:"Kathmandu, Nepal",pids:["sita"],bio:"Ran a cloth shop in Asan for forty years."}),
 mk("sita","Sita Shrestha","female","1942-08-21",{nameNe:"सीता श्रेष्ठ",status:"deceased",deathDate:"2016-02-14",birthplace:"Bhaktapur, Nepal",pids:["ram"],bio:"Known across the tole for her yomari at Yomari Punhi."}),
 mk("hari","Hari Shrestha","male","1962-01-30",{nameNe:"हरि श्रेष्ठ",birthplace:"Kathmandu, Nepal",fid:"ram",mid:"sita",pids:["gita"],bio:"Took over the family shop and added a second branch in Patan."}),
 mk("gita","Gita Shrestha","female","1966-06-09",{nameNe:"गीता श्रेष्ठ",birthplace:"Bhaktapur, Nepal",pids:["hari"],img:""}),
 mk("laxmi","Laxmi Maharjan","female","1965-10-17",{nameNe:"लक्ष्मी महर्जन",birthplace:"Kathmandu, Nepal",fid:"ram",mid:"sita",pids:["binod"],bio:"Secondary school teacher in Lalitpur."}),
 mk("binod","Binod Maharjan","male","1960-03-05",{nameNe:"विनोद महर्जन",birthplace:"Lalitpur, Nepal",pids:["laxmi"],img:""}),
 mk("anish","Anish Shrestha","male","1990-12-01",{nameNe:"अनिश श्रेष्ठ",birthplace:"Kathmandu, Nepal",fid:"hari",mid:"gita",pids:["priyanka"],bio:"Software engineer; keeps this tree up to date."}),
 mk("priyanka","Priyanka Rai","female","1992-05-22",{birthplace:"Dharan, Nepal",pids:["anish"],bio:"No Nepali name added yet, so her English name shows in Nepali view."}),
 mk("sujata","Sujata Shrestha","female","1994-09-14",{nameNe:"सुजाता श्रेष्ठ",birthplace:"Kathmandu, Nepal",fid:"hari",mid:"gita"}),
 mk("rohan","Rohan Maharjan","male","1988-07-07",{nameNe:"रोहन महर्जन",birthplace:"Lalitpur, Nepal",fid:"binod",mid:"laxmi",img:""}),
 mk("aarya","Aarya Shrestha","female","2020-02-29",{birthplace:"Kathmandu, Nepal",fid:"anish",mid:"priyanka"})];
const sNovak=()=>[mk("pavel","Pavel Novak","male","1948-05-02",{pids:["jana"],birthplace:"Brno, Czechia"}),mk("jana","Jana Novak","female","1950-09-14",{pids:["pavel"],img:"",birthplace:"Olomouc, Czechia"}),mk("anna","Anna Novak","female","1976-09-03",{fid:"pavel",mid:"jana",birthplace:"Brno, Czechia"})];
const sKarim=()=>[mk("hassan","Hassan Karim","male","1945-03-21",{pids:["amina"],status:"deceased",deathDate:"2019-12-01",birthplace:"Lahore, Pakistan"}),mk("amina","Amina Karim","female","1948-07-11",{pids:["hassan"],birthplace:"Lahore, Pakistan"}),
 mk("nadia","Nadia Karim","female","1968-11-29",{fid:"hassan",mid:"amina",birthplace:"Manchester, England"}),mk("tariq","Tariq Karim","male","1971-02-15",{fid:"hassan",mid:"amina",pids:["sana"],img:""}),mk("sana","Sana Malik","female","1974-06-30",{pids:["tariq"]}),mk("yusuf","Yusuf Karim","male","2005-10-09",{fid:"tariq",mid:"sana"})];
const sShah=()=>[mk("raj","Raj Shah","male","1960-01-12",{pids:["meera"],birthplace:"Ahmedabad, India"}),mk("meera","Meera Shah","female","1963-08-04",{pids:["raj"],birthplace:"Leicester, England"}),
 mk("priya","Priya Shah","female","1991-07-14",{fid:"raj",mid:"meera",pids:["lucas"]}),mk("arjun","Arjun Shah","male","1994-03-28",{fid:"raj",mid:"meera",img:""}),mk("lucas","Lucas Whitmore","male","1990-02-08",{pids:["priya"]}),mk("aarav","Aarav Whitmore","male","2021-09-09",{fid:"lucas",mid:"priya"})];
const sFinley=()=>[mk("mark","Mark Finley","male","1961-04-04",{pids:["ruth","jo"],img:""}),mk("ruth","Ruth Hayes","female","1964-02-26",{pids:["mark"]}),mk("jo","Jo Price","female","1966-12-19",{pids:["mark"]}),mk("chloe","Chloe Finley","female","1990-01-15",{fid:"mark",mid:"ruth"}),mk("ben","Ben Finley","male","1996-06-06",{fid:"mark",mid:"jo",img:""})];

const H=3600e3, D=24*H;
/* Tree <-> JSON file. Each tree is saved as "<Tree name>.json" in the trees folder. */
function treeToFile(t){
  const iso=v=>new Date(v||Date.now()).toISOString();
  const o={app:"Family Tree",version:1,id:t.id,name:t.name,role:t.role||"owner"};
  if(o.role!=="owner"&&t.owner) o.owner={name:t.owner.name,email:t.owner.email};
  Object.assign(o,{created:iso(t.created),updated:iso(t.updated),starred:!!t.starred,access:t.access||"private",defaultLang:t.defaultLang==="ne"?"ne":"en",
    collaborators:(t.collaborators||[]).map(c=>{ const r={name:c.name,email:c.email,role:c.role,status:c.status||"active"}; if(c.me) r.me=true; return r; }),
    people:t.people.map(p=>{ const r={}; Object.keys(p).forEach(k=>{ if(k[0]!=="_") r[k]=p[k]; }); return r; })});
  return JSON.stringify(o,null,2)+"\n";
}
const safeName=n=>(String(n||"").replace(/[\\/:*?"<>|\u0000-\u001f]/g,"-").replace(/\s+/g," ").trim().replace(/^\.+/,"").slice(0,120))||"Untitled tree";
function seedTrees(user){
  const now=Date.now();
  const me={name:user.name,email:user.email,role:"owner",status:"active",color:user.color,me:true};
  const P=(name,email,role,status="active")=>({name,email,role,status});
  return {
    trees:[
      {id:"t-whitmore",name:"Whitmore-Reed Family",role:"owner",created:now-120*D,updated:now-2*H,starred:true,access:"private",people:sampleWhitmore(),
        collaborators:[me,P("Anna Novak","anna.novak@example.com","editor"),P("Sarah Whitmore","sarah.w@example.com","viewer"),P("Lucas Whitmore","lucas.w@example.com","editor","invited")]},
      {id:"t-ortiz",name:"Ortiz Family",role:"owner",created:now-40*D,updated:now-3*D,starred:false,access:"link",people:sOrtiz(),collaborators:[me,P("Diego Ortiz","diego@example.com","editor")]},
      {id:"t-shrestha",name:"Shrestha Family",role:"owner",created:now-20*D,updated:now-1*H,starred:true,access:"private",defaultLang:"ne",people:sShrestha(),
        collaborators:[me,P("Anish Shrestha","anish.shrestha@example.com","editor")]},
      {id:"t-novak",name:"Novak side (draft)",role:"owner",created:now-9*D,updated:now-9*D,starred:false,access:"private",people:sNovak(),collaborators:[me]}
    ],
    shared:[
      {id:"t-karim",name:"Karim Family",owner:{name:"Nadia Karim",email:"nadia.karim@example.com"},role:"editor",created:now-60*D,updated:now-5*H,starred:false,access:"private",people:sKarim(),
        collaborators:[{name:"Nadia Karim",email:"nadia.karim@example.com",role:"owner",status:"active"},Object.assign({},me,{role:"editor"})]},
      {id:"t-shah",name:"Shah Family",owner:{name:"Priya Shah",email:"priya.shah@example.com"},role:"viewer",created:now-30*D,updated:now-6*D,starred:false,access:"link",people:sShah(),
        collaborators:[{name:"Priya Shah",email:"priya.shah@example.com",role:"owner",status:"active"},Object.assign({},me,{role:"viewer"})]}
    ]};
}
function seed(user){
  const now=Date.now();
  return {
    trees:[], shared:[],
    incoming:[
      {id:"t-finley",name:"Finley Family",owner:{name:"Mark Finley",email:"mark.finley@example.com"},role:"editor",sent:now-20*H,message:"Could you add your side of the Hayes family? You know the dates better than I do.",people:sFinley()}
    ],
    activity:[
      {t:now-2*H,kind:"people",tree:"Whitmore-Reed Family",who:"Anna Novak",text:"added <b>Mia Whitmore</b> as daughter of Michael Whitmore"},
      {t:now-5*H,kind:"people",tree:"Karim Family",who:"Nadia Karim",text:"added <b>Yusuf Karim</b> as son of Tariq Karim"},
      {t:now-20*H,kind:"sharing",tree:"Finley Family",who:"Mark Finley",text:"invited you to edit <b>Finley Family</b>"},
      {t:now-1*D-3*H,kind:"sharing",tree:"Whitmore-Reed Family",who:"You",text:"invited <b>Lucas Whitmore</b> as an editor"},
      {t:now-3*D,kind:"people",tree:"Ortiz Family",who:"Diego Ortiz",text:"added <b>Nora Ortiz</b> as daughter of Diego Ortiz"},
      {t:now-9*D,kind:"tree",tree:"Novak side (draft)",who:"You",text:"created <b>Novak side (draft)</b>"}
    ]
  };
}

/* ======================= STATE ======================= */
const KEY="family-tree-app-v1";
let S;
function load(){ try{ const r=localStorage.getItem(KEY); S=r?JSON.parse(r):null; }catch(_){ S=null; } if(!S||typeof S!=="object") S={onboarded:false,user:null,data:null}; }
function persist(){ try{ localStorage.setItem(KEY,JSON.stringify(S,(k,v)=>k[0]==="_"?undefined:v)); }catch(_){} }
load();
function logAct(kind,tree,text){ S.data.activity.unshift({t:Date.now(),kind,tree,who:"You",text}); S.data.activity=S.data.activity.slice(0,60); }
function findTree(id){ const d=S.data; let t=d.trees.find(x=>x.id===id); if(t) return {t,mine:true}; t=d.shared.find(x=>x.id===id); return t?{t,mine:false}:null; }
function syncMe(){ [...S.data.trees,...S.data.shared].forEach(t=>t.collaborators.forEach(c=>{ if(c.me){ c.name=S.user.name; c.email=S.user.email; c.color=S.user.color; } })); }
const meRow=(role="owner")=>({name:S.user.name,email:S.user.email,color:S.user.color,role,status:"active",me:true});

/* tree-card generation numbering + collaborator avatar stack: used by trees.js (My trees / Shared
   cards) AND by editor.js (its own layout generations + header collaborator stack) */
function gensOf(people){
  const by={}; people.forEach(p=>by[p.id]=p); const g={}; people.forEach(p=>g[p.id]=0);
  for(let it=0;it<60;it++){ let ch=false; people.forEach(p=>{ [p.fid,p.mid].forEach(par=>{ if(par&&by[par]){ if(g[p.id]<g[par]+1){g[p.id]=g[par]+1;ch=true;} if(g[par]<g[p.id]-1){g[par]=g[p.id]-1;ch=true;} } }); (p.pids||[]).forEach(q=>{ if(by[q]&&g[q]<g[p.id]){g[q]=g[p.id];ch=true;} }); }); if(!ch) break; }
  const mn=Math.min(...Object.values(g)); people.forEach(p=>g[p.id]-=mn); return g;
}
function stack(cols,max=4){ const a=cols.filter(c=>c.status!=="removed"); return `<div class="stack">${a.slice(0,max).map(c=>uav(c)).join("")}${a.length>max?`<span class="uav more">+${a.length-max}</span>`:""}</div>`; }

/* ======================= DATA FOLDER (JSON files on this device) ======================= */
/* IndexedDB: "kv" store keeps the remembered trees-folder directory handle; "imgcache" caches
   photo blobs so reopening the app (or navigating editor.html<->trees.html) never re-reads a
   photo from the folder it already has - only Img.save()/Img.remove() invalidate an entry. */
const IDB={
  open(){ return new Promise((res,rej)=>{ const r=indexedDB.open("family-tree-app",2);
    r.onupgradeneeded=()=>{ const db=r.result; if(!db.objectStoreNames.contains("kv")) db.createObjectStore("kv"); if(!db.objectStoreNames.contains("imgcache")) db.createObjectStore("imgcache"); };
    r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); },
  async get(k){ try{ const db=await this.open(); return await new Promise((res,rej)=>{ const q=db.transaction("kv").objectStore("kv").get(k); q.onsuccess=()=>res(q.result); q.onerror=()=>rej(q.error); }); }catch(_){ return undefined; } },
  async set(k,v){ try{ const db=await this.open(); await new Promise((res,rej)=>{ const tx=db.transaction("kv","readwrite"); tx.objectStore("kv").put(v,k); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }catch(_){} },
  async del(k){ try{ const db=await this.open(); await new Promise((res,rej)=>{ const tx=db.transaction("kv","readwrite"); tx.objectStore("kv").delete(k); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }catch(_){} },
  async getImg(k){ try{ const db=await this.open(); return await new Promise(res=>{ const q=db.transaction("imgcache").objectStore("imgcache").get(k); q.onsuccess=()=>res(q.result||null); q.onerror=()=>res(null); }); }catch(_){ return null; } },
  async setImg(k,blob){ try{ const db=await this.open(); await new Promise(res=>{ const tx=db.transaction("imgcache","readwrite"); tx.objectStore("imgcache").put(blob,k); tx.oncomplete=res; tx.onerror=()=>res(); }); }catch(_){} },
  async delImg(k){ try{ const db=await this.open(); await new Promise(res=>{ const tx=db.transaction("imgcache","readwrite"); tx.objectStore("imgcache").delete(k); tx.oncomplete=res; tx.onerror=()=>res(); }); }catch(_){} },
  async delImgPrefix(prefix){ try{ const db=await this.open(); await new Promise(res=>{ const store=db.transaction("imgcache","readwrite").objectStore("imgcache"); const q=store.openKeyCursor();
    q.onsuccess=()=>{ const c=q.result; if(!c){ res(); return; } if(String(c.key).startsWith(prefix)) store.delete(c.key); c.continue(); }; q.onerror=()=>res(); }); }catch(_){} }
};
const Store={
  // mode: folder = reading & writing JSON files; server = reading trees/ over http (changes stay in browser);
  //       reconnect = folder known but permission needed; browser = trees kept in this browser only; none = nothing loaded yet
  mode:"none", dir:null, label:"", timers:{}, busy:false,
  canPick: typeof window.showDirectoryPicker==="function",
  all(){ return [...S.data.trees,...S.data.shared]; },
  fileName(t){ const base=safeName(t.name); const taken=new Set(this.all().filter(x=>x!==t).map(x=>x._file).filter(Boolean).map(x=>x.toLowerCase()));
    let n=base+".json", i=2; while(taken.has(n.toLowerCase())) n=`${base} (${i++}).json`; return n; },
  fromFile(o,fname){
    if(!o||typeof o!=="object"||!Array.isArray(o.people)) return null;
    const role=["owner","editor","viewer"].includes(o.role)?o.role:"owner";
    const people=o.people.filter(p=>p&&p.id&&p.name).map(p=>Object.assign({gender:"male",status:"living",pids:[],img:""},p,{pids:Array.isArray(p.pids)?p.pids:[]}));
    if(!people.length) people.push(mk("root","Unnamed person","male","",{img:""}));
    const t={id:o.id||uid("t-"),name:o.name||fname.replace(/\.json$/i,""),role,created:Date.parse(o.created)||Date.now(),updated:Date.parse(o.updated)||Date.now(),
      starred:!!o.starred,access:o.access==="link"?"link":"private",defaultLang:o.defaultLang==="ne"?"ne":"en",people,collaborators:Array.isArray(o.collaborators)?o.collaborators:[],_file:fname};
    if(role!=="owner") t.owner=o.owner||{name:"Unknown owner",email:""};
    if(!t.collaborators.some(c=>c.me)) t.collaborators.push(meRow(role));
    return t;
  },
  assign(trees){
    const ids=new Set(); trees=trees.filter(t=>{ if(ids.has(t.id)) t.id=uid("t-"); ids.add(t.id); return true; });
    S.data.trees=trees.filter(t=>t.role==="owner").sort((a,b)=>b.updated-a.updated);
    S.data.shared=trees.filter(t=>t.role!=="owner").sort((a,b)=>b.updated-a.updated);
    S.data.incoming=S.data.incoming.filter(i=>!ids.has(i.id));
    syncMe();
  },
  /* Full probe: reads every file in the linked folder (or trees/index.json over http) and shows a
     toast. Used once per browser-tab session (see ssGet("storeInited")), not on every page load -
     otherwise bouncing between trees.html and editor.html would re-show that toast constantly. */
  async init(){
    const h=await IDB.get("dir");
    if(h){ this.dir=h; this.label=h.name; let p="prompt"; try{ p=await h.queryPermission({mode:"readwrite"}); }catch(_){}
      if(p==="granted"){ try{ await this.loadDir(false); return; }catch(_){} }
      this.mode="reconnect"; return; }
    if(await this.loadServer()) return;
    this.mode=this.all().length?"browser":"none";
  },
  /* Light re-attach: silently restores dir/mode from the remembered handle (no file re-reads, no
     toast). Used on every page load after the first one this session, so write access (autosave,
     photos) still works after navigating, without re-announcing "Loaded N trees" each time. */
  async reattach(){
    const h=await IDB.get("dir");
    if(h){ this.dir=h; this.label=h.name; let p="prompt"; try{ p=await h.queryPermission({mode:"readwrite"}); }catch(_){}
      this.mode = p==="granted" ? "folder" : "reconnect"; return; }
    this.mode = ssGet("storeServer",null)==="1" ? "server" : (this.all().length?"browser":"none");
  },
  async connect(){
    if(!this.canPick){ toast("This browser can't open folders. Use Chrome or Edge, or import the JSON files instead.","female"); return; }
    let h; try{ h=await window.showDirectoryPicker({id:"family-tree-data",mode:"readwrite"}); }
    catch(e){ if(e&&e.name!=="AbortError") toast("Couldn't open that folder: "+(e.message||e),"danger"); return; }
    try{ h=await h.getDirectoryHandle("trees"); }catch(_){}   // picked the project folder: use its trees/ subfolder
    this.dir=h; this.label=h.name; await IDB.set("dir",h);
    await this.loadDir(true);
    logAct("tree",h.name,`linked the <b>${esc(h.name)}</b> folder`); persist(); refreshViews();
  },
  async reconnect(){
    if(!this.dir) return this.connect();
    try{ const p=await this.dir.requestPermission({mode:"readwrite"}); if(p!=="granted"){ toast("Permission wasn't granted, so the app can't read the folder.","female"); return; }
      await this.loadDir(false); refreshViews(); }catch(e){ toast("Couldn't reconnect: "+(e.message||e),"danger"); }
  },
  async loadDir(fromPick){
    const trees=[], bad=[];
    for await (const [name,fh] of this.dir.entries()){
      if(fh.kind!=="file"||!/\.json$/i.test(name)||name.toLowerCase()==="index.json") continue;
      try{ const t=this.fromFile(JSON.parse(await (await fh.getFile()).text()),name); if(t) trees.push(t); else bad.push(name); }catch(_){ bad.push(name); }
    }
    this.mode="folder";
    if(!trees.length&&fromPick&&this.all().length){
      const list=this.all(); list.forEach(t=>t._file=null);
      for(const t of list) await this.write(t);
      await this.writeIndex();
      toast(`The folder was empty, so your ${list.length} trees were saved into it as JSON files.`,"ok");
    } else {
      this.assign(trees); persist();
      toast(`Loaded ${trees.length} ${trees.length===1?"tree":"trees"} from “${this.label}”.`,"ok");
    }
    if(bad.length) toast(`Skipped ${bad.join(", ")}: not a family tree file.`,"female");
  },
  async loadServer(){
    try{
      const r=await fetch("trees/index.json",{cache:"no-store"}); if(!r.ok) return false;
      const idx=await r.json(), list=Array.isArray(idx)?idx:(idx.trees||[]), trees=[];
      for(const f of list){ try{ const rr=await fetch("trees/"+encodeURIComponent(f),{cache:"no-store"}); if(rr.ok){ const t=this.fromFile(await rr.json(),f); if(t) trees.push(t); } }catch(_){} }
      if(!trees.length) return false;
      this.assign(trees); this.mode="server"; this.label="trees"; persist(); ssSet("storeServer","1"); return true;
    }catch(_){ return false; }
  },
  save(t){
    if(this.mode!=="folder"||!t) return;
    clearTimeout(this.timers[t.id]);
    this.timers[t.id]=setTimeout(()=>{ this.write(t).then(()=>this.writeIndex()).then(paintData).catch(e=>this.fail(e)); },250);
  },
  /* Immediate (non-debounced) write, used right before navigating away from editor.html so the
     last edit isn't lost: a real page navigation kills the 250ms debounce timer above. */
  flush(t){ if(this.mode!=="folder"||!t) return; clearTimeout(this.timers[t.id]); delete this.timers[t.id];
    this.write(t).then(()=>this.writeIndex()).then(paintData).catch(e=>this.fail(e)); },
  saveAll(){ this.all().forEach(t=>this.save(t)); },
  async write(t){
    let name=this.fileName(t), fh; const old=t._file;
    try{ fh=await this.dir.getFileHandle(name,{create:true}); }
    catch(e){ // some file systems reject accents or dashes in names: fall back to plain letters
      const alt=name.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[–—]/g,"-").replace(/[^\x20-\x7e]/g,"");
      if(alt===name||!alt.replace(/\.json$/i,"").trim()) throw e; name=alt; fh=await this.dir.getFileHandle(name,{create:true}); }
    const w=await fh.createWritable(); await w.write(treeToFile(t)); await w.close();
    t._file=name;
    if(old&&old!==name){ try{ await this.dir.removeEntry(old); }catch(_){} }
  },
  async remove(t){
    if(this.mode!=="folder"||!t._file) return; clearTimeout(this.timers[t.id]);
    try{ await this.dir.removeEntry(t._file); await this.writeIndex(); paintData(); }catch(e){ this.fail(e); }
  },
  async writeIndex(){
    const files=this.all().map(t=>t._file).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    const fh=await this.dir.getFileHandle("index.json",{create:true}); const w=await fh.createWritable();
    await w.write(JSON.stringify({app:"Family Tree",note:"List of the tree files in this folder. The app keeps it up to date.",trees:files},null,2)+"\n"); await w.close();
  },
  fail(e){
    if(e&&(e.name==="NotAllowedError"||e.name==="SecurityError")){ this.mode="reconnect"; paintData(); toast("The app lost permission to the folder. Reconnect it to keep saving.","danger"); }
    else toast("Couldn't save to the folder: "+((e&&e.message)||e),"danger");
  },
  async disconnect(){ await IDB.del("dir"); this.dir=null; this.label=""; this.all().forEach(t=>t._file=null); this.mode=this.all().length?"browser":"none"; persist(); refreshViews(); toast("Folder unlinked. Your files are untouched; trees now stay in this browser."); },
  useSamples(){ const d=seedTrees(S.user); S.data.trees=d.trees; S.data.shared=d.shared; syncMe(); this.mode="browser"; persist(); refreshViews(); toast("Loaded the built-in sample trees into this browser."); },
  importFiles(files){
    const arr=[...files]; let done=0, added=0, bad=[];
    arr.forEach(f=>{ const rd=new FileReader();
      rd.onload=()=>{ try{ const t=this.fromFile(JSON.parse(rd.result),f.name); if(t){ const ex=this.all().find(x=>x.id===t.id); if(ex) t.id=uid("t-");
            (t.role==="owner"?S.data.trees:S.data.shared).unshift(t); added++; if(this.mode==="folder"){ t._file=null; this.save(t); } } else bad.push(f.name); }catch(_){ bad.push(f.name); }
        if(++done===arr.length){ if(this.mode==="none") this.mode="browser"; persist(); refreshViews(); if(added) toast(`Imported ${added} ${added===1?"tree":"trees"}.`,"ok"); if(bad.length) toast(`Skipped ${bad.join(", ")}: not a family tree file.`,"female"); } };
      rd.readAsText(f); });
  },
  download(t){
    const blob=new Blob([treeToFile(t)],{type:"application/json"}), a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download=safeName(t.name)+".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  }
};
/* Photos: an upload is square-cropped once, then compressed into two JPEGs - a ~600px "original"
   (trees/images/original/<tree id>/<person id>.jpg, shown in the Details view) and a ~160px
   "thumb" (trees/images/thumb/<tree id>/<person id>.jpg, used for every avatar in the tree view so
   rendering many nodes at once doesn't load/decode full-size images). p.img always stores the
   original's path; the thumb path is derived by swapping "/original/" for "/thumb/". Blobs read
   from the linked folder are cached in IndexedDB (see IDB.imgcache above) so reloading a page
   never re-reads a photo it already has - only Img.save()/Img.remove() invalidate the cache. */
const Img={
  mem:{}, pending:{},
  isPath:v=>typeof v==="string"&&/^images\/original\//.test(v),
  thumbPath:p=>p.replace("/original/","/thumb/"),
  resolve(path,variant){ return variant==="thumb"?this.thumbPath(path):path; },
  url(path,variant){
    const rp=this.resolve(path,variant);
    if(Store.mode==="folder"&&Store.dir){ if(this.mem[rp]) return this.mem[rp]; this.load(rp); return ""; }
    return "trees/"+rp.split("/").map(encodeURIComponent).join("/");          // served or opened from the app folder
  },
  sel:path=>`img[data-ipath="${CSS.escape(path)}"]`,
  async dirFor(parts,create){ let d=Store.dir; for(const seg of parts) d=await d.getDirectoryHandle(seg,{create:!!create}); return d; },
  async load(rp){
    if(this.pending[rp]) return; this.pending[rp]=1;
    try{
      let blob=await IDB.getImg(rp);
      if(!blob){ const parts=rp.split("/"), d=await this.dirFor(parts.slice(0,-1)); blob=await (await d.getFileHandle(parts[parts.length-1])).getFile(); IDB.setImg(rp,blob); }
      this.mem[rp]=URL.createObjectURL(blob);
      document.querySelectorAll(this.sel(rp)).forEach(i=>i.src=this.mem[rp]);
    }catch(_){ document.querySelectorAll(this.sel(rp)).forEach(i=>i.remove()); }
    delete this.pending[rp];
  },
  setCached(rp,blob){ if(this.mem[rp]) URL.revokeObjectURL(this.mem[rp]); this.mem[rp]=URL.createObjectURL(blob); IDB.setImg(rp,blob); },
  async save(treeId,personId,{originalBlob,thumbBlob}){
    const folder=safeName(treeId), name=safeName(personId)+".jpg";
    const od=await this.dirFor(["images","original",folder],true), td=await this.dirFor(["images","thumb",folder],true);
    const ow=await (await od.getFileHandle(name,{create:true})).createWritable(); await ow.write(originalBlob); await ow.close();
    const tw=await (await td.getFileHandle(name,{create:true})).createWritable(); await tw.write(thumbBlob); await tw.close();
    const path=`images/original/${folder}/${name}`, tpath=this.thumbPath(path);
    this.setCached(path,originalBlob); this.setCached(tpath,thumbBlob);
    return path;
  },
  async remove(path){ if(Store.mode!=="folder"||!this.isPath(path)) return;
    for(const rp of [path,this.thumbPath(path)]){
      try{ const parts=rp.split("/"); const d=await this.dirFor(parts.slice(0,-1)); await d.removeEntry(parts[parts.length-1]); }catch(_){}
      if(this.mem[rp]){ URL.revokeObjectURL(this.mem[rp]); delete this.mem[rp]; } IDB.delImg(rp);
    }
  },
  async removeTree(t){
    if(Store.mode!=="folder") return; const folder=safeName(t.id), pre=`images/original/${folder}/`;
    const usedElsewhere=Store.all().some(x=>x!==t&&x.people.some(p=>typeof p.img==="string"&&p.img.startsWith(pre)));
    if(usedElsewhere) return;                                              // a copy of this tree still uses these photos
    for(const base of ["original","thumb"]){ try{ const d=await this.dirFor(["images",base]); await d.removeEntry(folder,{recursive:true}); }catch(_){} }
    IDB.delImgPrefix(pre); IDB.delImgPrefix(this.thumbPath(pre));
  }
};
/* Square-crop an uploaded photo, then compress it into an "original" and a smaller "thumb" JPEG
   from the same source image (so the thumb isn't a re-compression of an already-compressed file). */
function cropPhoto(file,{originalSize=600,thumbSize=160}={}){ return new Promise((res,rej)=>{ const rd=new FileReader(); rd.onerror=()=>rej(rd.error);
  rd.onload=()=>{ const im=new Image(); im.onerror=()=>rej(new Error("That file isn't an image this browser can read."));
    im.onload=()=>{
      const m=Math.min(im.width,im.height);
      const draw=(size,q)=>{ const s=Math.min(size,m), c=document.createElement("canvas"); c.width=c.height=s;
        c.getContext("2d").drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,s,s); return {c,q}; };
      const o=draw(originalSize,.86), th=draw(thumbSize,.72);
      const dataUrl=o.c.toDataURL("image/jpeg",o.q);
      Promise.all([ new Promise(r=>o.c.toBlob(r,"image/jpeg",o.q)), new Promise(r=>th.c.toBlob(r,"image/jpeg",th.q)) ])
        .then(([blob,thumbBlob])=>res({blob,thumbBlob,dataUrl})).catch(rej);
    };
    im.src=rd.result; };
  rd.readAsDataURL(file); }); }
const neOn=()=>!!(S.prefs&&S.prefs.ne);
function applyLangPrefs(){ document.body.classList.toggle("ne-on",neOn()); $("#langNe").prop("checked",neOn()); }
function touch(t,bump=true){ if(!t) return; if(bump) t.updated=Date.now(); persist(); Store.save(t); }
function refreshViews(){ if(typeof paintShell==="function"){ paintShell(); if(typeof nav==="function") nav(curView); } paintData(); }
const MODE_UI={
  folder:   ()=>({c:"var(--ok)",title:`Saving to “${Store.label}”`,sub:`${Store.all().length} JSON ${Store.all().length===1?"file":"files"} · every change is written to your device`}),
  server:   ()=>({c:"var(--male)",title:"Reading from the trees folder",sub:"Changes stay in this browser until you link the folder so the app can write to it."}),
  reconnect:()=>({c:"var(--female)",title:`Reconnect “${Store.label}”`,sub:"Your browser needs permission again before the app can read and save your tree files."}),
  browser:  ()=>({c:"var(--female)",title:"Not linked to a folder",sub:"Trees are kept in this browser only. Link the trees folder to load and save JSON files."}),
  none:     ()=>({c:"var(--female)",title:"No tree files loaded",sub:"Link the trees folder that came with the app."})
};
function dataButtons(compact){
  const m=Store.mode, b=[];
  if(m==="reconnect") b.push(`<button class="btn btn-go btn-sm" data-action="reconnect">Reconnect folder</button>`);
  if(m!=="folder"&&m!=="reconnect") b.push(Store.canPick?`<button class="btn btn-go btn-sm" data-action="connect">Link trees folder</button>`:`<button class="btn btn-go btn-sm" data-action="import">Import JSON files</button>`);
  if(m==="folder"&&!compact) b.push(`<button class="btn btn-quiet btn-sm" data-action="connect">Choose another folder</button>`);
  if(!compact&&Store.canPick&&m!=="folder") b.push(`<button class="btn btn-quiet btn-sm" data-action="import">Import JSON files</button>`);
  if(!compact&&(m==="folder"||m==="reconnect")) b.push(`<button class="btn btn-quiet btn-sm" data-action="disconnect">Unlink folder</button>`);
  if(!compact&&Store.all().length) b.push(`<button class="btn btn-quiet btn-sm" data-action="download-all">Download all as JSON</button>`);
  return b.join("");
}
function paintData(){
  const u=MODE_UI[Store.mode]();
  $("#dataCard").css("--c",u.c).html(`<div class="dcard-h">${I.folder}<b>${Store.mode==="folder"?esc(Store.label):"Data folder"}</b><span class="dstate" title="${esc(u.title)}"></span></div>
    <span class="muted">${Store.mode==="folder"?`${Store.all().length} tree ${Store.all().length===1?"file":"files"} on this device`:esc(u.title)}</span>${Store.mode!=="folder"?`<div>${dataButtons(true)}</div>`:""}`);
  const showBanner=Store.mode!=="folder"&&!(Store.mode==="none");
  $("#dataBanner").html(showBanner?`<div class="dbanner" style="--c:${u.c}"><span class="ico">${I.folder}</span><div class="txt"><b>${esc(u.title)}</b><span>${esc(u.sub)}</span></div><div class="acts">${dataButtons(true)}</div></div>`:"");
  const files=Store.all().map(t=>t._file).filter(Boolean).sort((a,b)=>a.localeCompare(b));
  $("#dataSettings").html(`<div class="dbanner mb-3" style="--c:${u.c}"><span class="ico">${I.folder}</span><div class="txt"><b>${esc(u.title)}</b><span>${esc(u.sub)}</span></div></div>
    ${files.length?`<div class="form-label">Files</div><div class="filelist">${files.map(f=>`<span>${esc(f)}</span>`).join("")}</div>`:""}
    <div class="d-flex flex-wrap gap-2 mt-3">${dataButtons(false)}</div>
    ${Store.canPick?"":`<p class="muted small mt-3 mb-0">This browser can't link folders, so changes can't be written back to the files. Open the app in Chrome or Edge for that, or use Download to save updated files.</p>`}`);
}
