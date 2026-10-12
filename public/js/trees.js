"use strict";

// New-tree creation reads AppSettings.name (for the "Just me" starting person) - disable the
// trigger buttons until boot() below has fetched it, so an early click can't submit an empty name.
$('[data-action="new-tree"]').prop("disabled",true);

let curView=ssGet("curView","trees"), treeFilter=ssGet("treeFilter","all"), treeSort=ssGet("treeSort","recent"), treeQ=ssGet("treeQ","");
let Trees=[];
const NAV=[{k:"trees",label:"My trees",ico:I.trees},{k:"settings",label:"Settings",ico:I.gear}];

function paintShell(){
  $("#sideNav").html(NAV.map(n=>`<button class="nav-a${curView===n.k?" on":""}" data-nav="${n.k}">${n.ico}<span>${n.label}</span>${n.k==="trees"?`<span class="cnt n">${Trees.length}</span>`:""}</button>`).join(""));
  $("#tabbar").html(NAV.map(n=>`<button class="${curView===n.k?"on":""}" data-nav="${n.k}">${n.ico}<span>${n.label}</span></button>`).join(""));
  $("#meAv").replaceWith($(uav(AppSettings)).attr("id","meAv")); $("#meName").text(AppSettings.name); $("#meEmail").text(AppSettings.email);
}
function nav(k){
  curView=k; ssSet("curView",k);
  $(".view").removeClass("on"); $("#v-"+k).addClass("on");
  $("#viewTitle").text(NAV.find(n=>n.k===k).label);
  $(".hsearch input").closest(".hsearch").toggleClass("invisible",k!=="trees");
  $("#content").scrollTop(0);
  paintShell();
  ({trees:paintTrees,settings:paintSettings})[k]();
}
$(document).on("click","[data-nav]",function(){ nav($(this).data("nav")); });

function treeMenu(t){
  const it=(a,ico,l,cls="")=>`<li><button class="dropdown-item ${cls}" data-action="${a}" data-id="${t.id}">${ico}${l}</button></li>`;
  return it("open",I.open,"Open")+it("rename",I.edit,"Rename")+'<li><hr class="dropdown-divider"></li>'+it("delete",I.trash,"Delete","danger");
}
function cardHtml(t){
  const G=t.people_count||0;
  return `<article class="tcard" data-open="${t.id}" tabindex="0" aria-label="Open ${esc(t.name)}">
    <div class="prev" style="display:flex;align-items:center;justify-content:center;color:var(--muted)">${I.trees.replace(/width="20" height="20"/,'width="44" height="44"')}
      <div class="corner">
        <button class="ibtn star${t.starred?" on":""}" data-action="star" data-id="${t.id}" aria-label="${t.starred?"Unstar":"Star"} ${esc(t.name)}" aria-pressed="${!!t.starred}">${t.starred?I.star.replace('fill="none"','fill="currentColor"'):I.star}</button>
        <div class="dropdown"><button class="ibtn" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}' aria-label="More actions for ${esc(t.name)}">${I.more}</button><ul class="dropdown-menu dropdown-menu-end">${treeMenu(t)}</ul></div>
      </div>
    </div>
    <div class="body">
      <h3 class="tn">${esc(t.name)}</h3>
      <div class="meta">${t.people_count} ${t.people_count===1?"person":"people"}</div>
      <div class="foot">${neOn()&&t.default_lang==="ne"?`<span class="pill" lang="ne" title="Opens in Nepali">ने</span>`:""}<span class="ed">${ago(new Date(t.updated_at).getTime())}</span></div>
    </div></article>`;
}
function paintTrees(){
  let list=Trees.slice();
  if(treeFilter==="starred") list=list.filter(t=>t.starred);
  if(treeQ) list=list.filter(t=>t.name.toLowerCase().includes(treeQ));
  list.sort(treeSort==="name"?(a,b)=>a.name.localeCompare(b.name):treeSort==="size"?(a,b)=>b.people_count-a.people_count:(a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
  const newCard=`<button class="tcard new" data-action="new-tree"><span class="plus"><svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><b>New tree</b><small>Start from yourself or an ancestor</small></button>`;
  if(!Trees.length){ $("#treeGrid").html(`<div class="empty" style="grid-column:1/-1"><h3>No trees yet</h3><p class="m-0">Create your first tree, or import a JSON file from a previous export.</p><button class="btn btn-go mt-2" data-action="new-tree">Create a tree</button></div>`); return; }
  if(!list.length){ $("#treeGrid").html(`<div class="empty" style="grid-column:1/-1"><h3>No trees match</h3><p class="m-0">${treeQ?`Nothing called “${esc(treeQ)}”.`:"Star a tree from its card to see it here."}</p></div>`); return; }
  $("#treeGrid").html((treeFilter==="all"&&!treeQ?newCard:"")+list.map(cardHtml).join(""));
}
$("#treeFilter button").each(function(){ $(this).toggleClass("on",$(this).data("f")===treeFilter); });
$("#treeFilter").on("click","button",function(){ treeFilter=$(this).data("f"); ssSet("treeFilter",treeFilter); $("#treeFilter button").removeClass("on"); $(this).addClass("on"); paintTrees(); });
$("#treeSort").val(treeSort).on("change",function(){ treeSort=this.value; ssSet("treeSort",treeSort); paintTrees(); });
$("#treeSearch,#treeSearchM").val(treeQ).on("input",function(){ treeQ=this.value.trim().toLowerCase(); ssSet("treeQ",treeQ); $("#treeSearch,#treeSearchM").not(this).val(this.value); if(curView!=="trees") nav("trees"); else paintTrees(); });

function paintSettings(){
  applyLangPrefs(); $("#pfNameNe").val(AppSettings.name_ne||"");
  $("#pfName").val(AppSettings.name); $("#pfEmail").val(AppSettings.email); $("#profAv").replaceWith($(uav(AppSettings,"lg")).attr("id","profAv"));
  $("#provTxt").text("Signed in with email and password.");
  $("#avColors").html(UCOL.map(c=>`<button type="button" class="ibtn" data-col="${c}" aria-label="Avatar colour" style="width:26px;height:26px;border-radius:50%;background:${c};${c===AppSettings.color?"box-shadow:0 0 0 2px var(--bg),0 0 0 4px #fff":""}"></button>`).join(""));
}
$("#importFiles").on("change",function(){
  const f=this.files[0]; this.value=""; if(!f) return;
  Api.trees.import(f).done(tree=>{ Trees.unshift(Object.assign(tree,{people_count:tree.people_count ?? 0})); if(curView==="trees") paintTrees(); paintShell(); toast(`Imported ${tree.name}.`,"ok"); })
    .fail(xhr=>toast(apiErr(xhr),"danger"));
});
$("#avColors").on("click","[data-col]",function(){
  AppSettings.color=$(this).data("col");
  Api.settings.update({color:AppSettings.color}).done(()=>{ paintSettings(); paintShell(); });
});
$("#profileForm").on("submit",function(e){ e.preventDefault(); const n=$("#pfName").val().trim(), em=$("#pfEmail").val().trim();
  if(!n){ $("#pfName").addClass("is-invalid"); return; } if(!emailOk(em)){ $("#pfEmail").addClass("is-invalid"); return; }
  $("#pfName,#pfEmail").removeClass("is-invalid");
  Api.settings.update({name:n,email:em,name_ne:$("#pfNameNe").val().trim()}).done(s=>{ AppSettings=s; paintSettings(); paintShell(); toast("Profile saved.","ok"); })
    .fail(xhr=>toast(apiErr(xhr),"danger"));
});
$("#langNe").on("change",function(){
  Api.settings.update({ne:this.checked?1:0}).done(s=>{ AppSettings=s; applyLangPrefs();
    toast(this.checked?"Nepali is on. Add Nepali names when you add people, and switch language on any tree.":"Nepali is off.",this.checked?"ok":undefined); });
});

/* ---------- boot ---------- */
(async function boot(){
  const [settings,trees]=await Promise.all([Api.settings.get(),Api.trees.list()]);
  AppSettings=settings; Trees=trees;
  paintShell(); nav(curView);
  $('[data-action="new-tree"]').prop("disabled",false);
})();
