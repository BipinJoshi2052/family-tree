"use strict";

const Editor=(function(){
  let tree=null, role="owner", people=[], byId={}, unions=[], parentUnion={}, pos={}, BOUNDS, selected=null;
  const $world=$("#world"), $vp=$("#viewport");
  const ro=()=>role==="viewer";

  let lang="en";
  const dn=p=>(lang==="ne"&&p&&p.nameNe)?p.nameNe:(p?p.name:"");          // display name, falls back to English
  const altName=p=>lang==="ne"?(p.nameNe?p.name:""):(neOn()&&p.nameNe?p.nameNe:"");
  const first=p=>dn(p).split(" ")[0];
  const other=(u,id)=>u.partners.find(x=>x!==id);
  const children=id=>people.filter(c=>c.fid===id||c.mid===id);
  const isAbroad=p=>p.residency==="abroad";

  function index(){ byId={}; people.forEach(p=>{ p.pids=p.pids||[]; byId[p.id]=p; }); }
  function buildUnions(){
    const map=new Map(); const key=(a,b)=>b?[a,b].sort().join("|"):a+"|";
    const get=(a,b)=>{ const k=key(a,b); if(!map.has(k)) map.set(k,{key:k,partners:b?[a,b].sort():[a],children:[]}); return map.get(k); };
    people.forEach(p=>p.pids.forEach(q=>{ if(byId[q]) get(p.id,q); }));
    parentUnion={};
    const sortKey=p=>(p.sortOrder==null?Infinity:p.sortOrder);
    people.slice().sort((a,b)=>sortKey(a)-sortKey(b)||(a.birthDate||"9").localeCompare(b.birthDate||"9")).forEach(c=>{ const ps=[c.fid,c.mid].filter(x=>x&&byId[x]); if(!ps.length) return; const u=get(ps[0],ps[1]); u.children.push(c.id); parentUnion[c.id]=u; });
    unions=[...map.values()]; people.forEach(p=>p._u=[]);
    unions.forEach(u=>u.partners.forEach(pid=>byId[pid]._u.push(u)));
    people.forEach(p=>p._u.sort((a,b)=>{ const oa=p.pids.indexOf(other(a,p.id)), ob=p.pids.indexOf(other(b,p.id)); return (oa<0?99:oa)-(ob<0?99:ob); }));
  }
  function computeGens(){ const g=gensOf(people); people.forEach(p=>p._gen=g[p.id]+1); }
  const CW=230, CH=96, PAD=200;
  /* "Tree" mode: a different layout engine (see treeLayout() below) plus roomier gaps, so sibling
     branches get their own non-overlapping horizontal slot instead of being packed into one row. */
  let layoutMode="default", SPOUSE_GAP=60, SIB_GAP=34, CLUSTER_GAP=70, ROOT_GAP=160, ROWH=300, BUS_STEP=12;
  function applyLayoutSpacing(){
    if(layoutMode==="tree"){ SPOUSE_GAP=100; SIB_GAP=70; CLUSTER_GAP=150; ROOT_GAP=260; ROWH=400; BUS_STEP=20; }
    else { SPOUSE_GAP=60; SIB_GAP=34; CLUSTER_GAP=70; ROOT_GAP=160; ROWH=300; BUS_STEP=12; }
  }
  let filterMode="all", visibleIds=null; // visibleIds: null = show everyone, else a Set of ids the "blood members" filter allows
  const FILTER_KEY=id=>"ftFilter:"+id;
  const cx=id=>pos[id].x+CW/2;
  function arrange(members){
    if(members.length===1) return members;
    const inCl=u=>u.partners.length===2&&u.partners.every(x=>members.includes(x));
    const deg=id=>byId[id]._u.filter(inCl).length;
    const hub=[...members].sort((a,b)=>deg(b)-deg(a)||(parentUnion[b]?1:0)-(parentUnion[a]?1:0))[0];
    const sp=byId[hub]._u.filter(inCl).map(u=>other(u,hub));
    const hx=parentUnion[hub]?parentUnion[hub].x:null, L=[], R=[];
    sp.forEach((s,i)=>{ const sx=parentUnion[s]?parentUnion[s].x:null; if(sx!=null&&hx!=null) (sx<hx?L:R).push(s); else if(sp.length===1) R.push(s); else (i%2===0?L:R).push(s); });
    const order=[...L.reverse(),hub,...R]; members.forEach(m=>{ if(!order.includes(m)) order.push(m); }); return order;
  }
  function pass(prev){
    pos={}; const G=Math.max(...people.map(p=>p._gen));
    for(let g=1;g<=G;g++){
      const row=people.filter(p=>p._gen===g).map(p=>p.id), seen=new Set(), cls=[];
      row.forEach(id=>{ if(seen.has(id)) return; const c=[],q=[id]; seen.add(id);
        while(q.length){ const cur=q.shift(); c.push(cur); byId[cur]._u.forEach(u=>{ const o=other(u,cur); if(o&&byId[o]._gen===g&&!seen.has(o)){seen.add(o);q.push(o);} }); }
        const floating=id=>!parentUnion[id]&&byId[id]._gen>1;
        const ks=c.map(m=>parentUnion[m]).filter(u=>u&&u.x!=null&&!u.partners.every(floating)).map(u=>u.x);
        const bd=c.map(m=>byId[m].birthDate||"9").sort()[0];
        const so=Math.min(...c.map(m=>byId[m].sortOrder==null?Infinity:byId[m].sortOrder));
        let key=ks.length?ks.reduce((a,b)=>a+b,0)/ks.length:null;
        if(key==null){ const kids=[]; c.forEach(m=>byId[m]._u.forEach(u=>u.children.forEach(ch=>{ if(prev[ch]!=null) kids.push(prev[ch]); }))); if(kids.length) key=kids.reduce((a,b)=>a+b,0)/kids.length; }
        cls.push({m:c,key,i:cls.length,bd,so});
      });
      cls.sort((a,b)=>(a.key==null||b.key==null)?(a.key==null&&b.key==null?a.i-b.i:(a.key==null?(g===1?-1:1):(g===1?1:-1))):(a.key-b.key||a.so-b.so||a.bd.localeCompare(b.bd)));
      let cursor=null, prevKey=null;
      cls.forEach(cl=>{
        const order=arrange(cl.m), w=order.length*CW+(order.length-1)*SPOUSE_GAP; let left;
        if(cl.key==null) left=cursor==null?0:cursor+ROOT_GAP;
        else { const gap=(prevKey!=null&&Math.abs(prevKey-cl.key)<1)?SIB_GAP:CLUSTER_GAP; left=cursor==null?cl.key-w/2:Math.max(cl.key-w/2,cursor+gap); }
        order.forEach((id,j)=>pos[id]={x:left+j*(CW+SPOUSE_GAP),y:(g-1)*ROWH});
        cursor=left+w; prevKey=cl.key;
      });
      const gu=unions.filter(u=>byId[u.partners[0]]._gen===g);
      gu.forEach(u=>{ u.x=u.partners.length===2?(cx(u.partners[0])+cx(u.partners[1]))/2:cx(u.partners[0]); });
      gu.sort((a,b)=>a.x-b.x).forEach((u,i)=>{ const far=u.partners.length===2&&Math.abs(cx(u.partners[0])-cx(u.partners[1]))>CW+SPOUSE_GAP+5; u.y=pos[u.partners[0]].y+CH+28+(far?22:0); u.bus=i%3; });
    }
  }
  /* Places each union's hub (x = midpoint of its partners, y = below them) and gives unions in the
     same row a staggered "bus" index so their drop-lines to children don't all sit on one line.
     Only used by treeLayout() below - the default mode's pass() computes this inline per generation
     (its iterative refinement reads a generation's union.x back within the same pass, to pull that
     generation's children toward their parents - computing it separately here would break that). */
  function computeUnionPositions(){
    const byGen={};
    unions.forEach(u=>{ (byGen[byId[u.partners[0]]._gen]=byGen[byId[u.partners[0]]._gen]||[]).push(u); });
    Object.values(byGen).forEach(gu=>{
      gu.forEach(u=>{ u.x=u.partners.length===2?(cx(u.partners[0])+cx(u.partners[1]))/2:cx(u.partners[0]); });
      gu.sort((a,b)=>a.x-b.x).forEach((u,i)=>{ const far=u.partners.length===2&&Math.abs(cx(u.partners[0])-cx(u.partners[1]))>CW+SPOUSE_GAP+5; u.y=pos[u.partners[0]].y+CH+28+(far?22:0); u.bus=i%3; });
    });
  }
  /* "Tree" layout mode: a true recursive (Reingold-Tilford style) tree instead of the default's
     generation-row packing. Each marriage cluster's horizontal slot is exactly as wide as its own
     descendants need, so sibling branches never have to fight for space - unlike the default mode,
     this makes edge overlap structurally impossible, at the cost of using more canvas width. */
  function treeLayout(){
    pos={};
    function clusterChildren(members){
      const kids=new Set();
      members.forEach(id=>byId[id]._u.forEach(u=>{ if(u.partners.every(p=>members.includes(p))) u.children.forEach(c=>kids.add(c)); }));
      return [...kids];
    }
    const claimed=new Set();
    function expandCluster(seedId){
      const local=new Set([seedId]), q=[seedId];
      while(q.length){ const cur=q.shift(); byId[cur]._u.forEach(u=>{ if(u.partners.length===2){ const o=other(u,cur); if(o&&!local.has(o)&&!claimed.has(o)){ local.add(o); q.push(o); } } }); }
      return [...local];
    }
    function hasBloodLink(seedId){
      const seen=new Set([seedId]), q=[seedId];
      while(q.length){ const cur=q.shift(); if(parentUnion[cur]) return true;
        byId[cur]._u.forEach(u=>{ if(u.partners.length===2){ const o=other(u,cur); if(o&&!seen.has(o)){ seen.add(o); q.push(o); } } }); }
      return false;
    }
    function buildNode(seedId){
      const members=expandCluster(seedId); members.forEach(id=>claimed.add(id));
      const order=arrange(members), rowWidth=order.length*CW+(order.length-1)*SPOUSE_GAP;
      const kids=clusterChildren(members).filter(id=>!claimed.has(id)).map(buildNode);
      const kidsWidth=kids.length?kids.reduce((a,n)=>a+n.width,0)+(kids.length-1)*CLUSTER_GAP:0;
      return {order,rowWidth,kids,width:Math.max(rowWidth,kidsWidth),gen:Math.max(...order.map(id=>byId[id]._gen))};
    }
    function placeNode(node,left){
      const rowLeft=left+(node.width-node.rowWidth)/2;
      node.order.forEach((id,j)=>{ pos[id]={x:rowLeft+j*(CW+SPOUSE_GAP),y:(node.gen-1)*ROWH}; });
      if(node.kids.length){
        const kidsWidth=node.kids.reduce((a,n)=>a+n.width,0)+(node.kids.length-1)*CLUSTER_GAP;
        let cursor=left+(node.width-kidsWidth)/2;
        node.kids.forEach(k=>{ placeNode(k,cursor); cursor+=k.width+CLUSTER_GAP; });
      }
    }
    let rootIds=people.filter(p=>!parentUnion[p.id]&&!hasBloodLink(p.id)).map(p=>p.id);
    if(!rootIds.length) rootIds=people.filter(p=>!parentUnion[p.id]).map(p=>p.id);
    let cursor=0;
    rootIds.forEach(id=>{ if(claimed.has(id)) return; const r=buildNode(id); placeNode(r,cursor); cursor+=r.width+ROOT_GAP; });
    people.forEach(p=>{ if(!pos[p.id]){ pos[p.id]={x:cursor,y:(p._gen-1)*ROWH}; cursor+=CW+ROOT_GAP; } });
  }
  function layout(){
    applyLayoutSpacing();
    unions.forEach(u=>{u.x=null;});
    if(layoutMode==="tree"){ treeLayout(); computeUnionPositions(); }
    else { pass({}); for(let i=0;i<3;i++){ const prev={}; people.forEach(p=>prev[p.id]=cx(p.id)); pass(prev); } }
    let mn=Infinity,mx=-Infinity,my=0; Object.values(pos).forEach(p=>{mn=Math.min(mn,p.x);mx=Math.max(mx,p.x+CW);my=Math.max(my,p.y+CH);});
    const dx=PAD-mn; Object.values(pos).forEach(p=>{p.x+=dx;p.y+=PAD;}); unions.forEach(u=>{u.x+=dx;u.y+=PAD;});
    BOUNDS={w:mx-mn+PAD*2,h:my+PAD*2,G:Math.max(...people.map(p=>p._gen))};
  }
  function ortho(pts,r){
    pts=pts.filter((p,i)=>i===0||p[0]!==pts[i-1][0]||p[1]!==pts[i-1][1]);
    let d=`M${pts[0][0]},${pts[0][1]}`;
    for(let i=1;i<pts.length-1;i++){ const [x0,y0]=pts[i-1],[x1,y1]=pts[i],[x2,y2]=pts[i+1]; const d1=Math.hypot(x1-x0,y1-y0),d2=Math.hypot(x2-x1,y2-y1),rr=Math.min(r,d1/2,d2/2);
      if(rr<.5||(x0===x1&&x1===x2)||(y0===y1&&y1===y2)){d+=` L${x1},${y1}`;continue;}
      d+=` L${x1-(x1-x0)/d1*rr},${y1-(y1-y0)/d1*rr} Q${x1},${y1} ${x1+(x2-x1)/d2*rr},${y1+(y2-y1)/d2*rr}`; }
    const l=pts[pts.length-1]; return d+` L${l[0]},${l[1]}`;
  }

  function portrait(p){
    const h=hash(p.id+p.name), hue=p.gender==="male"?200+(h%30):24+(h%20);
    const skins=["#f2cba9","#e2ae86","#c48a62","#9a6644","#6e4630","#f0d2b8"], skin=skins[(h>>3)%6];
    const old=p.birthDate&&+yr(p.birthDate)<1945;
    const hairs=["#2b1d14","#4a3020","#7a4b2a","#b07b3e","#1c1c1c","#8c5a3c"], hair=old?"#cfccc6":hairs[(h>>6)%6];
    const shirt=`hsl(${(hue+150)%360},22%,${26+(h>>9)%16}%)`;
    const back=p.gender==="female"?`<path d="M30 52a30 30 0 0 1 60 0v34c-6-3-9-12-9-22 0-17-9-27-21-27s-21 10-21 27c0 10-3 19-9 22z" fill="${hair}"/>`:"";
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="hsl(${hue},45%,38%)"/>${back}<path d="M10 120c3-26 24-38 50-38s47 12 50 38z" fill="${shirt}"/><rect x="51" y="74" width="18" height="18" rx="7" fill="${skin}"/><ellipse cx="60" cy="54" rx="22" ry="26" fill="${skin}"/><path d="M37 50c0-17 10-27 23-27s23 10 23 27c-5-8-12-13-23-13s-18 5-23 13z" fill="${hair}"/></svg>`;
    return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
  }
  const SIL=(g,size,dashed)=>g==="female"
    ? `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="${dashed?"none":"currentColor"}" stroke="${dashed?"currentColor":"none"}" stroke-width="2"><path d="M11 40c0-8 4-13 9-13s9 5 9 13"/><path d="M12 22c0-8 3.5-13 8-13s8 5 8 13c0 3-1 5-2 6-1-4-3-6-6-6s-5 2-6 6c-1-1-2-3-2-6z"/></svg>`
    : `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="${dashed?"none":"currentColor"}" stroke="${dashed?"currentColor":"none"}" stroke-width="2"><path d="M8 40c0-8 5-13 12-13s12 5 12 13"/><circle cx="20" cy="16" r="7"/></svg>`;
  function avatar(p,size){
    const sil=`<div class="sil">${SIL(p.gender,Math.round(size*.82))}</div>`;
    /* width/height are set as real HTML attributes (not just CSS) so the image can never render at
       its natural size - a 600x600 uploaded photo - even for a split second before CSS applies, or
       in a context where the .mini-av/.d-photo/.av CSS doesn't reach it for some reason. */
    if(typeof p.img==="string"&&p.img.startsWith("images/")) return sil+`<img width="${size}" height="${size}" src="${esc(imgUrl(p.img,p.updatedAt))}" alt="" onerror="this.remove()">`;
    const src=p.img===A?portrait(p):p.img; return src? sil+`<img width="${size}" height="${size}" src="${esc(src)}" alt="" onerror="this.remove()">` : sil; }
  const dateLine=p=> p.status==="deceased"? `${p.birthDate?yr(p.birthDate):"?"} – ${p.deathDate?yr(p.deathDate):"?"}` : (p.birthDate?`b. ${fmt(p.birthDate)}`:"Birth date unknown");

  /* pan/zoom */
  const view={x:0,y:0,k:1}, KMIN=.08, KMAX=2.2;
  let autoFit=true;   // true until the user manually zooms/pans/centers; see the resize handler below
  function apply(anim){ $world.toggleClass("anim",!!anim).css("transform",`translate(${view.x}px,${view.y}px) scale(${view.k})`); $("#zread").text(Math.round(view.k*100)+"%"); }
  function zoomAt(f,sx,sy,anim){ autoFit=false; const k=Math.min(KMAX,Math.max(KMIN,view.k*f)),r=k/view.k; view.x=sx-(sx-view.x)*r; view.y=sy-(sy-view.y)*r; view.k=k; apply(anim); }
  const vs=()=>({w:$vp[0].clientWidth,h:$vp[0].clientHeight});
  function fit(anim){ autoFit=true; const {w,h}=vs(); if(!w) return; const bw=BOUNDS.w-PAD*2+180, bh=BOUNDS.h-PAD*2+40, ox=PAD-160, oy=PAD-30;
    const k=Math.min(1,Math.max(KMIN,Math.min((w-32)/bw,(h-90)/bh))); view.k=k; view.x=(w-bw*k)/2-ox*k; view.y=(h-50-bh*k)/2-oy*k+10; apply(anim); }
  function centerOn(id,k,anim=true){ autoFit=false; const {w,h}=vs(); if(k) view.k=k; view.x=w/2-cx(id)*view.k; view.y=h/2-(pos[id].y+CH/2)*view.k-10; apply(anim); }
  $("#zin").on("click",()=>{const {w,h}=vs();zoomAt(1.25,w/2,h/2,true);});
  $("#zout").on("click",()=>{const {w,h}=vs();zoomAt(.8,w/2,h/2,true);});
  $("#reset").on("click",()=>fit(true));
  $vp[0].addEventListener("wheel",e=>{ e.preventDefault(); const r=$vp[0].getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),e.clientX-r.left,e.clientY-r.top,false); },{passive:false});
  const ptrs=new Map(); let drag=null,pinch=null,lastDrag=0;
  $vp.on("pointerdown",e=>{ const ev=e.originalEvent; if($(ev.target).closest(".status").length) return; ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
    if(ptrs.size===1) drag={sx:ev.clientX,sy:ev.clientY,vx:view.x,vy:view.y,moved:false};
    if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),k:view.k}; drag=null; } });
  $(window).on("pointermove",e=>{ const ev=e.originalEvent; if(!ptrs.has(ev.pointerId)) return; ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
    if(pinch&&ptrs.size===2){ const [a,b]=[...ptrs.values()],r=$vp[0].getBoundingClientRect(); zoomAt(pinch.k*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d/view.k,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top,false); return; }
    if(drag){ const dx=ev.clientX-drag.sx,dy=ev.clientY-drag.sy; if(!drag.moved&&Math.hypot(dx,dy)>5){drag.moved=true;autoFit=false;$vp.addClass("grabbing");} if(drag.moved){view.x=drag.vx+dx;view.y=drag.vy+dy;apply(false);} } });
  $(window).on("pointerup pointercancel",e=>{ const ev=e.originalEvent; ptrs.delete(ev.pointerId); if(ptrs.size<2) pinch=null; if(drag&&drag.moved) lastDrag=Date.now(); if(!ptrs.size){drag=null;$vp.removeClass("grabbing");} });

  /* selection & ghosts */
  function lineage(id){
    const S2={p:new Set([id]),u:new Set(),e:new Set()};
    (function up(x){ const u=parentUnion[x]; if(!u) return; S2.u.add(u.key); S2.e.add(`uc:${u.key}:${x}`); u.partners.forEach(p=>{S2.p.add(p);S2.e.add(`pu:${p}:${u.key}`);up(p);}); })(id);
    (function down(x){ byId[x]._u.forEach(u=>{ if(!u.children.length&&x!==id) return; S2.u.add(u.key); u.partners.forEach(p=>{S2.p.add(p);S2.e.add(`pu:${p}:${u.key}`);}); u.children.forEach(c=>{S2.p.add(c);S2.e.add(`uc:${u.key}:${c}`);down(c);}); }); })(id);
    return S2;
  }
  function applySelection(){
    $("#nodes .node").removeClass("selected lit"); $("#links .lit").removeClass("lit"); $("#ghosts").empty(); $("#glinks").empty();
    if(!selected||!byId[selected]){ selected=null; $world.removeClass("dim"); status(); return; }
    const L=lineage(selected);
    L.p.forEach(id=>$(`#nodes .node[data-id="${id}"]`).addClass("lit")); L.u.forEach(k=>$(`#links circle[data-u="${k}"]`).addClass("lit")); L.e.forEach(k=>$(`#links path[data-k="${k}"]`).addClass("lit"));
    $(`#nodes .node[data-id="${selected}"]`).addClass("selected"); $world.addClass("dim");
    if(!ro()) drawGhosts(); status();
  }
  const GW=166, GH=62;
  const overlaps=(x,y,w,h)=>Object.values(pos).some(p=>x<p.x+CW&&x+w>p.x&&y<p.y+CH&&y+h>p.y);
  function drawGhosts(){
    const p=byId[selected], q=pos[selected], mid=q.x+CW/2, G=[], py=q.y-GH-92, cy=q.y+CH+86;
    if(!p.mid) G.push({rel:"mother",gender:"female",label:"Add Mother",x:mid-GW-14,y:py});
    if(!p.fid) G.push({rel:"father",gender:"male",label:"Add Father",x:mid+14,y:py});
    const sg=p.gender==="male"?"female":"male"; let sx=q.x+CW+28, sy=q.y+(CH-GH)/2;
    if(overlaps(sx,sy,GW,GH)){ const lx=q.x-GW-28; if(!overlaps(lx,sy,GW,GH)) sx=lx; }
    if(filterMode!=="blood") G.push({rel:"partner",gender:sg,label:p.gender==="male"?"Add Wife":"Add Husband",x:sx,y:sy});
    G.push({rel:"son",gender:"male",label:"Add Son",x:mid-GW-14,y:cy});
    G.push({rel:"daughter",gender:"female",label:"Add Daughter",x:mid+14,y:cy});
    const nP=p.pids.filter(x=>byId[x]).length;
    const sub={mother:`of ${first(p)}`,father:`of ${first(p)}`,partner:nP?`Spouse #${nP+1} of ${first(p)}`:`Spouse of ${first(p)}`,son:`of ${first(p)}`,daughter:`of ${first(p)}`};
    let gl="",gh="";
    G.forEach((g,i)=>{ const gx=g.x+GW/2;
      if(g.rel==="mother"||g.rel==="father") gl+=`<path class="gedge" d="${ortho([[gx,g.y+GH],[gx,q.y-34],[mid,q.y-34],[mid,q.y]],10)}"/>`;
      else if(g.rel==="partner"){ const fx=g.x>q.x?q.x+CW:q.x, tx=g.x>q.x?g.x:g.x+GW; gl+=`<path class="gedge" d="M${fx},${q.y+CH/2} H${tx}"/>`; }
      else gl+=`<path class="gedge" d="${ortho([[mid,q.y+CH],[mid,q.y+CH+44],[gx,q.y+CH+44],[gx,g.y]],10)}"/>`;
      gh+=`<div class="ghost ${g.gender}" data-rel="${g.rel}" style="left:${g.x}px;top:${g.y}px;animation-delay:${i*40}ms" tabindex="0" role="button" aria-label="${g.label} ${sub[g.rel]}"><div class="gav">${SIL(g.gender,34,true)}</div><div class="gl"><b>${g.label}</b><span>${esc(sub[g.rel])}</span></div><span class="plus">+</span></div>`; });
    $("#glinks").html(gl); $("#ghosts").html(gh);
  }
  function status(){
    if(!selected){ $("#status").html(ro()?"View only · tap a card to trace its lineage · drag to pan · pinch or scroll to zoom":"Tap a card to trace its lineage and add relatives · drag to pan · pinch or scroll to zoom"); return; }
    $("#status").html(`<b>${esc(dn(byId[selected]))}</b> selected · ${ro()?"you can view this tree but not change it":"tap a dashed card to add a relative · tap × or empty space to close"}`);
  }
  function select(id,center){ selected=id; applySelection(); if(center&&id) centerOn(id,Math.max(view.k,.7)); }
  $("#nodes").on("click",".node",function(e){ if(Date.now()-lastDrag<250) return; const id=$(this).data("id"), act=$(e.target).closest("[data-act]").data("act");
    if(act==="info"){ e.stopPropagation(); openDetails(id); return; } if(act==="close"){ e.stopPropagation(); select(null); return; } select(id,act==="add"); });
  $("#nodes").on("keydown",".node",function(e){ if(e.target===this&&(e.key==="Enter"||e.key===" ")){e.preventDefault();select($(this).data("id"));} });
  $("#ghosts").on("click",".ghost",function(){ if(Date.now()-lastDrag<250) return; openAdd(selected,$(this).data("rel")); })
    .on("keydown",".ghost",function(e){ if(e.key==="Enter"||e.key===" "){e.preventDefault();openAdd(selected,$(this).data("rel"));} });
  $vp.on("click",e=>{ if(Date.now()-lastDrag<250) return; if(!$(e.target).closest(".node,.ghost,.status").length) select(null); });
  $(document).on("keydown",e=>{ if(e.key==="Escape"&&!$(".modal.show").length){ select(null); $("#results").prop("hidden",true);} });

  /* add relative */
  const addModal=$("#addModal").length?new bootstrap.Modal("#addModal"):null; let addCtx=null, uploadData="";
  const REL={mother:"Mother",father:"Father",son:"Son",daughter:"Daughter"};
  function openAdd(id,rel){
    const p=byId[id]; const gender=(rel==="mother"||rel==="daughter")?"female":(rel==="father"||rel==="son")?"male":(p.gender==="male"?"female":"male");
    const relName=rel==="partner"?(gender==="female"?"Wife":"Husband"):REL[rel]; addCtx={id,rel,gender,relName};
    $("#addForm")[0].reset(); $("#addForm").removeClass("was-validated"); uploadData=""; uploadBlob=null;
    $("#addModal .modal-content").css({"--c":`var(--${gender})`,"--cd":`var(--${gender}-deep)`});
    $("#addChip").html(SIL(gender,24)); $("#addTitle").text(`Add ${relName} to ${dn(p)}`); $("#fNameLbl").text(neOn()?"Full name (English)":"Full name"); $("#fNameNe").val(""); $("#addSubmit").text(`Add ${relName.toLowerCase()}`);
    $("#deathWrap").prop("hidden",true); $("#imgNote").text("Optional");
    const surname=p.name.split(" ").slice(1).join(" ");
    $("#fName").attr("placeholder",(rel==="son"||rel==="daughter"||rel==="father")&&surname?`e.g. ${gender==="male"?"Arthur":"Rose"} ${surname}`:"Full name");
    const partners=p.pids.map(x=>byId[x]).filter(Boolean), $co=$("#fCo").empty();
    if(rel==="son"||rel==="daughter"){
      $("#coWrap").prop("hidden",false); $("#coLabel").text(p.gender==="male"?"Select Mother":"Select Father");
      partners.slice().reverse().forEach(sp=>$co.append(`<option value="${sp.id}">${esc(dn(sp))}${sp.status==="deceased"?" (†)":""}</option>`));
      $co.append(`<option value="">Not recorded: link to ${esc(first(p))} only</option>`);
      $("#coHelp").text(partners.length>1?`${first(p)} has ${partners.length} spouses. The child will hang from the union you pick.`:partners.length?"":`${first(p)} has no spouse on record yet.`);
    } else {
      $("#coWrap").prop("hidden",true);
      if(rel==="partner"&&partners.length) $("#imgNote").text(`${first(p)}'s existing ${partners.length===1?"spouse stays":"spouses stay"} in the tree.`);
      if(rel==="mother"||rel==="father"){ const op=byId[rel==="mother"?p.fid:p.mid]; if(op) $("#imgNote").text(`Will be recorded as a spouse of ${op.name}.`); }
    }
    prevAvatar(); addModal.show();
  }
  $("#addModal").on("shown.bs.modal",()=>$("#fName").trigger("focus"));
  $("input[name=fStatus]").on("change",function(){ $("#deathWrap").prop("hidden",this.value!=="deceased"); });
  function prevAvatar(){ const src=uploadData||$("#fImg").val().trim();
    $("#avPrev").css("background",`var(--${addCtx.gender}-deep)`).html(`<div class="sil">${SIL(addCtx.gender,52)}</div>`+(src?`<img src="${esc(src)}" alt="Avatar preview">`:""));
    $("#avPrev img").on("error",function(){ $(this).remove(); $("#imgNote").text("That address didn't load here. Upload the photo instead, or keep the silhouette."); }); }
  $("#fImg").on("input",()=>{ uploadData=""; uploadBlob=null; $("#fFile").val(""); prevAvatar(); });
  let uploadBlob=null;
  $("#fFile").on("change",async function(){ const f=this.files[0]; if(!f) return;
    try{ const r=await cropPhoto(f); uploadData=r.dataUrl; uploadBlob=r.blob; $("#fImg").val("");
      $("#imgNote").text(`${f.name} · will be saved as this person's photo`); prevAvatar(); }
    catch(e){ toast(e.message||"Couldn't read that photo.","danger"); } });
  $("#addForm").on("submit",async function(e){
    e.preventDefault(); if(!this.checkValidity()){ $(this).addClass("was-validated"); return; }
    const {id,rel,gender,relName}=addCtx, p=byId[id], st=$("input[name=fStatus]:checked").val();
    const ne=neOn()?$("#fNameNe").val().trim():"";
    const $btn=$("#addSubmit"); $btn.prop("disabled",true);
    try{
      const created=await Api.people.add(tree.id,{
        rel, relative_id:id, co_parent_id:(rel==="son"||rel==="daughter")?($("#fCo").val()||null):null,
        name:$("#fName").val().trim(), name_ne:ne||null, gender,
        birth_date:$("#fBirth").val()||null, birthplace:$("#fPlace").val().trim()||null,
        status:st, death_date:st==="deceased"?($("#fDeath").val()||null):null,
        residency:$("input[name=fResidency]:checked").val(),
      });
      const n=normalizePerson(created);
      if(uploadBlob){ try{ const r=await Api.people.uploadPhoto(n.id,uploadBlob); n.img=r.img; n.updatedAt=Date.now(); }catch(_){ toast("Person added, but the photo couldn't be saved.","female"); } }
      /* The server links both sides of a mother/father/partner relationship, but only the new
         person's own record comes back in the response - mirror the other side(s) locally too,
         or gensOf()'s generation-matching (which reads fid/mid/pids) sees a stale, one-sided view
         and leaves the new relative parked at its default generation instead of next to `p`. */
      if(rel==="partner"){
        if(!p.pids.includes(n.id)) p.pids.push(n.id);
      } else if(rel==="mother"||rel==="father"){
        const slot=rel==="mother"?"mid":"fid", otherSlot=rel==="mother"?"fid":"mid";
        p[slot]=n.id;
        const other=byId[p[otherSlot]];
        if(other){ if(!other.pids.includes(n.id)) other.pids.push(n.id); if(!n.pids.includes(other.id)) n.pids.push(other.id); }
      }
      people.push(n); addModal.hide(); render(); header();
      const coName=(rel==="son"||rel==="daughter")&&$("#fCo").val()?` with ${byId[$("#fCo").val()].name}`:"";
      $(`#nodes .node[data-id="${n.id}"]`).addClass("fresh");
      toast(`Added ${n.name} as ${relName.toLowerCase()} of ${p.name}${coName}.`,gender);
    }catch(xhr){ toast(apiErr(xhr),"danger"); }
    finally{ $btn.prop("disabled",false); }
  });

  /* details */
  const detModal=$("#detModal").length?new bootstrap.Modal("#detModal"):null; let detId=null;
  const summaryModal=$("#summaryModal").length?new bootstrap.Modal("#summaryModal"):null;
  /* "Blood members": people related by descent, not by marriage - a son's wife or a daughter's
     husband who married in (no recorded parents of their own) doesn't count, even though they're
     part of the tree. Anyone with a recorded parent is blood by definition; a rootless person (no
     recorded parents) only counts if their whole marriage cluster is itself rootless - i.e. they're
     a founding ancestor, not someone who married into an existing blood line. */
  function computeBloodMemberIds(){
    const blood=new Set();
    people.forEach(p=>{ if(parentUnion[p.id]) blood.add(p.id); });
    const seen=new Set();
    people.filter(p=>!parentUnion[p.id]).forEach(p=>{
      if(seen.has(p.id)) return;
      const cluster=new Set([p.id]), q=[p.id];
      while(q.length){ const cur=q.shift(); byId[cur]._u.forEach(u=>{ if(u.partners.length===2){ const o=other(u,cur); if(o&&!cluster.has(o)){ cluster.add(o); q.push(o); } } }); }
      cluster.forEach(id=>seen.add(id));
      if(![...cluster].some(id=>parentUnion[id])) cluster.forEach(id=>blood.add(id));
    });
    return blood;
  }
  function openSummary(gen){
    const scope=gen?people.filter(p=>p._gen===gen):people;
    const total=scope.length, male=scope.filter(p=>p.gender==="male").length, female=total-male;
    const bloodIds=computeBloodMemberIds(), bloodScope=scope.filter(p=>bloodIds.has(p.id)),
      bloodTotal=bloodScope.length, bloodMale=bloodScope.filter(p=>p.gender==="male").length, bloodFemale=bloodTotal-bloodMale;
    const tile=(label,val)=>`<div class="sum-tile"><b>${val}</b><span>${esc(label)}</span></div>`;
    if(gen){
      $("#sumTitle").text(`Generation ${gen}`);
      $("#sumGrid").html([tile("Total members",total),tile("Male",male),tile("Female",female),
        tile("Blood members",bloodTotal),tile("Blood males",bloodMale),tile("Blood females",bloodFemale)].join(""));
    } else {
      const deceased=scope.filter(p=>p.status==="deceased").length, living=total-deceased,
        abroad=scope.filter(isAbroad).length, inCountry=total-abroad;
      $("#sumTitle").text("Tree summary");
      $("#sumGrid").html([tile("Total members",total),tile("Male",male),tile("Female",female),
        tile("Deceased",deceased),tile("Living",living),tile("In country",inCountry),tile("Abroad",abroad),
        tile("Blood members",bloodTotal),tile("Blood males",bloodMale),tile("Blood females",bloodFemale)].join(""));
    }
    summaryModal.show();
  }
  $("#eMenu").on("click","#eSummaryBtn",()=>openSummary());
  $("#nodes").on("click",".gen-tag",function(){ openSummary(+$(this).data("gen")); });
  const plink=id=>{ const q=byId[id]; return `<button type="button" class="plink" data-goto="${id}"><span class="mini-av ${q.gender}">${avatar(q,24)}</span>${esc(dn(q))}</button>`; };
  function age(p){ if(!p.birthDate) return ""; const b=new Date(p.birthDate), d=p.status==="deceased"&&p.deathDate?new Date(p.deathDate):new Date(); let a=d.getFullYear()-b.getFullYear(); if(d<new Date(d.getFullYear(),b.getMonth(),b.getDate())) a--; return p.status==="deceased"?(p.deathDate?`died aged ${a}`:""):`age ${a}`; }
  /* Ancestors of id, nearest generation first: [[parents...],[grandparents...],[great-grandparents...],...] */
  function ancestorGroups(id){
    const groups=[]; let current=[id];
    for(let i=0;i<12;i++){
      const next=new Set();
      current.forEach(cid=>{ const person=byId[cid]; if(!person) return; if(person.fid&&byId[person.fid]) next.add(person.fid); if(person.mid&&byId[person.mid]) next.add(person.mid); });
      if(!next.size) break;
      groups.push([...next]); current=[...next];
    }
    return groups;
  }
  function ancestorLabel(i){
    if(i===0) return "Parents"; if(i===1) return "Grandparents"; if(i===2) return "Great-grandparents";
    return "Great-"+"great-".repeat(i-2)+"grandparents";
  }
  function detReadHtml(p){
    const parents=[p.fid,p.mid].filter(x=>x&&byId[x]), sps=p.pids.filter(x=>byId[x]);
    const groups=p._u.filter(u=>u.children.length).map(u=>{
      const o=other(u,p.id), last=u.children.length-1;
      const kids=u.children.map((c,i)=>{
        const btns=ro()?"":`<span class="kid-reorder">
          <button type="button" class="ibtn xs" data-reorder="up" data-u="${esc(u.key)}" data-id="${c}"${i===0?" disabled":""} aria-label="Move ${esc(dn(byId[c]))} up">${I.chevUp}</button>
          <button type="button" class="ibtn xs" data-reorder="down" data-u="${esc(u.key)}" data-id="${c}"${i===last?" disabled":""} aria-label="Move ${esc(dn(byId[c]))} down">${I.chevDown}</button>
        </span>`;
        return `<li class="kid-row">${btns}${plink(c)}<small>${byId[c].birthDate?yr(byId[c].birthDate):""}</small></li>`;
      }).join("");
      return `<div class="grp"><div class="lbl">${o?`With ${esc(dn(byId[o]))}`:"Co-parent not recorded"}</div><ul class="kids-list">${kids}</ul></div>`;
    }).join("");
    const ANCESTOR_SHOWN=3, GEN_SHOWN=3;
    const renderAncestorGroup=(g,i)=>{
      const shown=g.slice(0,ANCESTOR_SHOWN).map(plink).join(""), hiddenPeople=g.slice(ANCESTOR_SHOWN);
      const morePeople=hiddenPeople.length?`<span class="more-kids" style="display:none">${hiddenPeople.map(plink).join("")}</span><button type="button" class="btn btn-quiet btn-sm" data-showmore>Show ${hiddenPeople.length} more</button>`:"";
      return `<div class="grp"><div class="lbl">${ancestorLabel(i)}</div><div class="kids">${shown}${morePeople}</div></div>`;
    };
    const allAncestorGroups=ancestorGroups(p.id);
    const shownGroups=allAncestorGroups.slice(0,GEN_SHOWN).map(renderAncestorGroup).join("");
    const hiddenGroups=allAncestorGroups.slice(GEN_SHOWN);
    const moreGens=hiddenGroups.length?`<div class="more-ancestors" style="display:none">${hiddenGroups.map((g,j)=>renderAncestorGroup(g,j+GEN_SHOWN)).join("")}</div><button type="button" class="btn btn-quiet btn-sm" data-showmoregens>Show ${hiddenGroups.length} earlier generation${hiddenGroups.length===1?"":"s"}</button>`:"";
    const ancestors=shownGroups+moreGens;
    const sib=new Set(); parents.forEach(par=>children(par).forEach(c=>{ if(c.id!==p.id) sib.add(c.id); }));
    const removeBtn=(p.img&&p.img!==A)?'<button type="button" class="btn btn-quiet btn-sm" id="dPhotoDel">Remove</button>':"";
    const photoActions=ro()?"":`<div class="d-flex flex-wrap gap-2 justify-content-center mt-3"><label class="btn btn-quiet btn-sm mb-0" for="dPhoto">${p.img&&p.img!==A?"Change photo":"Upload photo"}</label>${removeBtn}</div>`;
    const editBtn=ro()?"":`<button type="button" class="ibtn" id="detEditBtn" aria-label="Edit ${esc(p.name)}'s details" title="Edit details">${I.edit}</button>`;
    const removeSec=ro()?"":`<div class="d-sec d-flex flex-wrap gap-2">
      <button type="button" class="btn btn-quiet btn-sm" id="detBranchBtn">${I.branch}<span class="ms-1">Branch ${esc(first(p))}'s line into a new tree</span></button>
      <button type="button" class="btn btn-quiet btn-sm" id="detRemoveBtn" style="color:#ff8a80">${I.trash}<span class="ms-1">Remove ${esc(first(p))} from this tree</span></button>
    </div>`;
    return `<div class="d-hero" style="--c:var(--${p.gender});--cd:var(--${p.gender}-deep)"><div><div class="d-photo">${avatar(p,140)}</div>${photoActions}</div>
      <div style="min-width:0"><div class="d-flex align-items-center gap-2 flex-wrap"><h2 class="d-name" id="detName" style="margin-bottom:0">${esc(dn(p))}</h2>${editBtn}</div>${altName(p)?`<div class="alt-name">${esc(altName(p))}</div>`:""}<div class="d-sub">${dateLine(p)}${age(p)?` · ${age(p)}`:""}</div>
      <dl class="facts">${neOn()?`<dt>English name</dt><dd>${esc(p.name)}</dd><dt>नेपाली नाम</dt><dd>${p.nameNe?`<span lang="ne">${esc(p.nameNe)}</span>`:'<span class="muted">Not added · English name is shown</span>'}</dd>`:""}<dt>Gender</dt><dd><span class="sw-dot" style="background:var(--${p.gender})"></span>${p.gender==="male"?"Male":"Female"}</dd>
      <dt>Born</dt><dd>${p.birthDate?fmt(p.birthDate):'<span class="muted">Unknown</span>'}</dd><dt>Birthplace</dt><dd>${p.birthplace?esc(p.birthplace):'<span class="muted">Unknown</span>'}</dd>
      <dt>Status</dt><dd>${p.status==="deceased"?`Deceased${p.deathDate?` · ${fmt(p.deathDate)}`:""}`:"Living"}</dd>
      <dt>Phone</dt><dd>${p.phone?esc(p.phone):'<span class="muted">Not added</span>'}</dd>
      <dt>Current location</dt><dd>${p.location?esc(p.location):'<span class="muted">Not added</span>'}</dd>
      <dt>Residency</dt><dd>${isAbroad(p)?"Abroad":"In country"}</dd>
      <dt>Parents</dt><dd>${parents.length?parents.map(plink).join(" &amp; "):'<span class="muted">Not recorded</span>'}</dd>${sib.size?`<dt>Siblings</dt><dd>${[...sib].map(plink).join(", ")}</dd>`:""}</dl></div></div>
      <div class="d-sec"><h6>Parents</h6>${ancestors||'<p class="muted mb-0">No parents recorded.</p>'}</div>
      <div class="d-sec"><h6>Spouses (${sps.length})</h6>${sps.length?`<div class="d-flex flex-wrap gap-3">${sps.map(plink).join("")}</div>`:'<p class="muted mb-0">No spouse recorded.</p>'}</div>
      <div class="d-sec"><h6>Children by spouse</h6>${groups||'<p class="muted mb-0">No children recorded.</p>'}</div>
      <div class="d-sec"><h6>Biography</h6><p class="bio">${p.bio?esc(p.bio):'<span class="muted">No notes yet.</span>'}</p></div>
      ${removeSec}`;
  }
  /* Every descendant of id (children, grandchildren, ...), so the father/mother pickers below can't
     offer someone already below this person - picking one would create a cycle. */
  function descendantIdsOf(id){
    const result=new Set(), queue=[id];
    while(queue.length){ const cur=queue.shift();
      people.forEach(c=>{ if((c.fid===cur||c.mid===cur)&&!result.has(c.id)){ result.add(c.id); queue.push(c.id); } }); }
    return result;
  }
  /* Candidates for a parent slot, in priority order:
     1. If the OTHER parent slot is already known, offer THAT parent's recorded spouse(s) - this
        applies whether or not this slot is already filled, so e.g. a father with two recorded
        wives offers both as the mother option for any of his children, not just whichever one
        happens to already be recorded - letting a wrong pick be corrected, not just confirmed.
     2. Otherwise, if this slot is already set (and the other parent gave us nothing to anchor on),
        lock to just that one person rather than offering to swap in someone unrelated.
     3. Otherwise, fall back to everyone of the matching gender in the tree.
     The current value is always included even if step 1's spouse list doesn't happen to contain it
     (e.g. imported data where pids wasn't kept in sync with father_id/mother_id) - otherwise saving
     the form unchanged could silently clear a value that just didn't show up as selected. */
  function parentCandidates(p,gender,currentId,otherParentId,excl){
    let candidates=[];
    if(otherParentId&&byId[otherParentId]){
      candidates=byId[otherParentId].pids.map(id=>byId[id]).filter(c=>c&&c.gender===gender&&!excl.has(c.id));
    }
    if(!candidates.length&&currentId&&byId[currentId]) candidates=[byId[currentId]];
    if(!candidates.length) candidates=people.filter(c=>c.gender===gender&&c.id!==p.id&&!excl.has(c.id));
    if(currentId&&byId[currentId]&&!candidates.some(c=>c.id===currentId)) candidates=[byId[currentId],...candidates];
    return candidates;
  }
  function parentSelect(p,fieldId,gender,currentId,otherParentId,excl){
    const opts=parentCandidates(p,gender,currentId,otherParentId,excl)
      .map(c=>`<option value="${c.id}"${c.id===currentId?" selected":""}>${esc(dn(c))}</option>`).join("");
    return `<select class="form-select" id="${fieldId}"><option value=""${currentId?"":" selected"}>Not recorded</option>${opts}</select>`;
  }
  function detEditHtml(p){
    const excl=descendantIdsOf(p.id); excl.add(p.id);
    return `<form id="detEditForm" novalidate class="d-grid gap-3">
      <div><label class="form-label" for="deName">Full name</label><input class="form-control" id="deName" required maxlength="80" value="${esc(p.name)}"><div class="invalid-feedback">Enter a name.</div></div>
      ${neOn()?`<div><label class="form-label" for="deNameNe">Nepali name · नेपाली नाम</label><input class="form-control" id="deNameNe" lang="ne" maxlength="80" value="${esc(p.nameNe||"")}" placeholder="जस्तै: राम बहादुर श्रेष्ठ"></div>`:""}
      <div><span class="form-label d-block">Gender</span><div class="seg" role="radiogroup" aria-label="Gender"><input type="radio" name="deGender" id="deGm" value="male"${p.gender==="male"?" checked":""}><label for="deGm">Male</label><input type="radio" name="deGender" id="deGf" value="female"${p.gender==="female"?" checked":""}><label for="deGf">Female</label></div></div>
      <div class="row g-3">
        <div class="col-sm-6"><label class="form-label" for="deFather">Father</label>${parentSelect(p,"deFather","male",p.fid,p.mid,excl)}</div>
        <div class="col-sm-6"><label class="form-label" for="deMother">Mother</label>${parentSelect(p,"deMother","female",p.mid,p.fid,excl)}</div>
      </div>
      <div class="row g-3">
        <div class="col-sm-6"><label class="form-label" for="deBirth">Birth date</label><input class="form-control" type="date" id="deBirth" value="${p.birthDate||""}"></div>
        <div class="col-sm-6"><label class="form-label" for="dePlace">Birthplace</label><input class="form-control" id="dePlace" maxlength="80" value="${esc(p.birthplace||"")}"></div>
      </div>
      <div><span class="form-label d-block">Status</span><div class="seg" role="radiogroup" aria-label="Status"><input type="radio" name="deStatus" id="deLive" value="living"${p.status!=="deceased"?" checked":""}><label for="deLive">Living</label><input type="radio" name="deStatus" id="deDead" value="deceased"${p.status==="deceased"?" checked":""}><label for="deDead">Deceased</label></div></div>
      <div id="deDeathWrap"${p.status==="deceased"?"":" hidden"}><label class="form-label" for="deDeath">Date of passing</label><input class="form-control" type="date" id="deDeath" value="${p.deathDate||""}"></div>
      <div class="row g-3">
        <div class="col-sm-6"><label class="form-label" for="dePhone">Phone</label><input class="form-control" id="dePhone" maxlength="40" value="${esc(p.phone||"")}"></div>
        <div class="col-sm-6"><label class="form-label" for="deLocation">Current location</label><input class="form-control" id="deLocation" maxlength="80" value="${esc(p.location||"")}" placeholder="Town, country"></div>
      </div>
      <div><span class="form-label d-block">Residency</span><div class="seg" role="radiogroup" aria-label="Residency"><input type="radio" name="deResidency" id="deLocal" value="local"${isAbroad(p)?"":" checked"}><label for="deLocal">In country</label><input type="radio" name="deResidency" id="deAbroad" value="abroad"${isAbroad(p)?" checked":""}><label for="deAbroad">Abroad</label></div></div>
      <div><label class="form-label" for="deBio">Biography</label><textarea class="form-control" id="deBio" rows="3" maxlength="600">${esc(p.bio||"")}</textarea></div>
      <div class="d-flex gap-2 justify-content-end"><button type="button" class="btn btn-quiet" id="deCancel">Cancel</button><button type="submit" class="btn btn-go">Save</button></div>
    </form>`;
  }
  function paintDetail(){ $("#detBody").html(detReadHtml(byId[detId])); }
  function paintDetailEdit(){ $("#detBody").html(detEditHtml(byId[detId])); $("#deName").trigger("focus"); }
  function openDetails(id){
    detId=id; $("#detGen").text(`Generation ${byId[id]._gen}`);
    paintDetail(); detModal.show();
  }
  $("#detBody").on("click","[data-goto]",function(){ const id=$(this).data("goto"); openDetails(id); select(id,true); });
  $("#detBody").on("click","[data-showmore]",function(){ $(this).prev(".more-kids").css("display","contents"); $(this).remove(); });
  $("#detBody").on("click","[data-showmoregens]",function(){ $(this).prev(".more-ancestors").css("display","block"); $(this).remove(); });
  $("#detLocate").on("click",()=>{ detModal.hide(); select(detId,true); });
  $("#detBody").on("click","[data-reorder]",async function(){
    const $btn=$(this); if($btn.prop("disabled")) return;
    const uKey=$btn.data("u"), id=$btn.data("id"), dir=$btn.data("reorder");
    const u=unions.find(x=>x.key===String(uKey)); if(!u) return;
    const kids=u.children.slice(), idx=kids.indexOf(id); if(idx<0) return;
    const swapIdx=dir==="up"?idx-1:idx+1; if(swapIdx<0||swapIdx>=kids.length) return;
    [kids[idx],kids[swapIdx]]=[kids[swapIdx],kids[idx]];
    $btn.closest(".kids-list").find("[data-reorder]").prop("disabled",true);
    try{
      await Promise.all(kids.map((cid,i)=>Api.people.update(cid,{sort_order:i})));
      kids.forEach((cid,i)=>{ byId[cid].sortOrder=i; });
      render(); paintDetail();
    }catch(e){ toast("Couldn't save that order.","danger"); paintDetail(); }
  });
  $("#dPhoto").on("change",async function(){ const f=this.files[0]; this.value=""; if(!f||!detId||!tree) return; const p=byId[detId];
    try{ const r=await cropPhoto(f); const res=await Api.people.uploadPhoto(p.id,r.blob); p.img=res.img; p.updatedAt=Date.now();
      render(); paintDetail();
      toast(`Saved ${p.name}'s photo.`,"ok"); }
    catch(e){ toast("Couldn't save that photo: "+(e.message||apiErr(e)||e),"danger"); } });
  $("#detBody").on("click","#dPhotoDel",async function(){ const p=byId[detId];
    try{ await Api.people.removePhoto(p.id); p.img=""; p.updatedAt=Date.now(); render(); paintDetail(); toast(`Removed ${p.name}'s photo.`); }
    catch(e){ toast("Couldn't remove that photo.","danger"); } });
  $("#detBody").on("click","#detEditBtn",()=>paintDetailEdit());
  $("#detBody").on("click","#detBranchBtn",function(){
    const p=byId[detId];
    branchCtx=p.id;
    $("#brDesc").text(`Creates a new, separate tree with ${dn(p)}'s full line - every ancestor and their own descendants. The two trees won't stay linked.`);
    $("#brName").val(`${dn(p)}'s branch`).removeClass("is-invalid");
    detModal.hide(); branchModal.show();
  });
  $("#detBody").on("click","#detRemoveBtn",function(){
    const p=byId[detId]; ctxId=p.id; ctxKind="person";
    $("#cfTitle").text("Remove this person?"); $("#cfGo").text("Remove");
    $("#cfBody").html(`<p class="mb-0"><b>${esc(dn(p))}</b> will be permanently removed. Any children keep their place in the tree but lose this recorded parent.</p>`);
    detModal.hide(); cfModal.show();
  });
  $("#detBody").on("click","#deCancel",()=>paintDetail());
  $("#detBody").on("change","input[name=deStatus]",function(){ $("#deDeathWrap").prop("hidden",this.value!=="deceased"); });
  $("#detBody").on("submit","#detEditForm",async function(e){
    e.preventDefault(); if(!this.checkValidity()){ $(this).addClass("was-validated"); return; }
    const p=byId[detId];
    const st=$("input[name=deStatus]:checked").val();
    const fatherId=$("#deFather").val()||null, motherId=$("#deMother").val()||null;
    const payload={
      name:$("#deName").val().trim(), gender:$("input[name=deGender]:checked").val(),
      birth_date:$("#deBirth").val()||null, birthplace:$("#dePlace").val().trim()||null,
      status:st, death_date:st==="deceased"?($("#deDeath").val()||null):null,
      phone:$("#dePhone").val().trim()||null, location:$("#deLocation").val().trim()||null,
      residency:$("input[name=deResidency]:checked").val(), bio:$("#deBio").val().trim()||null,
      father_id:fatherId, mother_id:motherId,
    };
    if(neOn()) payload.name_ne=$("#deNameNe").val().trim()||null;
    const $btn=$(this).find('button[type="submit"]'); $btn.prop("disabled",true);
    try{
      await Api.people.update(p.id,payload);
      Object.assign(p,{name:payload.name,nameNe:payload.name_ne,gender:payload.gender,birthDate:payload.birth_date||"",
        birthplace:payload.birthplace||"",status:payload.status,deathDate:payload.death_date||"",
        phone:payload.phone||"",location:payload.location||"",residency:payload.residency,bio:payload.bio||"",
        fid:fatherId?+fatherId:null,mid:motherId?+motherId:null});
      /* Mirror the backend's auto-marry: if both parents are now set, they should show as each
         other's spouse locally too, same fix as the add-relative flow already needed for this. */
      if(p.fid&&p.mid){
        const f=byId[p.fid], m=byId[p.mid];
        if(f&&m){ if(!f.pids.includes(m.id)) f.pids.push(m.id); if(!m.pids.includes(f.id)) m.pids.push(f.id); }
      }
      render(); header(); paintDetail(); toast(`Saved ${p.name}'s details.`,"ok");
    }catch(xhr){ toast(apiErr(xhr),"danger"); }
    finally{ $btn.prop("disabled",false); }
  });

  /* search */
  let rl=[],ri=0;
  function search(){ const q=$("#search").val().trim().toLowerCase(); $("#nodes .node").removeClass("match"); if(!q){ $("#results").prop("hidden",true); return; }
    rl=people.filter(p=>(!visibleIds||visibleIds.has(p.id))&&(p.name.toLowerCase().includes(q)||(p.nameNe||"").includes(q))); ri=0; rl.forEach(p=>$(`#nodes .node[data-id="${p.id}"]`).addClass("match")); drawResults(); if(rl.length) centerOn(rl[0].id,Math.max(view.k,.6)); }
  function drawResults(){ $("#results").prop("hidden",false).html(rl.length? rl.map((p,i)=>`<button type="button" class="${i===ri?"active":""}" data-id="${p.id}"><span class="sw" style="background:var(--${p.gender})"></span>${esc(dn(p))}${altName(p)?` <small class="muted">${esc(altName(p))}</small>`:""}<span class="meta">Gen ${p._gen}${p.birthDate?` · ${yr(p.birthDate)}`:""}</span></button>`).join("") : '<div class="empty-r">No match. Try part of a first or last name.</div>'); }
  function pick(id){ $("#results").prop("hidden",true); $("#nodes .node").removeClass("match"); $("#search").val("").blur(); select(id,true); }
  $("#search").on("input",search).on("keydown",e=>{ if(!rl.length) return;
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); ri=(ri+(e.key==="ArrowDown"?1:-1)+rl.length)%rl.length; drawResults(); centerOn(rl[ri].id); }
    else if(e.key==="Enter"){ e.preventDefault(); pick(rl[ri].id); } });
  $("#results").on("pointerdown",e=>e.preventDefault()).on("click","button",function(){ pick($(this).data("id")); });
  $(document).on("pointerdown",e=>{ if(!$(e.target).closest(".search-wrap").length){ $("#results").prop("hidden",true); $("#nodes .node").removeClass("match"); } });

  let rt; $(window).on("resize",()=>{ clearTimeout(rt); rt=setTimeout(()=>{ if(tree&&autoFit) fit(false); },150); });

  const ICON_PLUS='<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const ICON_INFO='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  function render(){
    index(); buildUnions(); computeGens();
    /* "Blood members" filter: computeBloodMemberIds() needs the full-tree parentUnion/_u state
       just built above, so it runs before we swap `people` down to the visible subset. Gens are
       NOT recomputed on the subset - a person keeps the row their full-tree depth puts them in,
       rather than rows shifting around just because some ancestors above them got hidden. Once the
       filtered pass is rendered, people/byId/unions are rebuilt back to the full set so everything
       else (search, details modal, ghosts for the selected node) keeps working off complete data -
       only the drawn canvas is restricted. */
    const allPeople=people;
    if(filterMode==="blood"){
      visibleIds=computeBloodMemberIds();
      people=allPeople.filter(p=>visibleIds.has(p.id));
      index(); buildUnions();
    } else visibleIds=null;
    layout();
    $world.css({width:BOUNDS.w,height:BOUNDS.h}).toggleClass("readonly",ro());
    $("#links,#glinks").attr({width:BOUNDS.w,height:BOUNDS.h,viewBox:`0 0 ${BOUNDS.w} ${BOUNDS.h}`});
    let s="";
    unions.forEach(u=>{
      u.partners.forEach(pid=>{ const p=pos[pid], b=p.y+CH;
        if(u.partners.length===1){ s+=`<path class="edge" data-k="pu:${pid}:${u.key}" d="M${cx(pid)},${b} V${u.y}"/>`; return; }
        const px=Math.min(Math.max(u.x,p.x+30),p.x+CW-30); s+=`<path class="edge" data-k="pu:${pid}:${u.key}" d="${ortho([[px,b],[px,u.y],[u.x,u.y]],12)}"/>`; });
      u.children.forEach(c=>{ const t=pos[c].y-22, bus=t-36-u.bus*BUS_STEP; s+=`<path class="edge" data-k="uc:${u.key}:${c}" d="${ortho([[u.x,u.y],[u.x,bus],[cx(c),bus],[cx(c),t]],12)}"/>`; });
    });
    unions.forEach(u=>{ s+=`<circle class="hub" data-u="${u.key}" cx="${u.x}" cy="${u.y}" r="${u.partners.length===2?5:3.5}"/>`; });
    $("#links").html(s);
    let h="";
    for(let g=1;g<=BOUNDS.G;g++){ const cnt=people.filter(p=>p._gen===g).length;
      h+=`<button type="button" class="gen-tag" data-gen="${g}" style="left:${PAD-150}px;top:${PAD+(g-1)*ROWH+CH/2-8}px">Gen ${g} · ${cnt}</button>`; }
    people.forEach(p=>{ const q=pos[p.id];
      const tags=(p.status==="deceased"?'<span>Deceased</span>':"")+(isAbroad(p)?'<span>Abroad</span>':"");
      h+=`<div class="node ${p.gender}${p.status==="deceased"?" deceased":""}" data-id="${p.id}" style="left:${q.x}px;top:${q.y}px" tabindex="0" role="button" aria-label="${esc(dn(p))}">
        <div class="av">${avatar(p,66)}</div><div class="txt"><div class="nm"${lang==="ne"&&p.nameNe?' lang="ne"':""}>${esc(dn(p))}</div><div class="dt">${dateLine(p)}</div></div>
        ${tags?`<div class="tags">${tags}</div>`:""}
        <div class="acts"><button class="act" data-act="add" title="Add a relative" aria-label="Add a relative to ${esc(p.name)}">${ICON_PLUS}</button><button class="act" data-act="info" title="Details" aria-label="Details for ${esc(p.name)}">${ICON_INFO}</button></div>
        <button class="close-x" data-act="close" aria-label="Close">×</button></div>`; });
    $("#nodes").html(h);
    if(filterMode==="blood"){ people=allPeople; index(); buildUnions(); }
    applySelection();
  }
  const LANGS={en:{code:"EN",label:"English"},ne:{code:"ने",label:"नेपाली"}};
  function langMenu(){
    const on=neOn(); $("#eLangWrap").prop("hidden",!on); if(!on) return;
    const def=tree.defaultLang==="ne"?"ne":"en", miss=people.filter(p=>!p.nameNe).length;
    $("#eLangBtn").html(`${I.globe.replace(/width="18" height="18"/,'width="15" height="15"')}<span lang="${lang}">${LANGS[lang].code}</span><span class="lbl-txt">${lang==="ne"?"नेपाली":"English"}</span>`).attr("title","Show names in…");
    const opt=k=>`<li><button class="dropdown-item${lang===k?" on":""}" data-elang="${k}"><span lang="${k}">${LANGS[k].label}</span>${k==="ne"?'<span class="muted small">Nepali</span>':""}${def===k?'<span class="pill" style="font-size:9px">Default</span>':""}${lang===k?'<span class="chk">✓</span>':""}</button></li>`;
    $("#eLangMenu").html(`<li class="note">Show names in</li>${opt("en")}${opt("ne")}`+
      (lang==="ne"&&miss?`<li class="note">${miss} ${miss===1?"person has":"people have"} no Nepali name, so their English name is shown.</li>`:"")+
      (lang!==def?`<li><hr class="dropdown-divider"></li><li><button class="dropdown-item" data-edef="${lang}">Open this tree in ${LANGS[lang].label} by default</button></li>`:
       `<li><hr class="dropdown-divider"></li><li class="note">This tree opens in ${LANGS[def].label}.</li>`));
  }
  const LANG_KEY=id=>"ftLang:"+id;
  $("#eLangMenu").on("click","[data-elang]",function(){ lang=$(this).data("elang"); try{ localStorage.setItem(LANG_KEY(tree.id),lang); }catch(_){} render(); header(); })
    .on("click","[data-edef]",function(){ const newDef=$(this).data("edef");
      Api.trees.update(tree.id,{default_lang:newDef}).done(()=>{ tree.defaultLang=newDef; header(); toast(`${tree.name} now opens in ${newDef==="ne"?"Nepali":"English"}.`,"ok"); })
        .fail(xhr=>toast(apiErr(xhr),"danger")); });
  function layoutMenuHtml(){
    const opt=(k,label,sub)=>`<li><button class="dropdown-item${layoutMode===k?" on":""}" data-elayout="${k}"><span>${label}<br><small class="muted">${sub}</small></span>${layoutMode===k?'<span class="chk" style="margin-left:auto;color:var(--male)">✓</span>':""}</button></li>`;
    return `<li class="note">Layout</li>${opt("tree","Tree","Branches out like a real tree - lines never overlap")}${opt("default","Compact","Optimised for size")}`;
  }
  $("#eMenu").on("click","[data-elayout]",function(){
    layoutMode=$(this).data("elayout");
    if(!ro()) Api.trees.update(tree.id,{layout:layoutMode}).catch(()=>{});
    render(); header(); fit(false);
    toast(layoutMode==="tree"?"Tree mode: each branch gets its own space, so lines don't cross.":"Default layout.");
  });
  function header(){
    if(!tree) return;
    langMenu();
    const G=Math.max(...people.map(p=>p._gen||1));
    $("#eName").text(tree.name);
    $("#eMeta").html(`${people.length} ${people.length===1?"person":"people"} · ${G} gen`);
    const it=(a,ico,l,cls="")=>`<li><button class="dropdown-item ${cls}" data-action="${a}" data-id="${tree.id}">${ico}${l}</button></li>`;
    $("#eMenu").html(`<li><button class="dropdown-item" id="eSummaryBtn">${I.act}Summary</button></li>`+
      `<li><button class="dropdown-item" id="eFilterBtn">${I.filter}Filter${filterMode==="blood"?'<span class="pill" style="font-size:9px">Blood members</span>':""}</button></li>`+
      '<li><hr class="dropdown-divider"></li>'+layoutMenuHtml()+
      (ro()?"":'<li><hr class="dropdown-divider"></li>'+
        it("rename",I.edit,"Rename tree")+
        `<li><button class="dropdown-item" id="eShareBtn">${I.share}Share</button></li>`+
        '<li><hr class="dropdown-divider"></li>'+it("delete",I.trash,"Delete tree","danger")));
  }
  const filterModal=$("#filterModal").length?new bootstrap.Modal("#filterModal"):null;
  $("#eMenu").on("click","#eFilterBtn",()=>{
    $(`input[name="flMode"][value="${filterMode}"]`).prop("checked",true);
    filterModal.show();
  });
  $("#filterForm").on("submit",function(e){
    e.preventDefault();
    filterMode=$("input[name=flMode]:checked").val();
    try{ localStorage.setItem(FILTER_KEY(tree.id),filterMode); }catch(_){}
    filterModal.hide();
    render(); header();
    toast(filterMode==="blood"?"Showing blood members only - spouses are hidden.":"Showing everyone.");
  });
  const shareModal=$("#shareModal").length?new bootstrap.Modal("#shareModal"):null;
  $("#eMenu").on("click","#eShareBtn",async()=>{
    shareModal.show();
    $("#shLink").val("Generating link…");
    try{ const res=await Api.trees.share(tree.id); $("#shLink").val(res.share_url); }
    catch(e){ toast("Couldn't create a share link.","danger"); shareModal.hide(); }
  });
  $("#shCopy").on("click",()=>{
    const val=$("#shLink").val();
    try{ navigator.clipboard.writeText(val).then(()=>toast("Link copied.","ok"),()=>$("#shLink").trigger("select")); }
    catch(_){ $("#shLink").trigger("select"); }
  });
  $("#shStop").on("click",async()=>{
    try{ await Api.trees.unshare(tree.id); toast("Sharing turned off.","danger"); shareModal.hide(); }
    catch(e){ toast("Couldn't turn off sharing.","danger"); }
  });
  const branchModal=$("#branchModal").length?new bootstrap.Modal("#branchModal"):null;
  let branchCtx=null;
  $("#branchForm").on("submit",async function(e){
    e.preventDefault();
    const name=$("#brName").val().trim();
    $("#brName").toggleClass("is-invalid",!name); if(!name) return;
    const $btn=$(this).find('button[type="submit"]'); $btn.prop("disabled",true);
    try{
      const newTree=await Api.people.branch(branchCtx,name);
      branchModal.hide();
      toast(`Created ${name}.`,"ok");
      openTree(newTree.slug,true);
    }catch(xhr){ toast(apiErr(xhr),"danger"); }
    finally{ $btn.prop("disabled",false); }
  });

  return {
    open(t,r,fresh){ tree=t; role=r; people=t.people; selected=null;
      let saved=null; try{ saved=localStorage.getItem(LANG_KEY(t.id)); }catch(_){}
      lang = neOn() ? ((saved==="en"||saved==="ne")?saved:(t.defaultLang==="ne"?"ne":"en")) : "en";
      layoutMode = t.layout==="default" ? "default" : "tree";
      let savedFilter=null; try{ savedFilter=localStorage.getItem(FILTER_KEY(t.id)); }catch(_){}
      filterMode = savedFilter==="blood" ? "blood" : "all";
      $("#search").val(""); $("#results").prop("hidden",true);
      render(); header(); fit(false);
      if(fresh&&people.length===1){ select(people[0].id,true); toast("Your tree is ready. Tap a dashed card to add the first relative.","ok"); } },
    close(){ tree=null; selected=null; $("#ghosts,#glinks,#nodes,#links").empty(); },
    treeId:()=>tree&&tree.id,
    treeName:()=>tree?tree.name:"",
    peopleCount:()=>people.length,
    header(){ if(tree){ header(); } },
    renamed(name){ if(tree){ tree.name=name; header(); document.title=`${name} · Family Tree`; } },
    personRemoved(id){
      if(!tree) return;
      people.forEach(q=>{ if(q.fid===id) q.fid=null; if(q.mid===id) q.mid=null; if(q.pids&&q.pids.includes(id)) q.pids=q.pids.filter(x=>x!==id); });
      people=people.filter(q=>q.id!==id);
      render(); header();
    },
  };
})();
$("#eBack").on("click",()=>{ if(window.SHARED_TOKEN){ location.href="/"; return; } closeEditor(); });

/* ======================= BOOT ======================= */
/* Called on first load when the editor is the initial screen, and again every time the user opens
   a tree from the dashboard (see openTree() in actions.js) or uses browser back/forward - always a
   fresh fetch by slug, shown behind a loader, never trusting leftover state from a previous tree. */
async function bootEditor(slug,fresh){
  showScreen("editor");
  $("#editorLoader").prop("hidden",false);
  try{
    const [settings,tree]=await Promise.all([Api.settings.get(),Api.trees.show(slug)]);
    AppSettings=settings;
    const people=await Api.people.list(tree.id);
    document.title=`${tree.name} · Family Tree`;
    Editor.open({id:tree.id,name:tree.name,defaultLang:tree.default_lang,layout:tree.layout,people},"owner",fresh);
  } finally {
    $("#editorLoader").prop("hidden",true);
  }
}

/* Public, read-only entry point (shared.blade.php) - fetches by share token instead of an
   authenticated slug lookup, and opens the tree with role "viewer" so ro() hides every editing
   control. AppSettings.ne is derived from the tree's own default_lang so the language switcher
   shows up for a Nepali-language tree even though there's no signed-in account behind it. */
async function bootShared(token){
  showScreen("editor");
  $("#editorLoader").prop("hidden",false);
  try{
    const data=await Api.shared.data(token);
    AppSettings={name:"",email:"",color:"",name_ne:"",ne:data.tree.default_lang==="ne"};
    const people=data.people.map(normalizePerson);
    document.title=`${data.tree.name} · Family Tree`;
    Editor.open({id:data.tree.id,name:data.tree.name,defaultLang:data.tree.default_lang,layout:data.tree.layout,people},"viewer",false);
  } finally {
    $("#editorLoader").prop("hidden",true);
  }
}

/* ======================= INITIAL BOOT (both screens live in this page; decide which starts active) ======================= */
if(window.SHARED_TOKEN) bootShared(window.SHARED_TOKEN);
else if(window.INITIAL_VIEW==="editor") bootEditor(window.INITIAL_TREE_SLUG,!!window.INITIAL_FRESH);
else bootApp();
