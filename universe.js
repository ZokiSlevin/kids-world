'use strict';
// Dino Universe: a local, deterministic, profile-wide shop and individual homes.
(() => {
const catalog=[
 ['garden-pond','garden','side','Jezero lotosa','Mirno jezerce s lopočima.',45,'#70cbe3','pond'],
 ['garden-lantern','garden','side','Čarobna svjetiljka','Svjetlost za dino vrt.',30,'#f6c66e','lantern'],
 ['seed-daisy','garden','plant','Livadsko cvijeće','Besplatno sjeme za prvi vrt.',0,'#ffe18c','plant'],
 ['seed-sunflower','garden','plant','Suncokret','Veliki cvijet nakon tri zalijevanja.',15,'#f5bd53','plant'],
 ['seed-crystal','garden','plant','Kristalni cvijet','Ljubičasti cvjetovi u tri faze.',30,'#c4a1f4','plant'],
 ['kitchen-fruit','kitchen','side','Košara voća','Šarena košara za kuhinju.',15,'#f7a46f','fruit'],
 ['kitchen-tea','kitchen','side','Čajni kutak','Šalica i čajnik.',25,'#90d9cb','tea'],
 ['kitchen-clock','kitchen','wall','Sunčani sat','Ukras za zid.',20,'#ffd46e','clock'],
 ['bath-duck','bath','side','Gumena patkica','Mala žuta prijateljica.',12,'#ffd56d','duck'],
 ['bath-towels','bath','side','Mekani ručnici','Šareni ručnici kraj kupke.',18,'#8fcef3','towels'],
 ['bath-mirror','bath','wall','Zvjezdano ogledalo','Svjetlucavi zidni ukras.',35,'#9fc7ff','mirror'],
 ['play-teddy','playroom','side','Plišani medo','Prijatelj za igru.',25,'#cfa17e','teddy'],
 ['play-train','playroom','side','Mali vlak','Veseli drveni vlak.',35,'#f08d9e','train'],
 ['play-stars','playroom','wall','Zastavice zvijezda','Vesele boje na zidu.',18,'#c0a9f3','flags'],
 ['bed-moon','bedroom','side','Mjesečeva lampica','Toplo svjetlo za snove.',25,'#ffe4a3','moon'],
 ['bed-pillow','bedroom','side','Zvjezdani jastuk','Mekani jastuk u spavaonici.',20,'#c1b0ec','pillow'],
 ['bed-dream','bedroom','wall','Hvatač snova','Čarobni ukras iznad kreveta.',40,'#9be4d0','dream'],
].map(([id,room,slot,name,desc,price,color,kind])=>({id,room,slot,name,desc,price,color,kind}));
const items=Object.fromEntries(catalog.map(i=>[i.id,i]));
const rooms={garden:'Vrt',kitchen:'Kuhinja',bath:'Kupaonica',playroom:'Igraonica',bedroom:'Spavaonica'};
const routes=[{id:'forest',name:'Čarobna šuma',icon:'🌿',minutes:1,energy:8,stars:3,find:'Šumski list',color:'#7ed6a7',kind:'leaf'},
{id:'river',name:'Kristalna rijeka',icon:'💎',minutes:3,energy:12,stars:5,find:'Riječni kristal',color:'#8adbf0',kind:'crystal'},
{id:'volcano',name:'Dolina fosila',icon:'🦴',minutes:5,energy:18,stars:8,find:'Zlatni fosil',color:'#f5b46f',kind:'fossil'},
{id:'stars',name:'Zvjezdani vrh',icon:'🌟',minutes:10,energy:24,stars:12,find:'Zvjezdani kamen',color:'#c5aaf6',kind:'star'}];
const routeMap=Object.fromEntries(routes.map(r=>[r.id,r]));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const finite=(n,d=0)=>typeof n==='number'&&Number.isFinite(n)?n:d;
const safeInt=n=>Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(finite(n))));
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
function ensure(profile){
 const raw=obj(profile.dinoUniverse),owned=Array.isArray(raw.owned)?raw.owned.filter(id=>own(items,id)):[];
 raw.version=1;raw.owned=[...new Set(['seed-daisy',...owned])];raw.discoveries=[...new Set((Array.isArray(raw.discoveries)?raw.discoveries:[]).filter(id=>own(routeMap,id)))];
 raw.trips=safeInt(raw.trips);raw.spent=safeInt(raw.spent);profile.dinoUniverse=raw;return raw;
}
function pet(p,profile){
 const s=obj(p.universe),u=profile?ensure(profile):null;
 s.decor=obj(s.decor);for(const slot of Object.keys(s.decor)){const id=s.decor[slot],i=own(items,id)?items[id]:null;if(!i||i.slot==='plant'||slot!==i.room+'-'+i.slot||(u&&!u.owned.includes(id)))delete s.decor[slot]}
 const plant=obj(s.plant);s.plant=own(items,plant.id)&&items[plant.id].slot==='plant'&&(!u||u.owned.includes(plant.id))?{id:plant.id,water:Math.min(3,safeInt(plant.water))}:null;
 const t=obj(s.trip);s.trip=own(routeMap,t.id)&&Number.isFinite(t.end)&&Number.isFinite(t.start)&&t.end-t.start===routeMap[t.id].minutes*60000?{id:t.id,start:t.start,end:t.end}:null;
 p.universe=s;return s;
}
const sleeping=(p,now=Date.now())=>p.care>=3&&finite(p.sleepUntil)>now;
const activeTrip=(p,now=Date.now())=>{const t=p.universe?.trip;return !!(t&&t.end>now)};
const readyTrip=(p,now=Date.now())=>!!(p.universe?.trip&&!activeTrip(p,now));
const canCare=(p,now=Date.now())=>p.care>=3&&!sleeping(p,now)&&!activeTrip(p,now);
function buy(profile,id){const u=ensure(profile),i=own(items,id)?items[id]:null;if(!i)return {ok:false,msg:'Predmet nije dostupan.'};if(u.owned.includes(id))return {ok:false,msg:'Predmet već imaš u inventaru.'};const balance=safeInt(profile.stars);if(balance<i.price)return {ok:false,msg:'Nemaš dovoljno zvjezdica. Osvoji ih igranjem Kids Worlda.'};profile.stars=balance-i.price;u.owned.push(id);u.spent=Math.min(Number.MAX_SAFE_INTEGER,u.spent+i.price);return {ok:true,msg:`${i.name} je u inventaru!`};}
function equip(profile,p,id,now=Date.now()){
 const u=ensure(profile),s=pet(p,profile),i=own(items,id)?items[id]:null;if(!canCare(p,now)||!i||!u.owned.includes(id))return {ok:false,msg:'Predmet još nije dostupan za uređenje.'};
 if(i.slot==='plant'){if(s.plant?.id===id)return {ok:false,msg:'Ovo sjeme je već posađeno.'};s.plant={id,water:0};return {ok:true,room:'garden',msg:'Sjeme je posađeno. Zalij ga tri puta za puni cvat.'}}
 const slot=i.room+'-'+i.slot;if(s.decor[slot]===id){delete s.decor[slot];return {ok:true,room:i.room,msg:'Ukras je vraćen u inventar.'}}s.decor[slot]=id;return {ok:true,room:i.room,msg:`${i.name} sada je u prostoriji!`};
}
function water(profile,p,now=Date.now()){
 const s=pet(p,profile);if(!canCare(p,now)||!s.plant)return {ok:false,msg:'Najprije posadi sjeme u vrt.'};if(s.plant.water>=3)return {ok:false,msg:'Cvijet je već procvjetao. Uživaj u vrtu!'};s.plant.water++;return {ok:true,msg:s.plant.water===3?'Tvoj cvijet je procvjetao!':'Biljka raste. Još '+(3-s.plant.water)+' zalijevanja.'};
}
function depart(profile,p,id,now=Date.now()){
 const s=pet(p,profile),r=own(routeMap,id)?routeMap[id]:null;if(!canCare(p,now)||!r||s.trip)return {ok:false,msg:'Najprije se pobrini za dinosaura ili preuzmi završeno otkriće.'};if(p.needs.energy-r.energy<=20)return {ok:false,msg:'Dino nema dovoljno energije za ovu ekspediciju. Neka se prvo odmori.'};p.needs.energy-=r.energy;p.lastSeen=now;s.trip={id,start:now,end:now+r.minutes*60000};return {ok:true,msg:`${p.name} je krenuo u istraživanje!`};
}
function claim(profile,p,now=Date.now()){
 const s=pet(p,profile),u=ensure(profile);if(!readyTrip(p,now))return {ok:false,msg:'Ekspedicija još nije završila.'};const r=routeMap[s.trip.id],first=!u.discoveries.includes(r.id);if(first){u.discoveries.push(r.id);profile.stars=Math.min(Number.MAX_SAFE_INTEGER,safeInt(profile.stars)+r.stars)}u.trips=Math.min(Number.MAX_SAFE_INTEGER,u.trips+1);s.trip=null;return {ok:true,first,stars:first?r.stars:0,msg:first?`Otkriveno: ${r.find}! +${r.stars} ★`:`${r.name} ponovno je istražena. Otkriće je već u albumu.`};
}
function countdown(p,now=Date.now()){const n=Math.max(0,Math.ceil(((p.universe?.trip?.end||0)-now)/1000));return [Math.floor(n/60),n%60].map(x=>String(x).padStart(2,'0')).join(':')}
// Hand-drawn SVG props in the same scale and soft palette as Dino Home.
function picture(kind,color='#c5e6b7',stage=3){const c=color;const shadow='<ellipse cx="50" cy="87" rx="37" ry="8" fill="#213b50" opacity=".18"/>';const star='<path d="M50 12L60 35 85 37 66 53 72 80 50 66 28 80 34 53 15 37 40 35Z" fill="'+c+'" stroke="#fff0bf" stroke-width="4" stroke-linejoin="round"/>';const art={
 pond:`<ellipse cx="50" cy="65" rx="46" ry="27" fill="#508e85" stroke="#c4dfae" stroke-width="5"/><ellipse cx="50" cy="63" rx="38" ry="19" fill="${c}"/><path d="M21 64q20-10 39 1m-10 8q16-6 26 0" fill="none" stroke="#d4f9ff" stroke-width="3" stroke-linecap="round"/><ellipse cx="62" cy="55" rx="14" ry="7" fill="#589a68"/><path d="M62 57q-20-14-8-19l8 8 8-12q14 6-8 23" fill="#f1a9cd"/>`,
 lantern:`<path d="M50 18V78M32 79H68" stroke="#9b826e" stroke-width="8" stroke-linecap="round"/><rect x="28" y="23" width="44" height="39" rx="13" fill="#9c8466"/><rect x="35" y="29" width="30" height="28" rx="8" fill="${c}" stroke="#fff0be" stroke-width="3"/><path d="M25 25L50 8 75 25Z" fill="#8c7769"/><circle cx="50" cy="42" r="10" fill="#fff4bd"/>`,
 plant:`<path d="M26 63H74L68 88H32Z" fill="#bb886a" stroke="#8d695d" stroke-width="3"/><ellipse cx="50" cy="63" rx="25" ry="7" fill="#79584a"/>${stage===0?'<ellipse cx="50" cy="59" rx="7" ry="4" fill="#f0d39b"/>':`<path d="M50 62V${stage===1?42:stage===2?25:17}" stroke="#428b68" stroke-width="5" stroke-linecap="round"/><path d="M50 52Q26 30 25 48Q33 58 50 52M50 43Q78 26 76 45Q62 53 50 43" fill="#6fbd77"/>${stage>=2?`<g fill="${c}" stroke="#fff2bc" stroke-width="2">${Array.from({length:6},(_,i)=>`<ellipse cx="50" cy="${stage===2?22:15}" rx="${stage===2?8:11}" ry="${stage===2?4:7}" transform="rotate(${60*i} 50 ${stage===2?31:25})"/>`).join('')}</g><circle cx="50" cy="${stage===2?31:25}" r="${stage===2?5:8}" fill="#d69a4f"/>`:''}`}`,
 fruit:`<g stroke="#9d6655" stroke-width="2"><circle cx="29" cy="43" r="16" fill="#f0837d"/><circle cx="53" cy="39" r="17" fill="#fbc66e"/><circle cx="72" cy="48" r="15" fill="#a7d47d"/></g><path d="M29 30q0-12 14-12M53 24q4-9 14-6" stroke="#488e63" stroke-width="5" stroke-linecap="round"/><path d="M10 51Q14 85 50 86Q86 85 90 51Z" fill="#d5a472" stroke="#a57859" stroke-width="4"/><path d="M22 64H78M30 75H70" stroke="#f9d6a2" stroke-width="4"/>`,
 tea:`<ellipse cx="44" cy="64" rx="30" ry="20" fill="${c}" stroke="#5f9c93" stroke-width="3"/><path d="M67 56q25-25 25 2q0 16-23 13M16 58L3 39 23 43" stroke="#5f9c93" stroke-width="6" fill="none"/><path d="M23 45Q44 30 65 45Z" fill="#d2eee0"/><circle cx="44" cy="34" r="6" fill="#f4d695"/><path d="M65 72h26l-4 15H69Z" fill="#f5e5bd"/>`,
 clock:`<circle cx="50" cy="48" r="35" fill="${c}" stroke="#b98f62" stroke-width="4"/><circle cx="50" cy="48" r="26" fill="#fff4d5"/><path d="M50 28V48L68 55" stroke="#576779" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="48" r="4" fill="#576779"/>`,
 duck:`<ellipse cx="50" cy="69" rx="33" ry="20" fill="${c}" stroke="#d6a451" stroke-width="3"/><circle cx="69" cy="41" r="21" fill="${c}" stroke="#d6a451" stroke-width="3"/><path d="M82 45l15 5-15 8Z" fill="#ef9660"/><circle cx="74" cy="36" r="4" fill="#45505d"/><ellipse cx="38" cy="68" rx="15" ry="8" fill="#f0b94f"/>`,
 towels:`<g stroke="#f0faff" stroke-width="3"><rect x="15" y="64" width="70" height="19" rx="9" fill="${c}"/><rect x="21" y="44" width="58" height="20" rx="9" fill="#b7e4c6"/><rect x="27" y="24" width="46" height="20" rx="9" fill="#f4c8dd"/></g><path d="M35 32H61M29 52H67M24 72H74" stroke="#fff" opacity=".6" stroke-width="3"/>`,
 mirror:`<path d="M50 8L62 25 83 26 75 46 84 65 62 68 50 86 37 68 16 65 25 46 17 26 38 25Z" fill="${c}" stroke="#fff4b8" stroke-width="4"/><ellipse cx="50" cy="47" rx="23" ry="29" fill="#d1f5fa"/><path d="M36 31L61 56M42 24L66 48" stroke="#fff" stroke-width="5" opacity=".8"/>`,
 teddy:`<circle cx="30" cy="23" r="12" fill="${c}"/><circle cx="70" cy="23" r="12" fill="${c}"/><ellipse cx="50" cy="67" rx="25" ry="23" fill="${c}"/><circle cx="50" cy="39" r="27" fill="${c}" stroke="#a97b65" stroke-width="2"/><ellipse cx="50" cy="47" rx="13" ry="9" fill="#f6d4ac"/><circle cx="39" cy="35" r="3" fill="#4c4450"/><circle cx="61" cy="35" r="3" fill="#4c4450"/><circle cx="50" cy="43" r="3" fill="#4c4450"/><ellipse cx="31" cy="82" rx="12" ry="9" fill="#e9bf9a"/><ellipse cx="69" cy="82" rx="12" ry="9" fill="#e9bf9a"/>`,
 train:`<rect x="8" y="48" width="52" height="28" rx="7" fill="${c}"/><rect x="16" y="31" width="31" height="21" rx="5" fill="#8fc9e7"/><rect x="48" y="34" width="9" height="15" rx="3" fill="#d8a363"/><path d="M61 66h8" stroke="#e1c2a4" stroke-width="4"/><rect x="69" y="48" width="25" height="28" rx="5" fill="#80c9a9"/>${[23,47,81].map(x=>`<circle cx="${x}" cy="79" r="9" fill="#546e85" stroke="#f6e6ba" stroke-width="3"/>`).join('')}`,
 flags:`<path d="M4 20Q50 48 96 20" fill="none" stroke="#e0bb86" stroke-width="4"/>${[14,38,62,86].map((x,i)=>`<path d="M${x-9} ${i===1||i===2?34:24}h18l-9 27Z" fill="${[c,'#f8c770','#86d3b8','#eda5c6'][i]}" stroke="#fff2ce" stroke-width="2"/>`).join('')}`,
 moon:`<path d="M55 10Q32 46 73 59Q43 92 20 55Q6 22 55 10Z" fill="${c}" stroke="#fff4c4" stroke-width="4"/><path d="M48 67V82M28 83H70" stroke="#a890a3" stroke-width="7" stroke-linecap="round"/><circle cx="76" cy="24" r="4" fill="#fff2ae"/>`,
 pillow:`<rect x="10" y="32" width="80" height="51" rx="20" fill="${c}" stroke="#f0e9ff" stroke-width="4"/><path d="M50 40L56 52 70 54 60 63 63 75 50 69 37 75 40 63 30 54 44 52Z" fill="#ffdf8d"/>`,
 dream:`<circle cx="50" cy="34" r="26" fill="none" stroke="${c}" stroke-width="6"/><path d="M50 9L72 48 28 48Z M28 20L72 20 50 60Z" stroke="#e7ffea" stroke-width="2" fill="none"/><path d="M30 55V77M50 60V88M70 55V77" stroke="#d8be98" stroke-width="3"/><ellipse cx="30" cy="76" rx="6" ry="12" fill="#f2c2d9"/><ellipse cx="50" cy="84" rx="6" ry="12" fill="${c}"/><ellipse cx="70" cy="76" rx="6" ry="12" fill="#f6d58c"/>`,
 leaf:`<path d="M16 78Q9 13 86 15Q83 80 30 83Z" fill="${c}" stroke="#d0f4be" stroke-width="4"/><path d="M17 83L76 25M39 60L32 31M55 44L79 49" fill="none" stroke="#398d6a" stroke-width="4" stroke-linecap="round"/>`,
 crystal:`<path d="M50 7L84 43 69 85H31L16 43Z" fill="${c}" stroke="#e8ffff" stroke-width="4"/><path d="M50 7L37 43 50 85 65 43Z" fill="#e5f8ff" opacity=".72"/><path d="M16 43H84" stroke="#4eacc4" stroke-width="3"/>`,
 fossil:`<ellipse cx="50" cy="54" rx="42" ry="33" fill="${c}" stroke="#e5c397" stroke-width="4"/><path d="M24 65Q13 26 45 24Q77 21 80 53Q76 76 50 75Q30 73 31 49Q33 34 51 35Q66 35 66 50Q65 62 51 62Q40 60 43 49" fill="none" stroke="#fff1c4" stroke-width="7" stroke-linecap="round"/>`,star};
 return shadow+(art[kind]||star);
}
function thumb(kind,color,stage=3){return `<svg viewBox="0 0 100 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${picture(kind,color,stage)}</svg>`}
function decorations(p,room){const s=pet(p),out=[];for(const id of Object.values(s.decor)){const i=items[id];if(i.room!==room)continue;let pos=i.slot==='wall'?[238,32,1.05]:room==='garden'?[470,240,1.55]:[32,253,1.08];out.push(`<g data-universe-item="${id}" transform="translate(${pos[0]} ${pos[1]}) scale(${pos[2]})">${picture(i.kind,i.color)}</g>`)}if(room==='garden'&&s.plant){const i=items[s.plant.id];out.push(`<g data-universe-plant="${i.id}" transform="translate(38 240) scale(1.25)">${picture(i.kind,i.color,s.plant.water)}</g>`)}return out.join('')}
window.KWUniverse={catalog,items,rooms,routes,routeMap,ensure,pet,buy,equip,water,depart,claim,activeTrip,readyTrip,canCare,countdown,thumb,decorations};
})();
