"use strict";
if(!S.user||!S.data){ location.href="login.html"; }

let curView=ssGet("curView","trees"), treeFilter=ssGet("treeFilter","all"), treeSort=ssGet("treeSort","recent"), treeQ=ssGet("treeQ",""), actFilter="all";
const NAV=[{k:"trees",label:"My trees",ico:I.trees},{k:"shared",label:"Shared with me",ico:I.shared},{k:"activity",label:"Activity",ico:I.act},{k:"settings",label:"Settings",ico:I.gear}];
function paintShell(){
  const u=S.user, d=S.data, inc=d.incoming.length;
  $("#sideNav").html(NAV.map(n=>`<button class="nav-a${curView===n.k?" on":""}" data-nav="${n.k}">${n.ico}<span>${n.label}</span>${n.k==="shared"&&inc?`<span class="cnt">${inc}</span>`:n.k==="trees"?`<span class="cnt n">${d.trees.length}</span>`:""}</button>`).join(""));
  $("#tabbar").html(NAV.map(n=>`<button class="${curView===n.k?"on":""}" data-nav="${n.k}">${n.ico}<span>${n.k==="shared"?"Shared":n.k==="trees"?"Trees":n.label}</span>${n.k==="shared"&&inc?`<span class="cnt">${inc}</span>`:""}</button>`).join(""));
  $("#meAv").replaceWith($(uav(u)).attr("id","meAv")); $("#meName").text(u.name); $("#meEmail").text(u.email);
  $("#bellDot").prop("hidden",!inc).text(inc);
  const items=[...d.incoming.map(t=>`<button class="dropdown-item" data-nav="shared" style="align-items:flex-start;white-space:normal">${uav(t.owner)}<span><b>${esc(t.owner.name)}</b> invited you to <b>${esc(t.name)}</b><small class="d-block muted">${ago(t.sent)}</small></span></button>`),
    ...d.activity.slice(0,3).map(a=>`<div class="dropdown-item" style="align-items:flex-start;white-space:normal;cursor:default"><span class="uav" style="background:var(--panel-2);color:var(--muted)">${esc(initials(a.who))}</span><span><b>${esc(a.who)}</b> ${a.text}<small class="d-block muted">${esc(a.tree)} · ${ago(a.t)}</small></span></div>`)];
  $("#bellMenu").html(`<div class="px-2 py-1 d-flex justify-content-between align-items-center"><b>Notifications</b>${inc?`<span class="pill invited">${inc} new</span>`:""}</div><hr class="dropdown-divider">${items.join("")||'<div class="px-2 py-2 muted">Nothing new.</div>'}<hr class="dropdown-divider"><button class="dropdown-item justify-content-center" data-nav="activity">See all activity</button>`);
}
function nav(k){
  curView=k; ssSet("curView",k);
  $(".view").removeClass("on"); $("#v-"+k).addClass("on");
  $("#viewTitle").text(NAV.find(n=>n.k===k).label);
  $(".hsearch input").closest(".hsearch").toggleClass("invisible",k!=="trees");
  $("#content").scrollTop(0);
  paintShell();
  ({trees:paintTrees,shared:paintShared,activity:paintActivity,settings:paintSettings})[k]();
}
$(document).on("click","[data-nav]",function(){ nav($(this).data("nav")); });

/* ---------- tree preview thumbnail ---------- */
function thumb(people){
  const g=gensOf(people), G=Math.max(0,...Object.values(g))+1, rows=[];
  for(let i=0;i<G;i++) rows.push(people.filter(p=>g[p.id]===i).sort((a,b)=>(a.birthDate||"").localeCompare(b.birthDate||"")));
  const W=300,Ht=132, top=22, step=G>1?(Ht-44)/(G-1):0; let s="";
  rows.forEach((r,i)=>{ const n=r.length, w=Math.min(26,(W-40-(n-1)*5)/n), tot=n*w+(n-1)*5, x0=(W-tot)/2, y=top+i*step;
    if(i<G-1) s+=`<path d="M${W/2},${y+6} V${y+step/2+3} M${x0+w/2},${y+step/2+3} H${W-x0-w/2}" stroke="#3a4048" stroke-width="1.2" fill="none"/>`;
    r.forEach((p,j)=>{ s+=`<rect x="${(x0+j*(w+5)).toFixed(1)}" y="${y-6}" width="${w.toFixed(1)}" height="12" rx="3" fill="${p.gender==="female"?"#fb8c00":"#039be5"}" opacity="${p.status==="deceased"?.55:1}"/>`; }); });
  return `<svg viewBox="0 0 ${W} ${Ht}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${s}</svg>`;
}
function treeMenu(t,mine){
  const it=(a,ico,l,cls="")=>`<li><button class="dropdown-item ${cls}" data-action="${a}" data-id="${t.id}">${ico}${l}</button></li>`;
  if(mine) return it("open",I.open,"Open")+it("rename",I.edit,"Rename")+it("duplicate",I.copy,"Duplicate")+'<li><hr class="dropdown-divider"></li>'+it("share",I.link,"Share")+it("invite",I.invite,"Invite people")+it("download",I.dl,"Download JSON file")+'<li><hr class="dropdown-divider"></li>'+it("delete",I.trash,"Delete","danger");
  return it("open",I.open,"Open")+it("duplicate",I.copy,"Make a copy")+it("download",I.dl,"Download JSON file")+'<li><hr class="dropdown-divider"></li>'+it("leave",I.leave,"Leave tree","danger");
}
function cardHtml(t,mine){
  const gs=gensOf(t.people), G=Math.max(0,...Object.values(gs))+1;
  const role=mine?"owner":t.role, act=t.collaborators.filter(c=>c.status==="active").length, inv=t.collaborators.filter(c=>c.status==="invited").length;
  return `<article class="tcard" data-open="${t.id}" tabindex="0" aria-label="Open ${esc(t.name)}">
    <div class="prev">${thumb(t.people)}
      <div class="corner">
        ${mine?`<button class="ibtn star${t.starred?" on":""}" data-action="star" data-id="${t.id}" aria-label="${t.starred?"Unstar":"Star"} ${esc(t.name)}" aria-pressed="${!!t.starred}">${t.starred?I.star.replace('fill="none"','fill="currentColor"'):I.star}</button>`:""}
        <div class="dropdown"><button class="ibtn" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}' aria-label="More actions for ${esc(t.name)}">${I.more}</button><ul class="dropdown-menu dropdown-menu-end">${treeMenu(t,mine)}</ul></div>
      </div>
    </div>
    <div class="body">
      <h3 class="tn">${esc(t.name)}</h3>
      <div class="meta">${t.people.length} ${t.people.length===1?"person":"people"} · ${G} ${G===1?"generation":"generations"}${!mine?` · by ${esc(t.owner.name)}`:""}</div>
      <div class="foot">${stack(t.collaborators)}<span class="pill ${role}">${role}</span>${mine&&t.access==="link"?`<span class="pill" title="Anyone with the link can view">${I.link.replace(/width="16" height="16"/,'width="11" height="11"')}Link</span>`:""}${inv?`<span class="pill invited">${inv} invited</span>`:""}${neOn()&&t.defaultLang==="ne"?`<span class="pill" lang="ne" title="Opens in Nepali">ने</span>`:""}<span class="ed">${ago(t.updated)}</span></div>
    </div></article>`;
}
function paintTrees(){
  let list=S.data.trees.slice();
  if(treeFilter==="starred") list=list.filter(t=>t.starred);
  if(treeFilter==="shared") list=list.filter(t=>t.collaborators.length>1||t.access==="link");
  if(treeQ) list=list.filter(t=>t.name.toLowerCase().includes(treeQ)||t.people.some(p=>p.name.toLowerCase().includes(treeQ)||(p.nameNe||"").includes(treeQ)));
  list.sort(treeSort==="name"?(a,b)=>a.name.localeCompare(b.name):treeSort==="size"?(a,b)=>b.people.length-a.people.length:(a,b)=>b.updated-a.updated);
  const newCard=`<button class="tcard new" data-action="new-tree"><span class="plus"><svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><b>New tree</b><small>Start from yourself or an ancestor</small></button>`;
  if(!S.data.trees.length&&(Store.mode==="none"||Store.mode==="reconnect")){
    const rc=Store.mode==="reconnect";
    $("#treeGrid").html(`<div class="connect-hero" style="grid-column:1/-1"><span class="ico" style="color:var(--male)">${I.folder.replace(/width="18" height="18"/,'width="40" height="40"')}</span>
      <h3>${rc?`Reconnect “${esc(Store.label)}”`:"Link your trees folder"}</h3>
      <p>${rc?"Your browser asks again for permission each time the app opens. Tap below and allow access to keep reading and saving your trees.":"Your family trees live as JSON files on this device, one file per tree, named after the tree. Choose the <b>trees</b> folder inside the app's folder (or the app's folder itself)."}</p>
      ${rc?"":`<div class="path">family-tree-app/\n├─ index.html\n└─ trees/\n   ├─ Whitmore-Reed Family.json\n   ├─ Ortiz Family.json\n   └─ …</div>`}
      <div class="d-flex flex-wrap gap-2 justify-content-center">${rc?`<button class="btn btn-go" data-action="reconnect">Reconnect folder</button>`:Store.canPick?`<button class="btn btn-go" data-action="connect">Link trees folder</button>`:""}<button class="btn btn-quiet" data-action="import">Import JSON files</button><button class="btn btn-quiet" data-action="samples">Use built-in samples</button></div>
      ${Store.canPick?"":`<p class="small">This browser can't link folders. Chrome or Edge can, or import the JSON files to view them here.</p>`}</div>`); return; }
  if(!S.data.trees.length){ $("#treeGrid").html(`<div class="empty" style="grid-column:1/-1"><h3>No trees yet</h3><p class="m-0">Create your first tree. Start with yourself and add parents, partners and children.</p><button class="btn btn-go mt-2" data-action="new-tree">Create a tree</button></div>`); return; }
  if(!list.length){ $("#treeGrid").html(`<div class="empty" style="grid-column:1/-1"><h3>No trees match</h3><p class="m-0">${treeQ?`Nothing called “${esc(treeQ)}”. Search looks at tree names and people's names.`:"Star a tree from its card to see it here."}</p></div>`); return; }
  $("#treeGrid").html((treeFilter==="all"&&!treeQ?newCard:"")+list.map(t=>cardHtml(t,true)).join(""));
}
$("#treeFilter button").each(function(){ $(this).toggleClass("on",$(this).data("f")===treeFilter); });
$("#treeFilter").on("click","button",function(){ treeFilter=$(this).data("f"); ssSet("treeFilter",treeFilter); $("#treeFilter button").removeClass("on"); $(this).addClass("on"); paintTrees(); });
$("#treeSort").val(treeSort).on("change",function(){ treeSort=this.value; ssSet("treeSort",treeSort); paintTrees(); });
$("#treeSearch,#treeSearchM").val(treeQ).on("input",function(){ treeQ=this.value.trim().toLowerCase(); ssSet("treeQ",treeQ); $("#treeSearch,#treeSearchM").not(this).val(this.value); if(curView!=="trees") nav("trees"); else paintTrees(); });

function paintShared(){
  const d=S.data;
  $("#pendingH").toggle(!!d.incoming.length);
  $("#incoming").html(d.incoming.map(t=>`<div class="rowcard">${uav(t.owner)}<div class="grow"><div class="t">${esc(t.owner.name)} invited you to <span style="color:#6cc6f5">${esc(t.name)}</span></div><div class="s">${t.people.length} people · You'll be able to ${t.role==="editor"?"edit":"view"} · ${ago(t.sent)}</div>${t.message?`<div class="s mt-1" style="color:#d7dce1">“${esc(t.message)}”</div>`:""}</div><div class="acts"><button class="btn btn-quiet btn-sm" data-action="decline" data-id="${t.id}">Decline</button><button class="btn btn-go btn-sm" data-action="accept" data-id="${t.id}">Accept</button></div></div>`).join(""));
  $("#sharedGrid").html(d.shared.length? d.shared.map(t=>cardHtml(t,false)).join("") : `<div class="empty" style="grid-column:1/-1"><h3>Nothing shared with you yet</h3><p class="m-0">When a relative invites you to their tree, it shows up here.</p></div>`);
}
function paintActivity(){
  const list=S.data.activity.filter(a=>actFilter==="all"||a.kind===actFilter||(actFilter==="sharing"&&a.kind==="sharing"));
  $("#timeline").html(list.length? list.map(a=>`<div class="ev" style="--c:${a.kind==="people"?"var(--ok)":a.kind==="sharing"?"var(--female)":a.kind==="danger"?"var(--danger)":"var(--male)"}"><div class="when">${ago(a.t)} · ${esc(a.tree)}</div><div class="what"><b>${esc(a.who)}</b> ${a.text}</div></div>`).join("") : `<div class="empty"><h3>No activity here yet</h3><p class="m-0">Changes to your trees will be listed here.</p></div>`);
}
$("#actFilter").on("click","button",function(){ actFilter=$(this).data("f"); $("#actFilter button").removeClass("on"); $(this).addClass("on"); paintActivity(); });
function paintSettings(){
  paintData(); applyLangPrefs(); $("#pfNameNe").val(S.user.nameNe||"");
  const u=S.user; $("#pfName").val(u.name); $("#pfEmail").val(u.email); $("#profAv").replaceWith($(uav(u,"lg")).attr("id","profAv"));
  const pr=S.prefs||{}; ["nEdits","nInv","nBday","dPrivate","dLiving"].forEach(k=>{ if(k in pr) $("#"+k).prop("checked",pr[k]); });
  $("#provTxt").text(u.provider==="google"?"Google (demo)":"email and password");
  $("#avColors").html(UCOL.map(c=>`<button type="button" class="ibtn" data-col="${c}" aria-label="Avatar colour" style="width:26px;height:26px;border-radius:50%;background:${c};${c===u.color?"box-shadow:0 0 0 2px var(--bg),0 0 0 4px #fff":""}"></button>`).join(""));
}
$("#importFiles").on("change",function(){ if(this.files.length) Store.importFiles(this.files); this.value=""; });
$("#avColors").on("click","[data-col]",function(){ S.user.color=$(this).data("col"); syncMe(); persist(); paintSettings(); paintShell(); });
$("#profileForm").on("submit",function(e){ e.preventDefault(); const n=$("#pfName").val().trim(), em=$("#pfEmail").val().trim();
  if(!n){ $("#pfName").addClass("is-invalid"); return; } if(!emailOk(em)){ $("#pfEmail").addClass("is-invalid"); return; }
  $("#pfName,#pfEmail").removeClass("is-invalid"); S.user.name=n; S.user.email=em; S.user.nameNe=$("#pfNameNe").val().trim(); syncMe(); persist(); Store.saveAll(); paintSettings(); paintShell(); toast("Profile saved.","ok"); });
$("#langNe").on("change",function(){ S.prefs=S.prefs||{}; S.prefs.ne=this.checked; persist(); applyLangPrefs();
  toast(this.checked?"Nepali is on. Add Nepali names when you add people, and switch language on any tree.":"Nepali is off. Trees show English names; Nepali names stay saved in the files.",this.checked?"ok":undefined); });
$("#nEdits,#nInv,#nBday,#dPrivate,#dLiving").on("change",function(){ S.prefs=S.prefs||{}; S.prefs[this.id]=this.checked; persist(); toast("Preference saved."); });
$("#resetDemo").on("click",function(){
  const $b=$(this); if($b.data("armed")!==1){ $b.data("armed",1).text("Tap again to erase everything"); setTimeout(()=>$b.data("armed",0).text("Reset demo data"),3500); return; }
  try{ localStorage.removeItem(KEY); }catch(_){}
  IDB.del("dir"); ssDel("storeInited"); ssDel("storeServer"); ssDel("curView"); ssDel("treeFilter"); ssDel("treeSort"); ssDel("treeQ");
  location.href="index.html";
});

/* ---------- boot ---------- */
(async function boot(){
  if(!ssGet("storeInited")){ await Store.init(); ssSet("storeInited","1"); } else { await Store.reattach(); }
  paintShell(); paintData(); nav(curView);
  const wt=ssGet("welcomeToast"); if(wt){ ssDel("welcomeToast"); toast(wt,"ok"); }
})();
