"use strict";
/* Brief loader shown on top of the welcome wizard (see #scr-splash in welcome.blade.php). Purely
   cosmetic now - there's no async routing decision left to make, server-side routing already
   decided this is the right page - so it just plays once then gets out of the way. */
const splashMsgs=["Opening the family archive…","Gathering branches…","Drawing the connectors…","Welcome home."];
let splashI=0;
const splashIv=setInterval(()=>{ splashI++; if(splashI<splashMsgs.length) $("#splashMsg").text(splashMsgs[splashI]); },500);
let splashDone=false;
function splashGo(){
  if(splashDone) return; splashDone=true; clearInterval(splashIv);
  $("#scr-splash").addClass("out").one("animationend",function(){ $(this).remove(); });
}
setTimeout(splashGo,2100);
$("#scr-splash").one("click",splashGo);
