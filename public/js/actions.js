"use strict";
/* Shared between the dashboard and editor screens (see app.blade.php / core.js's SCREEN): the
   global [data-action] click dispatcher and the New-tree/Rename/Confirm modals, which exist once
   in the DOM and are used from whichever screen is currently active. Branches that would repaint
   the trees list are guarded with SCREEN==="app" checks (the inverse, SCREEN==="editor", picks the
   Editor-object branch) rather than feature-detection, since both trees.js and editor.js are
   always loaded together now. */

/* Navigates between the dashboard and editor screens without a full page reload: fetch the
   destination's data (showing a loader meanwhile), then swap screens and update the URL via
   history.pushState so the address bar and back/forward buttons stay correct. */
function openTree(slug,fresh){
  history.pushState({view:"editor",slug,fresh:!!fresh},"","/editor/"+slug+(fresh?"?fresh=1":""));
  bootEditor(slug,!!fresh);
}
function closeEditor(){
  history.pushState({view:"app"},"","/trees");
  bootApp();
}
/* Derives the screen from location.pathname itself rather than trusting event.state - some mobile
   browsers fire a stray popstate on page load/restore (e.g. iOS Safari's tab suspend/resume) that
   can carry a stale state object left over from an earlier SPA session, which would otherwise show
   the wrong screen while the address bar still reads correctly. The URL is the one thing that's
   always right, so every popstate - real back/forward or a spurious mobile one - re-derives from it. */
function syncScreenToUrl(){
  const m=location.pathname.match(/^\/editor\/([^/]+)/);
  if(m) bootEditor(m[1],new URLSearchParams(location.search).get("fresh")==="1");
  else bootApp();
}
window.addEventListener("popstate",syncScreenToUrl);
/* Belt-and-braces for the same class of bug via a different mechanism: a page restored from the
   browser's back-forward cache (bfcache, e.g. iOS Safari resuming a suspended tab) fires pageshow
   with persisted=true instead of a fresh script run - re-sync in case the restored in-memory
   SCREEN doesn't match wherever the address bar actually ended up. */
window.addEventListener("pageshow",e=>{ if(e.persisted) syncScreenToUrl(); });

const ntModal=$("#newTreeModal").length?new bootstrap.Modal("#newTreeModal"):null;
const rnModal=new bootstrap.Modal("#renameModal"), cfModal=new bootstrap.Modal("#confirmModal");
let ctxId=null, ctxKind="tree";
$(document).on("click","[data-action]",function(e){
  const a=$(this).data("action"); let id=$(this).data("id");
  if($(this).data("ctx")==="editor") id=Editor.treeId();
  if(["star","open","rename","delete"].includes(a)) e.stopPropagation();
  ({
    "new-tree":()=>{ $("#newTreeForm")[0].reset(); $("#newTreeForm").removeClass("was-validated"); syncNt(); ntModal.show(); },
    star:()=>{
      const $btn=$(this), willStar=!$btn.hasClass("on");
      Api.trees.update(id,{starred:willStar?1:0}).done(()=>{ if(SCREEN==="app"){ const t=Trees.find(x=>x.id===id); if(t) t.starred=willStar; paintTrees(); } });
    },
    open:()=>{ const t=Trees.find(x=>x.id===id); if(t) openTree(t.slug,false); },
    rename:()=>{ ctxId=id; const t=SCREEN==="app"?Trees.find(x=>x.id===id):null; $("#rnName").val(t?t.name:(SCREEN==="editor"?Editor.treeName():"")).removeClass("is-invalid"); rnModal.show(); },
    import:()=>$("#importFiles").trigger("click"),
    delete:()=>{ const t=SCREEN==="app"?Trees.find(x=>x.id===id):null; ctxId=id; ctxKind="tree";
      const name=t?t.name:(SCREEN==="editor"?Editor.treeName():"This tree"), count=t?t.people_count:(SCREEN==="editor"?Editor.peopleCount():0);
      $("#cfTitle").text("Delete this tree?"); $("#cfGo").text("Delete tree");
      $("#cfBody").html(`<p class="mb-0"><b>${esc(name)}</b> and its ${count} people will be permanently removed.</p>`); cfModal.show(); },
  })[a]?.call(this);
});
$(document).on("show.bs.dropdown",".tcard .dropdown",function(){ $(this).closest(".tcard").addClass("menu-open"); }).on("hidden.bs.dropdown",".tcard .dropdown",function(){ $(this).closest(".tcard").removeClass("menu-open"); });
$(document).on("click","[data-open]",function(e){ if($(e.target).closest(".dropdown,.ibtn").length) return; openTree($(this).data("open")); });
$(document).on("keydown","[data-open]",function(e){ if(e.target===this&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); openTree($(this).data("open")); } });

/* new tree (dashboard only) */
function syncNt(){ const v=$("input[name=ntFrom]:checked").val(); $("#ntPersonWrap,#ntPersonNeWrap").prop("hidden",v!=="person"); $("#ntMeWrap").prop("hidden",v!=="me"); }
$("input[name=ntFrom]").on("change",syncNt);
$("#newTreeModal").on("shown.bs.modal",()=>$("#ntName").trigger("focus"));
$("#newTreeForm").on("submit",function(e){
  e.preventDefault(); const name=$("#ntName").val().trim(), from=$("input[name=ntFrom]:checked").val();
  $("#ntName").toggleClass("is-invalid",!name); if(!name) return;
  let personName="", personGender="male", personNameNe="";
  if(from==="person"){ personName=$("#ntPerson").val().trim(); $("#ntPerson").toggleClass("is-invalid",!personName); if(!personName) return; personGender=$("#ntGender").val(); personNameNe=neOn()?$("#ntPersonNe").val().trim():""; }
  else { personName=AppSettings.name; personGender=$("#ntMeGender").val(); personNameNe=AppSettings.name_ne||""; }
  const defaultLang=neOn()&&$("#ntLang").val()==="ne"?"ne":"en";
  const $btn=$(this).find('button[type="submit"]');
  $btn.prop("disabled",true);
  Api.trees.create(name,defaultLang,{name:personName,name_ne:personNameNe||null,gender:personGender}).done(tree=>{
    ntModal.hide();
    toast(`Created ${name}.`,"ok");
    openTree(tree.slug,true);
  }).fail(xhr=>toast(apiErr(xhr),"danger")).always(()=>$btn.prop("disabled",false));
});
/* rename (shared) */
$("#renameModal").on("shown.bs.modal",()=>$("#rnName").trigger("select"));
$("#renameForm").on("submit",function(e){ e.preventDefault(); const n=$("#rnName").val().trim(); $("#rnName").toggleClass("is-invalid",!n); if(!n) return;
  Api.trees.update(ctxId,{name:n}).done(()=>{
    rnModal.hide();
    if(SCREEN==="editor") Editor.renamed(n);
    else { const t=Trees.find(x=>x.id===ctxId); if(t) t.name=n; nav(curView); }
    toast("Renamed.","ok");
  }).fail(xhr=>toast(apiErr(xhr),"danger"));
});
/* confirm delete (shared): ctxKind picks whether #cfGo deletes a tree or a person */
$("#cfGo").on("click",()=>{
  if(ctxKind==="person"){
    Api.people.remove(ctxId).done(()=>{
      cfModal.hide();
      toast("Removed.","danger");
      Editor.personRemoved(ctxId);
    }).fail(xhr=>toast(apiErr(xhr),"danger"));
    return;
  }
  Api.trees.remove(ctxId).done(()=>{
    cfModal.hide();
    toast("Deleted.","danger");
    if(SCREEN==="editor") closeEditor();
    else { Trees=Trees.filter(x=>x.id!==ctxId); nav(curView); }
  }).fail(xhr=>toast(apiErr(xhr),"danger"));
});
