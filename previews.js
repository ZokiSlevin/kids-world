'use strict';
(()=>{
 const cache=new Map();
 const enc=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 const keys={balloons:['scene'],aquarium:['theme'],rocket:['skin','sector'],racing:['skin','track'],dino:['species','habitat'],memory:['theme'],maze:['world'],fruit:['world'],puzzle:['picture'],math:['route'],music:['stage'],paint:['paper']};
 const fieldLabel=(g,k,v)=>g.fields.find(f=>f[0]===k)?.[2].find(x=>x[0]===String(v))?.[1]||'';
 const choices=(g,p)=>{const o={...g.defaults,...(p.options?.[g.id]||{})};if(g.id==='aquarium')o.theme=p.options?.aquarium?.theme||p.aquarium?.theme||o.theme;if(g.id==='paint')o.paper=p.options?.paint?.paper||p.paintTheme||o.paper||'night';return o};
 function title(g,o){return (keys[g.id]||[]).map(k=>k==='paper'?(KW.coverRenderers.paintThemes[o.paper]?.name||''):fieldLabel(g,k,o[k])).filter(Boolean).join(' \u00b7 ')}
 function hasChoice(g,p){return (keys[g.id]||[]).some(k=>Object.hasOwn(p.options?.[g.id]||{},k))||g.id==='paint'&&!!p.paintTheme||g.id==='aquarium'&&p.aquarium?.theme!=='Dan';}
 // The promo artwork is separate from the gameplay renderers. Original covers are
 // retained for their original themes; alternate colorways use that same artwork.
 const one={balloons:['scene','sky'],aquarium:['theme','Dan'],paint:['paper','night'],memory:['theme','animals'],maze:['world','forest'],fruit:['world','orchard'],puzzle:['picture','forest'],math:['route','classic']};
 const assets=new Set(["aquarium-Dubina", "aquarium-Greben", "aquarium-Laguna", "aquarium-Noć", "balloons-aurora", "balloons-candy", "balloons-golden", "balloons-space", "balloons-sunset", "fruit-autumn", "fruit-spring", "fruit-sunset", "fruit-tropical", "math-island", "math-space", "maze-candy", "maze-ice", "maze-lava", "maze-temple", "memory-fruit", "memory-mixed", "memory-sea", "memory-shapes", "memory-space", "memory-vehicles", "paint-candy", "paint-desert", "paint-forest", "paint-ice", "paint-magic", "paint-ocean", "paint-paper", "paint-sunrise", "puzzle-castle", "puzzle-dino", "puzzle-forest", "puzzle-fruit", "puzzle-island", "puzzle-maze", "puzzle-ocean", "puzzle-space", "puzzle-winter", "racing-blue-coast", "racing-blue-meadow", "racing-blue-night", "racing-blue-sunset", "racing-blue-winter", "racing-gold-coast", "racing-gold-meadow", "racing-gold-night", "racing-gold-sunset", "racing-gold-winter", "racing-green-coast", "racing-green-meadow", "racing-green-night", "racing-green-sunset", "racing-green-winter", "racing-ice-coast", "racing-ice-meadow", "racing-ice-night", "racing-ice-sunset", "racing-ice-winter", "racing-orange-coast", "racing-orange-meadow", "racing-orange-night", "racing-orange-sunset", "racing-orange-winter", "racing-pink-coast", "racing-pink-meadow", "racing-pink-night", "racing-pink-sunset", "racing-pink-winter", "racing-red-coast", "racing-red-night", "racing-red-sunset", "racing-red-winter", "racing-violet-coast", "racing-violet-meadow", "racing-violet-night", "racing-violet-sunset", "racing-violet-winter", "rocket-classic-ember", "rocket-classic-emerald", "rocket-classic-ice", "rocket-coral-ember", "rocket-coral-emerald", "rocket-coral-ice", "rocket-coral-nebula", "rocket-emerald-ember", "rocket-emerald-emerald", "rocket-emerald-ice", "rocket-emerald-nebula", "rocket-gold-ember", "rocket-gold-emerald", "rocket-gold-ice", "rocket-gold-nebula", "rocket-ice-ember", "rocket-ice-emerald", "rocket-ice-ice", "rocket-ice-nebula", "rocket-mint-ember", "rocket-mint-emerald", "rocket-mint-ice", "rocket-mint-nebula", "rocket-sunset-ember", "rocket-sunset-emerald", "rocket-sunset-ice", "rocket-sunset-nebula", "rocket-violet-ember", "rocket-violet-emerald", "rocket-violet-ice", "rocket-violet-nebula"]);
 const original=id=>`art/${id}.webp`;
 const variant=(id,name)=>{const f=`${id}-${name}`;return assets.has(f)?`art/banners/${f}.webp`:original(id)};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 function chosen(g,o,k){const val=String(o[k]??g.defaults[k]??'');if(k==='paper')return Object.hasOwn(KW.coverRenderers.paintThemes,val)?val:'night';return g.fields.find(f=>f[0]===k)?.[2].some(x=>x[0]===val)?val:g.defaults[k];}
 // Dino's species and equipped accessory are true illustrated shapes, not a canvas
 // capture. Recompose the existing character into a panoramic, illustrated landscape.
 function dinoPoster(species,habitat,accessory){
   const pg=KW.playground,h=pg.habitats[habitat]||pg.habitats.forest,d=pg.dinos[species]||pg.dinos.mint;
   const raw=pg.dinoScene(species,habitat,3,accessory);const doc=new DOMParser().parseFromString(raw,'image/svg+xml');
   const ser=new XMLSerializer(),defs=ser.serializeToString(doc.querySelector('defs')),actor=ser.serializeToString(doc.querySelector('.dino-actor'));
   const night=habitat==='night',volcano=habitat==='volcano',ice=habitat==='ice',jungle=habitat==='jungle';
   const sparkle=(x,y,z)=>`<path d="M${x} ${y-z}Q${x+2} ${y-2} ${x+z} ${y}Q${x+2} ${y+2} ${x} ${y+z}Q${x-2} ${y+2} ${x-z} ${y}Q${x-2} ${y-2} ${x} ${y-z}Z" fill="${h.light}" opacity=".85"/>`;
   const tree=(x,y,k,flip=1)=>`<g transform="translate(${x} ${y}) scale(${flip*k} ${k})"><path d="M0 0Q-4 -31 1 -61M0 -15L-18 -39M0 -29L19 -49" stroke="${h.grass}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M0 -31Q-30 -61 -42 -40Q-27 -22 0 -31M1 -43Q26 -77 42 -55Q29 -36 1 -43M0 -17Q26 -41 41 -22Q25 -7 0 -17" fill="${h.hill}" stroke="${h.grass}" stroke-width="1.5"/><path d="M-2 -32L-30 -41M3 -44L31 -54M3 -18L28 -23" stroke="#f4ffda" opacity=".35" stroke-width="2" fill="none"/></g>`;
   const skyDecor=night?[[43,35,4],[115,17,5],[252,34,4],[645,19,5],[724,47,4],[858,26,5]].map(q=>sparkle(...q)).join(''):`<g fill="#fff8e8" opacity=".7"><ellipse cx="126" cy="33" rx="64" ry="13"/><ellipse cx="106" cy="22" rx="29" ry="18"/><ellipse cx="151" cy="25" rx="31" ry="15"/><ellipse cx="763" cy="33" rx="51" ry="12"/><ellipse cx="751" cy="24" rx="24" ry="14"/></g>`;
   const mountain=volcano?`<path d="M48 154L167 19 214 19 340 154Z" fill="#81506e"/><path d="M167 19L180 39 195 29 214 19" fill="#ff9d64"/><g fill="#ffe6c1" opacity=".5"><ellipse cx="196" cy="11" rx="28" ry="9"/><ellipse cx="222" cy="1" rx="26" ry="12"/></g>`:ice?`<path d="M34 140L168 19 294 139M650 140L754 17 888 140" fill="${h.hill}"/><path d="M168 19L131 57 160 50 177 65 201 50ZM754 17L720 54 749 46 772 62 792 50Z" fill="#f9ffff"/>`:'';
   return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" role="img" aria-label="${esc(d.name+' · '+h.name)}">${defs}<defs><linearGradient id="posterSky" x2="0" y2="1"><stop stop-color="${h.sky}"/><stop offset="1" stop-color="${h.sky2}"/></linearGradient><linearGradient id="posterGround" x2="0" y2="1"><stop stop-color="${h.ground}"/><stop offset="1" stop-color="${h.grass}"/></linearGradient><radialGradient id="posterGlow"><stop stop-color="${h.light}" stop-opacity=".7"/><stop offset="1" stop-color="${h.light}" stop-opacity="0"/></radialGradient></defs><rect width="900" height="240" fill="url(#posterSky)"/><circle cx="702" cy="49" r="82" fill="url(#posterGlow)"/><circle cx="702" cy="49" r="29" fill="${h.light}"/>${skyDecor}<path d="M0 142L90 62 164 119 252 51 353 131 448 69 536 123 658 58 768 120 842 71 900 125V192H0Z" fill="${h.far}"/>${mountain}<path d="M0 161Q117 93 238 143T462 137T686 133T900 143V207H0Z" fill="${h.hill}"/><path d="M0 175Q145 153 269 178T520 170T751 163T900 163V240H0Z" fill="url(#posterGround)"/><path d="M0 232Q225 182 429 217T900 210V240H0Z" fill="#e8c493" opacity=".25"/><ellipse cx="449" cy="211" rx="161" ry="24" fill="#ffe6ad" opacity=".3"/>${tree(98,214,jungle?1.7:1.14)}${tree(197,214,.83,-1)}${tree(757,221,jungle?1.65:1.14,-1)}${tree(832,233,.95)}<g transform="translate(210 -52) scale(.75)">${actor}</g>${tree(21,249,1.4)}${tree(887,251,1.28,-1)}${sparkle(310,64,7)}${sparkle(601,57,6)}${sparkle(596,182,5)}<g fill="#f4ffd0" opacity=".57"><ellipse cx="236" cy="225" rx="11" ry="3"/><ellipse cx="692" cy="228" rx="14" ry="3"/></g></svg>`);
 }
 function musicPoster(stage){const raw=KW.playground.musicArt(stage,0);return enc(raw.replace('viewBox="0 0 640 320"','viewBox="0 25 640 270"'));}
 function art(g,o,p){
   const id=g.id;
   if(one[id]){const [k,def]=one[id],val=chosen(g,o,k);if(id==='puzzle')return variant(id,val);return val===def?original(id):variant(id,val);}
   if(id==='rocket'||id==='racing'){
     const a=chosen(g,o,'skin'),b=chosen(g,o,id==='rocket'?'sector':'track');
     return variant(id,`${a}-${b}`);
   }
   if(id==='dino'){
     const sp=chosen(g,o,'species'),hab=chosen(g,o,'habitat'),acc=KW.playground.petState(p.dino?.[sp]).accessory;
     if(sp==='mint'&&hab==='forest'&&acc==='none')return original(id);
     const key=`dino|${sp}|${hab}|${acc}`;
     if(!cache.has(key)){try{if(cache.size>=80)cache.delete(cache.keys().next().value);cache.set(key,dinoPoster(sp,hab,acc));}catch(err){console.warn('Banner illustration',id,err);return original(id)}}return cache.get(key);
   }
   if(id==='music'){
     const stage=chosen(g,o,'stage');if(stage==='disco')return original(id);
     try{const key=`music|${stage}`;if(!cache.has(key)){if(cache.size>=80)cache.delete(cache.keys().next().value);cache.set(key,musicPoster(stage));}return cache.get(key)}catch(err){return original(id)}
   }
   return original(id);
 }
 window.KWPreviews={choices,title,hasChoice,art,keys};
})();
