'use strict';
(()=>{
 const ids=['balloons','memory','maze','puzzle','math','music','aquarium','rocket','paint','racing','fruit','dino'];
 const number=n=>Number.isFinite(n)&&n>0?Math.floor(n):0;
 const wins=(p,id)=>number(p.stats?.[id]?.wins),best=(p,id)=>Math.max(0,...Object.values(p.stats?.[id]?.best||{}).map(number));
 const levels=(p,id)=>Math.max(0,(window.KWJourney?.level(p,id)||1)-1);
 const pets=p=>Object.values(p.dino||{}).filter(x=>number(x?.care)>=3).length;
 const care=p=>Object.values(p.dino||{}).reduce((s,x)=>s+number(x?.care),0);
 const raceBest=p=>Math.max(0,...Object.entries(p.stats?.racing?.best||{}).filter(([k])=>k.startsWith('circuit|')||k==='avantura-circuit').map(([,v])=>number(v)));
 const tracks=[
 ['balloons','🎈','Matematički baloni','točnih odgovora',[10,50,200],p=>number(p.stats?.balloons?.correct)],
 ['memory','🧠','Čarobno pamćenje','dovršenih partija',[1,5,20],p=>wins(p,'memory')],
 ['maze','🗝️','Lov na ključeve','riješenih labirinata',[1,5,20],p=>wins(p,'maze')],
 ['puzzle','🧩','Umjetnik slagalica','složenih slika',[1,5,20],p=>wins(p,'puzzle')],
 ['math','🏰','Matematički pustolov','točnih odgovora',[9,45,180],p=>number(p.stats?.math?.correct)],
 ['music','🎵','Glazbena turneja','završenih glazbenih avantura',[1,5,15],p=>wins(p,'music')],
 ['aquarium','🐠','Riznica oceana','bisera',[25,100,500],p=>number(p.aquarium?.pearls)],
 ['rocket','🚀','Zvjezdani pilot','bodova u jednom letu',[30,100,250],p=>best(p,'rocket')],
 ['paint','🎨','Čarobna mašta','dovršenih kreativnih razina',[1,5,20],p=>levels(p,'paint')],
 ['racing','🏁','Trkaća legenda','bodova u novoj utrci / avanturi',[30,100,250],raceBest],
 ['fruit','🍓','Vesela berba','završenih voćnih misija',[1,5,20],p=>wins(p,'fruit')],
 ['dino','🦕','Dino obitelj','izlegnutih prijatelja',[2,6,11],pets]
 ];
 const missions=tracks.flatMap(([game,icon,title,unit,targets,value])=>targets.map((target,i)=>({id:`${game}-${i+1}`,game,icon,title:`${title} · ${['Bronca','Srebro','Zlato'][i]}`,desc:`${target} ${unit}`,target,value,xp:[25,50,100][i],stars:[5,10,20][i],tier:i+1})));
 const special=[
 ['explorer','🌍','Obiđi sve svjetove','Odigrano 12 različitih igara',12,p=>ids.filter(id=>number(p.stats?.[id]?.plays)>0).length,100,20],
 ['adventurer','🧭','Prva velika ekspedicija','Završena barem jedna avantura u svakoj igri',12,p=>ids.filter(id=>levels(p,id)>0).length,150,30],
 ['mountain','⛰️','Planina izazova','Ukupno 50 dovršenih razina avantura',50,p=>ids.reduce((s,id)=>s+levels(p,id),0),150,30],
 ['grand','👑','Majstor dvanaest svjetova','U svih 12 igara dosegnuta razina 5',12,p=>ids.filter(id=>levels(p,id)>=4).length,200,40],
 ['dino-care','💚','Najbolji dino prijatelj','100 ukupnih aktivnosti brige',100,care,75,15],
 ['math-team','✨','Brojevi su prijatelji','100 točnih odgovora u obje matematičke igre zajedno',100,p=>number(p.stats?.balloons?.correct)+number(p.stats?.math?.correct),75,15]
 ];
 special.forEach(([id,icon,title,desc,target,value,xp,stars])=>missions.push({id:'special-'+id,game:'special',icon,title,desc,target,value,xp,stars,tier:4}));
 const claimed=(p,id)=>p.rewardClaims?.[id]===true;
 const progress=(p,m)=>Math.max(claimed(p,m.id)?m.target:0,Math.min(m.target,number(m.value(p))));
 const ready=(p,m)=>!claimed(p,m.id)&&progress(p,m)>=m.target;
 const claim=(p,id)=>{const m=missions.find(x=>x.id===id);if(!m||!ready(p,m))return null;if(!p.rewardClaims||typeof p.rewardClaims!=='object'||Array.isArray(p.rewardClaims))p.rewardClaims={};p.rewardClaims[id]=true;p.xp=number(p.xp)+m.xp;p.stars=number(p.stars)+m.stars;return m};
 const count=p=>missions.filter(m=>claimed(p,m.id)).length;
 const available=p=>missions.filter(m=>ready(p,m)).length;
 const newMedals=tracks.map(([game,icon,title,unit,targets,value])=>[icon,`${title} · majstor`,`${targets[2]} ${unit}`,p=>number(value(p))>=targets[2]||claimed(p,`${game}-3`)]);
 window.KWRewards={missions,claimed,progress,ready,claim,count,available,newMedals,pets,care};
})();
