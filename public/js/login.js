"use strict";
function setAuthTab(tab){
  $(".auth-tabs button").each(function(){ const on=$(this).data("auth")===tab; $(this).toggleClass("on",on).attr("aria-selected",on); });
  $("#loginForm").prop("hidden",tab!=="login"); $("#signupForm").prop("hidden",tab!=="signup");
  $("#authTitle").text(tab==="login"?"Welcome back":"Create your account");
  $("#authSub").text(tab==="login"?"Log in to open your family trees.":"Free to use. No card needed.");
  history.replaceState(null,"","/login"+(tab==="signup"?"?tab=signup":""));
}
$(".auth-tabs").on("click","button",function(){ setAuthTab($(this).data("auth")); });
$(document).on("click","[data-eye]",function(){ const $i=$("#"+$(this).data("eye")); const show=$i.attr("type")==="password"; $i.attr("type",show?"text":"password"); $(this).html(show?I.eyeOff:I.eye).attr("aria-label",show?"Hide password":"Show password"); });
$("#liEmail,#suEmail,#liPw,#suPw,#suName").on("input",function(){ $(this).removeClass("is-invalid"); });
$("#suPw").on("input",function(){
  const v=this.value; let s=0; if(v.length>=8) s++; if(/[A-Z]/.test(v)&&/[a-z]/.test(v)) s++; if(/\d/.test(v)) s++; if(/[^A-Za-z0-9]/.test(v)) s++;
  const col=["var(--danger)","var(--female)","#fdd835","var(--ok)"][Math.max(0,s-1)];
  $("#pwStrength i").each(function(i){ $(this).css("background",i<s?col:"var(--edge)"); });
  $("#pwHint").text(!v?"Mix letters, numbers and a symbol for a stronger password.":["Too short","Weak","Fair","Good","Strong"][s]+(v.length<8?": use at least 8 characters.":"."));
});
function busy($b,on,label){ if(on){ $b.data("t",$b.text()).prop("disabled",true).html(`<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}`); } else $b.prop("disabled",false).text($b.data("t")); }
// Both forms POST for real (Laravel handles auth + redisplays validation errors); this just adds
// a light pre-submit check and a busy-button state, matching the rest of the app's forms.
$("#loginForm").on("submit",function(e){
  const em=$("#liEmail").val().trim(), pw=$("#liPw").val(); let ok=true;
  if(!emailOk(em)){ $("#liEmail").addClass("is-invalid"); ok=false; }
  if(!pw){ $("#liPw").addClass("is-invalid"); ok=false; }
  if(!ok){ e.preventDefault(); return; }
  busy($("#liSubmit"),true,"Logging in…");
});
$("#signupForm").on("submit",function(e){
  const nm=$("#suName").val().trim(), em=$("#suEmail").val().trim(), pw=$("#suPw").val(); let ok=true;
  if(!nm){ $("#suName").addClass("is-invalid"); ok=false; }
  if(!emailOk(em)){ $("#suEmail").addClass("is-invalid"); ok=false; }
  if(pw.length<8){ $("#suPw").addClass("is-invalid"); ok=false; }
  if(!$("#suTerms").prop("checked")){ $("#suTerms").addClass("is-invalid"); ok=false; } else { $("#suTerms").removeClass("is-invalid"); }
  if(!ok){ e.preventDefault(); return; }
  busy($("#suSubmit"),true,"Creating account…");
});
