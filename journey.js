'use strict';
(()=>{
const LIMIT=Number.MAX_SAFE_INTEGER-1;
const valid=n=>Number.isSafeInteger(n)&&n>0?Math.min(LIMIT,n):1;
const level=(p,id)=>valid(p.journeys?.[id]?.level);
const choose=(a,n)=>a[(n-1)%a.length];
const tier=n=>n<4?'easy':n<10?'normal':'hard';
const range=n=>String(n<3?10:n<6?20:n<10?50:n<16?100:n<25?200:n<40?500:1000);
const themes={balloons:['sky','sunset','space','candy','aurora','golden'],aquarium:['Dan','Greben','Noć','Laguna','Dubina'],rocket:['classic','mint','sunset','gold','violet','ice','coral','emerald'],paint:['night','magic','paper','ocean','sunrise','forest','candy','ice','desert'],memory:['animals','fruit','vehicles','space','shapes','sea'],racing:['meadow','sunset','night','winter','coast'],maze:['forest','ice','temple','candy','lava'],fruit:['orchard','tropical','sunset','spring','autumn'],puzzle:['forest','ocean','space','dino','fruit','maze','island','winter','castle'],math:['add','sub','mix','mul','div','all'],dino:['mint','coral','sky','amber','violet','jade','rex','anky','para','raptor','spino'],music:['disco','garden','space','sunset','ocean','royal']};
function plan(id,n){n=valid(n);const d=tier(n),v=choose(themes[id]||[''],n),step=Math.min(n,40),o={journey:true,journeyLevel:n};let title='',goal=0,metric='Bodovi',label='Završi zadatak';
switch(id){
case 'balloons': {const count=Math.min(30,10+Math.floor((n-1)/3)*5);Object.assign(o,{mode:'practice',operation:n<4?choose(['add','sub','mix'],n):choose(['add','sub','mix','mul','div','all'],n),range:range(n),difficulty:d,scene:v,taskCount:count});title=`Riješi ${count} zadataka`;label=`${count} točnih odgovora`;break;}
case 'aquarium': goal=Math.min(180,15+step*5);Object.assign(o,{theme:v});title='Podvodna ekspedicija';label=`Osvoji ${goal} bodova u akvariju`;break;
case 'rocket': goal=Math.min(300,12+step*6);Object.assign(o,{difficulty:d,skin:v,sector:choose(['nebula','ice','ember','emerald'],n),flight:'relax'});title='Istraži novi sektor';label=`Skupi ${goal} bodova u letu`;break;
case 'paint':goal=Math.min(16,3+Math.floor(step/3));metric='Novi potezi';Object.assign(o,{paper:v});title=choose(['Nacrtaj zvjezdani svijet','Nacrtaj svoju omiljenu životinju','Nacrtaj šareni vrt','Nacrtaj čarobni dvorac','Nacrtaj vozilo iz mašte','Nacrtaj podvodni svijet'],n);label=`Napravi ${goal} novih poteza · tema je prijedlog`;break;
case 'memory':{const pairs=n<3?4:n<6?6:n<10?8:n<16?10:n<22?12:n<32?16:20;Object.assign(o,{theme:pairs>12?'mixed':v,pairs:String(pairs),difficulty:d});title='Pronađi skrivene parove';label=`Pronađi svih ${pairs} parova`;break;}
case 'racing':goal=Math.min(350,15+step*8);Object.assign(o,{difficulty:d,track:v,skin:choose(['red','blue','green','gold','violet','orange','ice','pink'],n),drive:'endless',raceStyle:'circuit',raceLength:'endless',circuitShape:n<=5?'classic':choose(['oval','arena','kidney','technical','classic'],n-5)});title='Turbo Circuit ekspedicija';label=`Osvoji ${goal} bodova prolaskom kontrolnih točaka i krugova`;break;
case 'maze':{const diff=n<4?'easy':n<8?'normal':n<14?'hard':n<24?'expert':'master';Object.assign(o,{difficulty:diff,world:v});title='Pronađi skriveno blago';label='Skupi sve ključeve i otvori škrinju';break;}
case 'fruit':Object.assign(o,{mode:'mission',difficulty:d,world:v,missionCount:Math.min(12,3+Math.floor(step/3)),missionTypes:Math.min(6,3+Math.floor(step/12))});title='Nova narudžba';label=`Prikupi ${o.missionCount} voćki od svake od ${o.missionTypes} vrsta`;break;
case 'puzzle':{const size=n<3?3:n<7?4:n<14?5:6;Object.assign(o,{picture:v,size:String(size)});title='Sastavi novu sliku';label=`Složi svih ${size*size} dijelova`;break;}
case 'math':Object.assign(o,{operation:n<4?choose(['add','sub','mix'],n):choose(themes.math,n),range:range(n),route:choose(['classic','island','space'],n),perPlace:Math.min(6,3+Math.floor(step/6))});title='Nova matematička pustolovina';label=`Riješi ${3*o.perPlace} zadataka kroz tri postaje`;break;
case 'dino':Object.assign(o,{species:v,habitat:choose(['forest','volcano','night','ice','jungle'],n),careCount:Math.min(6,2+Math.floor(step/5))});title='Briga o dino prijatelju';label=`Izvrši ${3*o.careCount} aktivnosti`;break;
case 'music':Object.assign(o,{mode:choose(['melody','dance'],n),stage:v,instrument:choose(['bell','flute','synth'],n),musicDifficulty:d,musicLength:Math.min(12,3+Math.floor(step/3)),musicRounds:n>=15?5:3});title='Nova glazbena turneja';label=`Završi ${o.musicRounds} runde${o.mode==='dance'?' uz najmanje 60% točnih ritmova':''}`;break;
}
const minCorrect=id==='music'&&o.mode==='dance'?Math.ceil(Array.from({length:o.musicRounds},(_,i)=>Math.min(14,o.musicLength+1+Math.floor(i/3))).reduce((a,b)=>a+b,0)*.6):0;return{opts:o,title,label,goal,metric,minCorrect};}
function record(p,id,n,passed){n=valid(n);if(!p.journeys||typeof p.journeys!=='object'||Array.isArray(p.journeys))p.journeys={};let current=level(p,id);if(passed&&n===current)p.journeys[id]={level:Math.min(LIMIT,n+1)};return level(p,id)}
window.KWJourney={level,plan,record,valid,limit:LIMIT};
})();
