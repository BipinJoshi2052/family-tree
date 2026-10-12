"use strict";
let wi=0;
function paintWelcome(){
  $("#wlStage .slide").each(function(){ const i=+$(this).data("i"); $(this).toggleClass("on",i===wi).toggleClass("off",i<wi); });
  $("#wlDots i").each(function(i){ $(this).toggleClass("on",i===wi); });
  $("#wlSkip").css("visibility",wi===2?"hidden":"visible");
  $("#wlActions").html(wi<2? `<button class="btn btn-go" id="wlNext">Next</button>` :
    `<button class="btn btn-go" data-goauth="signup">Create an account</button><button class="btn btn-quiet" data-goauth="login">I already have an account</button>`);
}
paintWelcome();
$("#wlActions").on("click","#wlNext",()=>{ wi=Math.min(2,wi+1); paintWelcome(); });
$("#wlActions").on("click","[data-goauth]",function(){ location.href="/login?tab="+encodeURIComponent($(this).data("goauth")); });
$("#wlSkip").on("click",()=>{ wi=2; paintWelcome(); });
$("#wlDots").on("click","i",function(){ wi=$(this).index(); paintWelcome(); });
(function(){ let sx=null; const st=document.getElementById("wlStage");
  st.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;},{passive:true});
  st.addEventListener("touchend",e=>{ if(sx==null) return; const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>40){ wi=Math.max(0,Math.min(2,wi+(dx<0?1:-1))); paintWelcome(); } sx=null; });
})();
