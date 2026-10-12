"use strict";
const splashMsgs=["Opening the family archive…","Gathering branches…","Drawing the connectors…","Welcome home."];
let splashI=0;
const splashIv=setInterval(()=>{ splashI++; if(splashI<splashMsgs.length) $("#splashMsg").text(splashMsgs[splashI]); },650);
let splashDone=false;
function splashGo(){
  if(splashDone) return; splashDone=true; clearInterval(splashIv);
  if(ssGet("forceWelcome")==="1"){ ssDel("forceWelcome"); location.href="welcome.html"; return; }
  if(S.user&&S.data){ location.href="trees.html"; return; }
  if(!S.onboarded){ location.href="welcome.html"; return; }
  location.href="login.html";
}
setTimeout(splashGo,2750);
$("#scr-splash").one("click",splashGo);
