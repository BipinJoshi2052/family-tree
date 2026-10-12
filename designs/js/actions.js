"use strict";
/* Shared between trees.html and editor.html: the global [data-action] click dispatcher and the
   New-tree/Rename/Confirm/Share/Invite modals. Both pages carry identical markup for the Rename,
   Confirm, Share and Invite modals (file:// pages can't fetch()-include a shared partial), so this
   one script wires up whichever copy is present. Branches that would repaint the trees-list/shell
   (nav/paintTrees/paintShell/...) are guarded with typeof checks since those functions only exist
   on trees.html - on editor.html they're simply skipped, since S.data is already up to date and
   trees.html will repaint fresh from it next time it loads. */

function openTree(id,fresh){ location.href="editor.html?id="+encodeURIComponent(id)+(fresh?"&fresh=1":""); }
function closeEditor(){ if(typeof Editor!=="undefined") Editor.flush(); location.href="trees.html"; }

const ntModal=$("#newTreeModal").length?new bootstrap.Modal("#newTreeModal"):null;
const rnModal=new bootstrap.Modal("#renameModal"), cfModal=new bootstrap.Modal("#confirmModal"), shModal=new bootstrap.Modal("#shareModal"), ivModal=new bootstrap.Modal("#inviteModal");
let ctxId=null, cfAction=null;
$(document).on("click","[data-action]",function(e){
  const a=$(this).data("action"); let id=$(this).data("id");
  if($(this).data("ctx")==="editor") id=Editor.treeId();
  if(["star","open","rename","duplicate","share","invite","copyjson","delete","leave","accept","decline"].includes(a)) e.stopPropagation();
  ({
    "new-tree":()=>{ $("#newTreeForm")[0].reset(); $("#newTreeForm").removeClass("was-validated"); syncNt(); ntModal.show(); },
    star:()=>{ const t=findTree(id).t; t.starred=!t.starred; touch(t,false); if(typeof paintTrees==="function") paintTrees(); },
    open:()=>openTree(id),
    rename:()=>{ ctxId=id; $("#rnName").val(findTree(id).t.name).removeClass("is-invalid"); rnModal.show(); },
    duplicate:()=>{ const f=findTree(id);
      const c={id:uid("t-"),name:`${f.t.name} (copy)`,role:"owner",created:Date.now(),updated:Date.now(),starred:false,access:"private",people:clone(f.t.people),collaborators:[meRow()]};
      S.data.trees.unshift(c); logAct("tree",c.name,`created <b>${esc(c.name)}</b> as a copy`); touch(c);
      if(typeof nav==="function"){ if(curView!=="trees") nav("trees"); else { paintTrees(); paintShell(); } }
      toast(`Made a copy: ${c.name}.`,"ok"); },
    share:()=>openShare(id),
    invite:()=>openInvite(id),
    download:()=>{ Store.download(findTree(id).t); },
    "download-all":()=>{ Store.all().forEach((t,i)=>setTimeout(()=>Store.download(t),i*250)); },
    connect:()=>Store.connect(),
    reconnect:()=>Store.reconnect(),
    disconnect:()=>Store.disconnect(),
    import:()=>$("#importFiles").trigger("click"),
    samples:()=>Store.useSamples(),
    copyjson:()=>{ const t=findTree(id).t; copyText(JSON.stringify(t.people.map(p=>{ const o={}; Object.keys(p).forEach(k=>{ if(k[0]!=="_") o[k]=p[k]; }); return o; }),null,2),null,`Copied ${t.people.length} people as JSON.`); },
    delete:()=>{ const t=findTree(id).t; ctxId=id; cfAction="delete";
      $("#cfTitle").text("Delete this tree?"); $("#cfGo").text("Delete tree");
      $("#cfBody").html(`<p class="mb-2"><b>${esc(t.name)}</b> and its ${t.people.length} people will be removed for everyone.</p>${t.collaborators.length>1?`<p class="muted mb-0">${t.collaborators.length-1} other ${t.collaborators.length-1===1?"person loses":"people lose"} access too.</p>`:""}`); cfModal.show(); },
    leave:()=>{ const t=findTree(id).t; ctxId=id; cfAction="leave";
      $("#cfTitle").text("Leave this tree?"); $("#cfGo").text("Leave");
      $("#cfBody").html(`<p class="mb-0">You'll lose access to <b>${esc(t.name)}</b>. ${esc(t.owner.name)} can invite you again.</p>`); cfModal.show(); },
    accept:()=>{ const i=S.data.incoming.findIndex(x=>x.id===id), t=S.data.incoming[i]; S.data.incoming.splice(i,1);
      const nt={id:t.id,name:t.name,owner:t.owner,role:t.role,created:t.sent,updated:Date.now(),starred:false,access:"private",people:t.people,
        collaborators:[Object.assign({role:"owner",status:"active"},t.owner),meRow(t.role)]};
      S.data.shared.unshift(nt); Store.save(nt);
      logAct("sharing",t.name,`joined <b>${esc(t.name)}</b> as ${t.role==="editor"?"an editor":"a viewer"}`); persist();
      if(typeof paintShared==="function"){ paintShared(); paintShell(); } toast(`You joined ${t.name}.`,"ok"); },
    decline:()=>{ const i=S.data.incoming.findIndex(x=>x.id===id), t=S.data.incoming[i]; S.data.incoming.splice(i,1); logAct("sharing",t.name,`declined the invitation to <b>${esc(t.name)}</b>`); persist();
      if(typeof paintShared==="function"){ paintShared(); paintShell(); } toast(`Declined ${t.name}.`); },
    signout:()=>{ S.user=null; persist(); ssDel("storeInited"); ssDel("storeServer"); if(typeof Editor!=="undefined") Editor.flush(); location.href="login.html"; },
    replay:()=>{ ssSet("forceWelcome","1"); if(typeof Editor!=="undefined") Editor.flush(); location.href="index.html"; }
  })[a]?.();
});
$(document).on("show.bs.dropdown",".tcard .dropdown",function(){ $(this).closest(".tcard").addClass("menu-open"); }).on("hidden.bs.dropdown",".tcard .dropdown",function(){ $(this).closest(".tcard").removeClass("menu-open"); });
$(document).on("click","[data-open]",function(e){ if($(e.target).closest(".dropdown,.ibtn").length) return; openTree($(this).data("open")); });
$(document).on("keydown","[data-open]",function(e){ if(e.target===this&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); openTree($(this).data("open")); } });

/* new tree (trees.html only) */
function syncNt(){ const v=$("input[name=ntFrom]:checked").val(); $("#ntPersonWrap,#ntPersonNeWrap").prop("hidden",v!=="person"); $("#ntMeWrap").prop("hidden",v!=="me"); }
$("input[name=ntFrom]").on("change",syncNt);
$("#newTreeModal").on("shown.bs.modal",()=>$("#ntName").trigger("focus"));
$("#newTreeForm").on("submit",function(e){
  e.preventDefault(); const name=$("#ntName").val().trim(), from=$("input[name=ntFrom]:checked").val();
  $("#ntName").toggleClass("is-invalid",!name); if(!name) return;
  let people;
  if(from==="sample") people=sampleWhitmore();
  else if(from==="person"){ const pn=$("#ntPerson").val().trim(); $("#ntPerson").toggleClass("is-invalid",!pn); if(!pn) return; people=[mk("root",pn,$("#ntGender").val(),"",{img:""})]; const pne=neOn()?$("#ntPersonNe").val().trim():""; if(pne) people[0].nameNe=pne; }
  else { people=[mk("me",S.user.name,$("#ntMeGender").val(),"",{img:"",bio:"Tree owner."})]; if(S.user.nameNe) people[0].nameNe=S.user.nameNe; }
  const t={id:uid("t-"),name,created:Date.now(),updated:Date.now(),starred:false,access:"private",people,collaborators:[meRow()]};
  t.role="owner"; t.defaultLang=neOn()&&$("#ntLang").val()==="ne"?"ne":"en"; S.data.trees.unshift(t); logAct("tree",name,`created <b>${esc(name)}</b>`); touch(t); ntModal.hide();
  setTimeout(()=>openTree(t.id,true),250);
});
/* rename (shared) */
$("#renameModal").on("shown.bs.modal",()=>$("#rnName").trigger("select"));
$("#renameForm").on("submit",function(e){ e.preventDefault(); const n=$("#rnName").val().trim(); $("#rnName").toggleClass("is-invalid",!n); if(!n) return;
  const t=findTree(ctxId).t, old=t.name; t.name=n; logAct("tree",n,`renamed <b>${esc(old)}</b> to <b>${esc(n)}</b>`); touch(t); rnModal.hide();
  if(typeof Editor!=="undefined") Editor.header(); else if(typeof nav==="function") nav(curView); toast("Renamed.","ok"); });
/* confirm (shared) */
$("#cfGo").on("click",()=>{
  const f=findTree(ctxId); if(!f) return; const t=f.t;
  Store.remove(t); if(cfAction==="delete") Img.removeTree(t);
  if(cfAction==="delete"){ S.data.trees=S.data.trees.filter(x=>x.id!==ctxId); logAct("danger",t.name,`deleted <b>${esc(t.name)}</b>`); toast(`Deleted ${t.name}.`,"danger"); }
  else { S.data.shared=S.data.shared.filter(x=>x.id!==ctxId); logAct("sharing",t.name,`left <b>${esc(t.name)}</b>`); toast(`You left ${t.name}.`); }
  persist(); cfModal.hide();
  if(typeof Editor!=="undefined") closeEditor(); else if(typeof nav==="function") nav(curView);
});

/* ---------- share (shared) ---------- */
function openShare(id){
  ctxId=id; const f=findTree(id), t=f.t, canManage=f.mine;
  $("#shTitle").text(`Share “${t.name}”`);
  paintShareList();
  $("#shAccess").val(t.access).prop("disabled",!canManage); syncAccess();
  $("#shLink").val(`https://familytree.app/t/${t.id.replace(/^t-/,"")}`);
  $("#shAddPeople").prop("hidden",!canManage);
  shModal.show();
}
function paintShareList(){
  const f=findTree(ctxId), t=f.t, canManage=f.mine;
  $("#shPeople").html(t.collaborators.map((c,i)=>`<div class="access-row">${uav(c)}<div class="who"><b>${esc(c.name)}${c.me?" (you)":""}</b><small>${esc(c.email)}</small></div>
    ${c.status==="invited"?'<span class="pill invited">Invited</span>':""}
    ${c.role==="owner"||!canManage?`<span class="muted small">${c.role[0].toUpperCase()+c.role.slice(1)}</span>`:
      `<select class="form-select" data-ci="${i}" aria-label="Access for ${esc(c.name)}"><option value="editor"${c.role==="editor"?" selected":""}>Editor</option><option value="viewer"${c.role==="viewer"?" selected":""}>Viewer</option><option value="remove">Remove access</option></select>`}</div>`).join(""));
}
function syncAccess(){ const v=$("#shAccess").val(); $("#shIco").html(v==="link"?I.globe:I.lock);
  $("#shAccessHelp").text(v==="link"?"Anyone with the link can view. Only people you add can edit.":"Only people with access can open this tree."); }
$("#shAccess").on("change",function(){ const t=findTree(ctxId).t; t.access=this.value; Store.save(t); syncAccess(); logAct("sharing",t.name,this.value==="link"?`turned on link sharing for <b>${esc(t.name)}</b>`:`made <b>${esc(t.name)}</b> private`); persist(); if(typeof nav==="function") nav(curView); toast(this.value==="link"?"Anyone with the link can now view.":"Link sharing is off.");});
$("#shPeople").on("change","select",function(){ const t=findTree(ctxId).t, c=t.collaborators[$(this).data("ci")];
  if(this.value==="remove"){ t.collaborators.splice($(this).data("ci"),1); logAct("sharing",t.name,`removed <b>${esc(c.name)}</b>'s access`); toast(`Removed ${c.name}.`); }
  else { c.role=this.value; logAct("sharing",t.name,`made <b>${esc(c.name)}</b> ${this.value==="editor"?"an editor":"a viewer"}`); toast(`${c.name} is now ${this.value==="editor"?"an editor":"a viewer"}.`); }
  touch(t,false); paintShareList(); if(typeof Editor!=="undefined") Editor.header(); else if(typeof nav==="function") nav(curView); });
$("#shCopy").on("click",()=>copyText($("#shLink").val(),$("#shLink")));
$("#shAddPeople").on("click",()=>{ shModal.hide(); setTimeout(()=>openInvite(ctxId,true),250); });

/* ---------- invite (shared) ---------- */
let ivList=[], ivBackToShare=false;
function openInvite(id,back){
  const f=findTree(id); if(!f.mine&&f.t.role!=="editor"){ toast("Only the owner and editors can invite people.","female"); return; }
  ctxId=id; ivBackToShare=!!back; ivList=[]; paintChips(); $("#ivInput").val(""); $("#ivMsg").val(""); $("#ivRole").val("editor");
  $("#ivTitle").text(`Invite to “${f.t.name}”`); $("#ivHelp").text("Press Enter or comma after each address."); ivModal.show();
}
$("#inviteModal").on("shown.bs.modal",()=>$("#ivInput").trigger("focus"));
function paintChips(){ $("#ivBox .echip").remove(); ivList.forEach((e,i)=>$(`<span class="echip${emailOk(e)?"":" bad"}">${esc(e)}<button type="button" data-ri="${i}" aria-label="Remove ${esc(e)}">×</button></span>`).insertBefore("#ivInput")); }
function addChip(){ $("#ivInput").val().split(/[,;\s]+/).map(x=>x.trim()).filter(Boolean).forEach(e=>{ if(!ivList.includes(e)) ivList.push(e); }); $("#ivInput").val(""); paintChips(); }
$("#ivInput").on("keydown",e=>{ if(e.key==="Enter"||e.key===","||e.key===";"){ e.preventDefault(); addChip(); } else if(e.key==="Backspace"&&!e.target.value&&ivList.length){ ivList.pop(); paintChips(); } }).on("blur",addChip);
$("#ivBox").on("click",e=>{ if(e.target.id==="ivBox") $("#ivInput").trigger("focus"); }).on("click","[data-ri]",function(){ ivList.splice($(this).data("ri"),1); paintChips(); });
$("#inviteForm").on("submit",function(e){
  e.preventDefault(); addChip();
  const bad=ivList.filter(x=>!emailOk(x)); if(!ivList.length){ $("#ivHelp").text("Add at least one email address."); return; }
  if(bad.length){ $("#ivHelp").text(`Check ${bad.length===1?"this address":"these addresses"}: ${bad.join(", ")}`); return; }
  const t=findTree(ctxId).t, role=$("#ivRole").val(); let added=0;
  ivList.forEach(em=>{ if(t.collaborators.some(c=>c.email.toLowerCase()===em.toLowerCase())) return; t.collaborators.push({name:nameFromEmail(em),email:em,role,status:"invited"}); added++; });
  const asTxt=role==="editor"?(added===1?"an editor":"editors"):(added===1?"a viewer":"viewers");
  if(added) logAct("sharing",t.name,`invited ${added===1?`<b>${esc(ivList.find(x=>t.collaborators.some(c=>c.email===x&&c.status==="invited"))||ivList[0])}</b>`:`<b>${added} people</b>`} as ${asTxt}`);
  touch(t,false); ivModal.hide();
  toast(added?`Invited ${added} ${added===1?"person":"people"} as ${role}${added===1?"":"s"}.`:"Everyone on that list already has access.","ok");
  if(typeof Editor!=="undefined") Editor.header(); else if(typeof nav==="function") nav(curView);
  if(ivBackToShare) setTimeout(()=>openShare(ctxId),300);
});
