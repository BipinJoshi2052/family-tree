"use strict";
/* Shared between trees.html-equivalent and editor.html-equivalent pages: the global [data-action]
   click dispatcher and the New-tree/Rename/Confirm modals. Both pages carry an identical copy of
   the Rename and Confirm modal markup, so this one script wires up whichever copy is present.
   Branches that would repaint the trees list (nav/paintTrees/paintShell/...) are guarded with
   typeof checks since those functions only exist on the dashboard page - on the editor page
   they're simply skipped, since the server already has the update and the dashboard will repaint
   fresh from it next time it loads. */

function openTree(id,fresh){ location.href="/editor/"+id+(fresh?"?fresh=1":""); }
function closeEditor(){ location.href="/trees"; }

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
      Api.trees.update(id,{starred:willStar?1:0}).done(()=>{ if(typeof paintTrees==="function"){ const t=Trees.find(x=>x.id===id); if(t) t.starred=willStar; paintTrees(); } });
    },
    open:()=>openTree(id),
    rename:()=>{ ctxId=id; const t=typeof Trees!=="undefined"?Trees.find(x=>x.id===id):null; $("#rnName").val(t?t.name:(typeof Editor!=="undefined"?Editor.treeName():"")).removeClass("is-invalid"); rnModal.show(); },
    import:()=>$("#importFiles").trigger("click"),
    delete:()=>{ const t=typeof Trees!=="undefined"?Trees.find(x=>x.id===id):null; ctxId=id; ctxKind="tree";
      const name=t?t.name:(typeof Editor!=="undefined"?Editor.treeName():"This tree"), count=t?t.people_count:(typeof Editor!=="undefined"?Editor.peopleCount():0);
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
    openTree(tree.id,true);
  }).fail(xhr=>toast(apiErr(xhr),"danger")).always(()=>$btn.prop("disabled",false));
});
/* rename (shared) */
$("#renameModal").on("shown.bs.modal",()=>$("#rnName").trigger("select"));
$("#renameForm").on("submit",function(e){ e.preventDefault(); const n=$("#rnName").val().trim(); $("#rnName").toggleClass("is-invalid",!n); if(!n) return;
  Api.trees.update(ctxId,{name:n}).done(()=>{
    rnModal.hide();
    if(typeof Editor!=="undefined") Editor.renamed(n);
    else if(typeof nav==="function"){ const t=Trees.find(x=>x.id===ctxId); if(t) t.name=n; nav(curView); }
    toast("Renamed.","ok");
  }).fail(xhr=>toast(apiErr(xhr),"danger"));
});
/* confirm delete (shared): ctxKind picks whether #cfGo deletes a tree or a person */
$("#cfGo").on("click",()=>{
  if(ctxKind==="person"){
    Api.people.remove(ctxId).done(()=>{
      cfModal.hide();
      toast("Removed.","danger");
      location.reload();
    }).fail(xhr=>toast(apiErr(xhr),"danger"));
    return;
  }
  Api.trees.remove(ctxId).done(()=>{
    cfModal.hide();
    toast("Deleted.","danger");
    if(typeof Editor!=="undefined") location.href="/trees";
    else if(typeof nav==="function"){ Trees=Trees.filter(x=>x.id!==ctxId); nav(curView); }
  }).fail(xhr=>toast(apiErr(xhr),"danger"));
});
