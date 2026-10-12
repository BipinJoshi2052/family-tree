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
  json:sv('<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"/>'),
  trash:sv('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'),
  out:sv('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
  dl:sv('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),
  star:sv('<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',16),
  more:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  globe:sv('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',18),
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
const clone=o=>JSON.parse(JSON.stringify(o));
function toast(msg,g){ const $t=$(`<div class="ntoast" style="--c:${g==="female"?"var(--female)":g==="danger"?"var(--danger)":g==="ok"?"var(--ok)":"var(--male)"}">${esc(msg)}</div>`).appendTo("#toasts"); setTimeout(()=>$t.fadeOut(300,()=>$t.remove()),3200); }
function copyText(text,$fallback,okMsg){
  const ok=()=>toast(okMsg||"Copied.","ok");
  const fb=()=>{ if($fallback){ $fallback.trigger("select"); toast("Copy was blocked here. The link is selected so you can copy it yourself."); } else toast("Copy was blocked in this view."); };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok,fb); else fb(); }catch(_){ fb(); }
}
const emailOk=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/* tiny sessionStorage helpers: carry UI-only state (active dashboard tab, filters) across the
   page navigations between trees.html-equivalent and editor.html-equivalent views */
function ssGet(k,def){ try{ const v=sessionStorage.getItem(k); return v===null?def:v; }catch(_){ return def; } }
function ssSet(k,v){ try{ sessionStorage.setItem(k,v); }catch(_){} }
function ssDel(k){ try{ sessionStorage.removeItem(k); }catch(_){} }

/* ======================= CURRENT USER / SETTINGS ======================= */
/* Populated once per page load via Api.settings.get() (see trees.js / editor.js boot). */
let AppSettings={ name:"", email:"", color:"", name_ne:"", ne:false };
const neOn=()=>!!AppSettings.ne;
function applyLangPrefs(){ document.body.classList.toggle("ne-on",neOn()); $("#langNe").prop("checked",neOn()); }

/* Sentinel value for "no uploaded photo - draw a generated placeholder portrait instead". */
const A="@auto";

/* A person's `img` is either a storage-relative path we uploaded ("images/<user id>/<person id>.jpg"),
   the "@auto" placeholder sentinel, a plain URL/data-URI (from an imported JSON file), or empty. */
/* `v` busts the browser cache when a photo is replaced - the stored path is always the same
   images/<user id>/<person id>.jpg regardless of how many times the photo's been changed, so
   without a version the browser just keeps showing whatever it first fetched for that URL. */
const imgUrl=(path,v)=>"/storage/"+path.split("/").map(encodeURIComponent).join("/")+(v?`?v=${v}`:"");

/* tree-card generation numbering + collaborator avatar stack: used by trees.js (My trees cards)
   and editor.js (its own layout generations + header collaborator stack) */
function gensOf(people){
  const by={}; people.forEach(p=>by[p.id]=p); const g={}; people.forEach(p=>g[p.id]=0);
  for(let it=0;it<60;it++){ let ch=false; people.forEach(p=>{ [p.fid,p.mid].forEach(par=>{ if(par&&by[par]){ if(g[p.id]<g[par]+1){g[p.id]=g[par]+1;ch=true;} if(g[par]<g[p.id]-1){g[par]=g[p.id]-1;ch=true;} } }); (p.pids||[]).forEach(q=>{ if(by[q]&&g[q]<g[p.id]){g[q]=g[p.id];ch=true;} }); }); if(!ch) break; }
  const mn=Math.min(...Object.values(g)); people.forEach(p=>g[p.id]-=mn); return g;
}
function stack(cols,max=4){ const a=cols.filter(c=>c.status!=="removed"); return `<div class="stack">${a.slice(0,max).map(c=>uav(c)).join("")}${a.length>max?`<span class="uav more">+${a.length-max}</span>`:""}</div>`; }

/* Square-crop an uploaded photo client-side (just for an instant preview + a reasonably-sized
   upload); the server re-crops/compresses its own stored copy, so this doesn't need to produce
   multiple sizes. */
function cropPhoto(file,size=800){ return new Promise((res,rej)=>{ const rd=new FileReader(); rd.onerror=()=>rej(rd.error);
  rd.onload=()=>{ const im=new Image(); im.onerror=()=>rej(new Error("That file isn't an image this browser can read."));
    im.onload=()=>{ const m=Math.min(im.width,im.height), s=Math.min(size,m), c=document.createElement("canvas"); c.width=c.height=s;
      c.getContext("2d").drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,s,s);
      const dataUrl=c.toDataURL("image/jpeg",.88); c.toBlob(b=>res({blob:b,dataUrl}),"image/jpeg",.88); };
    im.src=rd.result; };
  rd.readAsDataURL(file); }); }
