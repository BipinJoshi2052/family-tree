"use strict";
if(S.user){ location.href="trees.html"; }

function setAuthTab(tab){
  $(".auth-tabs button").each(function(){ const on=$(this).data("auth")===tab; $(this).toggleClass("on",on).attr("aria-selected",on); });
  $("#loginForm").prop("hidden",tab!=="login"); $("#signupForm").prop("hidden",tab!=="signup");
  $("#authTitle").text(tab==="login"?"Welcome back":"Create your account");
  $("#authSub").text(tab==="login"?"Log in to open your family trees.":"Free for up to 5 trees. No card needed.");
}
setAuthTab(new URLSearchParams(location.search).get("tab")==="signup"?"signup":"login");
setTimeout(()=>$(new URLSearchParams(location.search).get("tab")==="signup"?"#suName":"#liEmail").trigger("focus"),350);

$(".auth-tabs").on("click","button",function(){ setAuthTab($(this).data("auth")); });
$(document).on("click","[data-eye]",function(){ const $i=$("#"+$(this).data("eye")); const show=$i.attr("type")==="password"; $i.attr("type",show?"text":"password"); $(this).html(show?I.eyeOff:I.eye).attr("aria-label",show?"Hide password":"Show password"); });
$("#forgotBtn").on("click",()=>{ const e=$("#liEmail").val().trim(); if(!emailOk(e)){ $("#liEmail").addClass("is-invalid").trigger("focus"); toast("Enter your email first, then tap Forgot password."); return; } toast(`Prototype: a reset link would go to ${e}.`); });
$("#liEmail,#suEmail,#liPw,#suPw,#suName").on("input",function(){ $(this).removeClass("is-invalid"); });
$("#suPw").on("input",function(){
  const v=this.value; let s=0; if(v.length>=8) s++; if(/[A-Z]/.test(v)&&/[a-z]/.test(v)) s++; if(/\d/.test(v)) s++; if(/[^A-Za-z0-9]/.test(v)) s++;
  const col=["var(--danger)","var(--female)","#fdd835","var(--ok)"][Math.max(0,s-1)];
  $("#pwStrength i").each(function(i){ $(this).css("background",i<s?col:"var(--edge)"); });
  $("#pwHint").text(!v?"Mix letters, numbers and a symbol for a stronger password.":["Too short","Weak","Fair","Good","Strong"][s]+(v.length<8?": use at least 8 characters.":"."));
});
function busy($b,on,label){ if(on){ $b.data("t",$b.text()).prop("disabled",true).html(`<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}`); } else $b.prop("disabled",false).text($b.data("t")); }
$("#loginForm").on("submit",function(e){
  e.preventDefault(); const em=$("#liEmail").val().trim(), pw=$("#liPw").val();
  let ok=true; if(!emailOk(em)){ $("#liEmail").addClass("is-invalid"); ok=false; } if(!pw){ $("#liPw").addClass("is-invalid"); ok=false; } if(!ok) return;
  busy($("#liSubmit"),true,"Logging in…");
  setTimeout(()=>{ busy($("#liSubmit"),false); signIn({name:(S.lastUser&&S.lastUser.email===em)?S.lastUser.name:nameFromEmail(em),email:em,provider:"email"},false); },900);
});
$("#signupForm").on("submit",function(e){
  e.preventDefault(); const nm=$("#suName").val().trim(), em=$("#suEmail").val().trim(), pw=$("#suPw").val();
  let ok=true; if(!nm){ $("#suName").addClass("is-invalid"); ok=false; } if(!emailOk(em)){ $("#suEmail").addClass("is-invalid"); ok=false; } if(pw.length<8){ $("#suPw").addClass("is-invalid"); ok=false; }
  if(!$("#suTerms").prop("checked")){ $("#suTerms").addClass("is-invalid"); ok=false; } else $("#suTerms").removeClass("is-invalid");
  if(!ok) return;
  busy($("#suSubmit"),true,"Creating account…");
  setTimeout(()=>{ busy($("#suSubmit"),false); signIn({name:nm,email:em,provider:"email"},true); },1100);
});
const PROFILES=[{name:"Michael Whitmore",email:"michael.whitmore@example.com",color:"#039be5"},{name:"Priya Shah",email:"priya.shah@example.com",color:"#26a69a"}];
const ggModal=new bootstrap.Modal("#googleModal");
$("#googleBtn").on("click",()=>{
  $("#ggList").html(PROFILES.map((p,i)=>`<button type="button" class="acct" data-pf="${i}">${uav(p)}<span><b>${esc(p.name)}</b><small>${esc(p.email)}</small></span></button>`).join("")+
    `<button type="button" class="acct" data-pf="new"><span class="uav" style="background:var(--panel-2);color:var(--muted)">+</span><span><b>Use another profile</b><small>Fill in the sign-up form instead</small></span></button>`);
  ggModal.show();
});
$("#ggList").on("click","[data-pf]",function(){
  const k=$(this).data("pf"); ggModal.hide();
  if(k==="new"){ setAuthTab("signup"); setTimeout(()=>$("#suName").trigger("focus"),300); return; }
  const p=PROFILES[k]; $(this).html(`<span class="spinner-border spinner-border-sm"></span><span>Signing in as ${esc(p.name)}…</span>`);
  setTimeout(()=>signIn(Object.assign({provider:"google"},p),false),500);
});
function signIn(u,isNew){
  u.color=u.color||UCOL[hash(u.email)%UCOL.length];
  S.user=u; S.lastUser={name:u.name,email:u.email};
  if(!S.data) S.data=seed(u);
  // keep "me" rows in sync with the signed-in identity
  syncMe();
  S.onboarded=true; persist();
  ssSet("welcomeToast",isNew?`Welcome, ${u.name.split(" ")[0]}!`:`Signed in as ${u.name}.`);
  location.href="trees.html";
}
