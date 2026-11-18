(function(){
"use strict";
// ---------- keyboard model ----------
const ROWS=[
  {off:0,   keys:"1234567890-".split("")},
  {off:0.5, keys:"qwertyuiop".split("")},
  {off:0.75,keys:"asdfghjkl;".split("")},
  {off:1.25,keys:"zxcvbnm,./".split("")}
];
const COLF=["L5","L4","L3","L2","L2","R2","R2","R3","R4","R5","R5"];
const KEY={};
ROWS.forEach((row,r)=>row.keys.forEach((k,c)=>{KEY[k]={f:COLF[c],r:r};}));
KEY[" "]={f:"T",r:4};
const FN={L5:"左手の小指",L4:"左手の薬指",L3:"左手の中指",L2:"左手の人差し指",R2:"右手の人差し指",R3:"右手の中指",R4:"右手の薬指",R5:"右手の小指",T:"親指"};
const FCLS={L5:"pinky",L4:"ring",L3:"middle",L2:"index",R2:"index",R3:"middle",R4:"ring",R5:"pinky",T:"thumb"};
const ROWN=["数字の段","上の段","ホーム段","下の段","スペース"];
const lab=k=>k===" "?"スペース":k.toUpperCase();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function diag(exp,got){
  const a=KEY[exp],b=KEY[got]; if(!a||!b) return "";
  if(a.f==="T") return "スペースキーは親指で打ちます。";
  if(b.f==="T") return "スペースキーを押していました。";
  if(a.f===b.f){
    if(a.r!==b.r) return "指は合っています。"+ROWN[b.r]+"を押していて、正しくは"+ROWN[a.r]+"です。";
    return "指は合っています。人差し指が受け持つ2列のうち、となりの列を押しています。";
  }
  if(a.f[0]===b.f[0]) return "同じ手の別の指です。"+FN[a.f].slice(3)+"で打つキーに、"+FN[b.f].slice(3)+"が出ていました。";
  return "反対の手のキーです。"+FN[a.f]+"で打ちます。";
}
function shortDiag(exp,got){
  const a=KEY[exp],b=KEY[got]; if(!a||!b) return "";
  if(a.f===b.f) return a.r!==b.r?"指は正しく、段がずれています":"指は正しく、列がずれています";
  if(a.f!=="T"&&b.f!=="T"&&a.f[0]===b.f[0]) return "同じ手の別の指を使っています";
  return "反対の手を使っています";
}

// ---------- romaji engine ----------
const BASE={},YOUON={};
function parse(src,dst){src.trim().split(/\s+/).forEach(p=>{const i=p.indexOf(":");dst[p.slice(0,i)]=p.slice(i+1).split("/");});}
parse("あ:a い:i う:u/wu え:e お:o か:ka/ca き:ki く:ku/cu/qu け:ke こ:ko/co さ:sa し:shi/si/ci す:su せ:se/ce そ:so た:ta ち:chi/ti つ:tsu/tu て:te と:to な:na に:ni ぬ:nu ね:ne の:no は:ha ひ:hi ふ:fu/hu へ:he ほ:ho ま:ma み:mi む:mu め:me も:mo や:ya ゆ:yu よ:yo ら:ra り:ri る:ru れ:re ろ:ro わ:wa を:wo が:ga ぎ:gi ぐ:gu げ:ge ご:go ざ:za じ:ji/zi ず:zu ぜ:ze ぞ:zo だ:da ぢ:di づ:du で:de ど:do ば:ba び:bi ぶ:bu べ:be ぼ:bo ぱ:pa ぴ:pi ぷ:pu ぺ:pe ぽ:po ぁ:la/xa ぃ:li/xi ぅ:lu/xu ぇ:le/xe ぉ:lo/xo ゃ:lya/xya ゅ:lyu/xyu ょ:lyo/xyo ー:- 、:, 。:. %:5 ・:/",BASE);
parse("きゃ:kya きゅ:kyu きょ:kyo しゃ:sha/sya しゅ:shu/syu しょ:sho/syo しぇ:she/sye ちゃ:cha/tya/cya ちゅ:chu/tyu/cyu ちょ:cho/tyo/cyo ちぇ:che/tye/cye にゃ:nya にゅ:nyu にょ:nyo ひゃ:hya ひゅ:hyu ひょ:hyo みゃ:mya みゅ:myu みょ:myo りゃ:rya りゅ:ryu りょ:ryo ぎゃ:gya ぎゅ:gyu ぎょ:gyo じゃ:ja/zya/jya じゅ:ju/zyu/jyu じょ:jo/zyo/jyo じぇ:je/zye/jye びゃ:bya びゅ:byu びょ:byo ぴゃ:pya ぴゅ:pyu ぴょ:pyo ふぁ:fa ふぃ:fi ふぇ:fe ふぉ:fo てぃ:thi でぃ:dhi",YOUON);
Object.keys(YOUON).forEach(k=>{
  const a=k[0],b=k[1],extra=[];
  (BASE[a]||[]).forEach(x=>(BASE[b]||[]).forEach(y=>extra.push(x+y)));
  YOUON[k]=Array.from(new Set(YOUON[k].concat(extra)));
});
const uniq=a=>Array.from(new Set(a));

function tokenize(s){
  const raw=[];
  for(let i=0;i<s.length;){
    const two=s.slice(i,i+2);
    if(YOUON[two]){raw.push({k:two,opts:YOUON[two]});i+=2;continue;}
    const c=s[i];
    if(c==="|"){i++;continue;} // 文節の区切り（表示の折り返し用）
    if(c==="っ"||c==="ん"){raw.push({k:c});i++;continue;}
    raw.push({k:c,opts:BASE[c]||[c.toLowerCase()]});i++;
  }
  const out=[];
  for(let i=raw.length-1;i>=0;i--){
    const u=raw[i],next=out[0];
    if(u.k==="ん"){
      const single=next&&next.opts.every(o=>/^[bcdfghjklmpqrstvwxz]/.test(o));
      out.unshift({k:"ん",opts:single?["n","nn","xn"]:["nn","xn"]});
    }else if(u.k==="っ"){
      const cons=next?next.opts.filter(o=>/^[bcdfghjkmpqrstvwyz]/.test(o)):[];
      const small=["ltu","xtu","ltsu","xtsu"];
      if(next&&!next.merged&&cons.length){
        const opts=cons.map(o=>o[0]+o);
        small.forEach(s=>next.opts.forEach(o=>opts.push(s+o)));
        out[0]={k:"っ"+next.k,opts:uniq(opts),merged:true};
      }else out.unshift({k:"っ",opts:small});
    }else out.unshift(u);
  }
  return out;
}

function Engine(units){this.u=units;this.i=0;this.buf="";this.typed=[];this.done=units.length===0;}
Engine.prototype.disp=function(k,buf){const u=this.u[k];return u.opts.find(o=>o.startsWith(buf))||u.opts[0];};
Engine.prototype.expected=function(){
  if(this.done) return null;
  const d=this.disp(this.i,this.buf);
  if(d.length>this.buf.length) return d[this.buf.length];
  return this.i+1<this.u.length?this.disp(this.i+1,"")[0]:null;
};
Engine.prototype.complete=function(){this.typed.push(this.buf);this.i++;this.buf="";if(this.i>=this.u.length)this.done=true;};
Engine.prototype.feed=function(ch){
  const u=this.u[this.i],nb=this.buf+ch;
  const cand=u.opts.filter(o=>o.startsWith(nb));
  if(cand.length){
    this.buf=nb;
    if(cand.indexOf(nb)>=0&&!cand.some(o=>o.length>nb.length)) this.complete();
    return true;
  }
  if(this.buf&&u.opts.indexOf(this.buf)>=0&&this.i+1<this.u.length){this.complete();return this.feed(ch);}
  return false;
};

// ---------- content（出題データは data.js） ----------
const rnd=n=>Math.floor(Math.random()*n);
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
// % は 5 のキーで打つが、表示は % のままにする。
// 読みの | は文節の区切りで、画面ではこの単位でまとめて折り返す。
function kanaItem(jp,kana){
  const units=tokenize(kana).map(u=>u.k==="%"?Object.assign(u,{show:"%"}):u);
  if(kana.indexOf("|")>=0){
    const starts=new Set();let pos=0;
    kana.split("|").forEach(seg=>{starts.add(pos);pos+=seg.length;});
    let at=0,ph=-1;
    units.forEach(u=>{if(starts.has(at)) ph++;u.ph=ph;at+=u.k.length;});
  }
  return {jp:jp,kana:kana.replace(/\|/g,""),units:units};
}
const rawItem=s=>({raw:true,units:s.split("").map(c=>({k:c,opts:[c]}))});
// 英文：表示は元の文字のまま。大文字は同じ文字のキー、? は / のキーで正解にする（Shift は判定しない）。
const enKey=c=>c==="?"?"/":c.toLowerCase();
// 英文は単語ごとにまとめて折り返す（空白は前の単語に付ける）。
const enItem=s=>{let ph=0;return {raw:true,en:true,units:s.split("").map(c=>{const u={k:c,show:c,opts:[enKey(c)],ph:ph};if(c===" ") ph++;return u;})};};
// 「仕事の文章」の24文はビジネスメールに統合した。
const BIZ_ALL=BIZ.concat(SENT);
function rawLine(pool,focus){
  const g=[];
  for(let n=0;n<5;n++){
    const len=3+rnd(2);let s="";
    for(let i=0;i<len;i++){const src=focus&&Math.random()<0.55?focus:pool;s+=src[rnd(src.length)];}
    g.push(s);
  }
  return rawItem(g.join(" "));
}
const defRomaji=kana=>tokenize(kana).map(u=>u.opts[0]).join("");

const COURSES=[
  {id:"home",no:"1",grp:"base",name:"ホーム段",ds:"指の定位置 ASDF JKL;",gen:()=>({items:Array.from({length:6},()=>rawLine("asdfjkl;","asdfghjkl;"))})},
  {id:"upper",no:"2",grp:"base",name:"上段をたす",ds:"Q〜P の段まで",gen:()=>({items:Array.from({length:6},()=>rawLine("asdfghjkl","qwertyuiop"))})},
  {id:"lower",no:"3",grp:"base",name:"下段をたす",ds:"Z〜/ の段まで",gen:()=>({items:Array.from({length:6},()=>rawLine("asdfghjkl","zxcvbnm,."))})},
  {id:"num",no:"4",grp:"base",name:"数字の段",ds:"1〜0 と -（金額・日付）",gen:()=>({items:Array.from({length:6},()=>rawLine("1234567890-","1234567890"))})},
  {id:"vowel",no:"5",grp:"base",name:"母音とホーム段",ds:"あさ・かお・すし など",gen:()=>({items:shuffle(VOWEL).slice(0,12).map(k=>kanaItem(k,k))})},
  {id:"words",no:"6",grp:"base",name:"よく使う言葉",ds:"確認・資料・連絡 など",gen:()=>({items:shuffle(WORDS).slice(0,12).map(w=>kanaItem(w[0],w[1]))})},
  {id:"weak",no:"★",grp:"base",name:"苦手キー集中",ds:"記録から自動で出題",gen:genWeak},
  {id:"biz",no:"7",grp:"work",name:"ビジネスメール",ds:"依頼・お礼・お詫び",gen:()=>({items:shuffle(BIZ_ALL).slice(0,5).map(w=>kanaItem(w[0],w[1]))})},
  {id:"trade",no:"8",grp:"work",name:"貿易実務の文",ds:"信用状・船積み・通関",gen:()=>({items:shuffle(TRADE).slice(0,5).map(w=>kanaItem(w[0],w[1]))})},
  {id:"lab",no:"9",grp:"work",name:"研究の文",ds:"実験・測定・解析の記録",gen:()=>({items:shuffle(LAB).slice(0,5).map(w=>kanaItem(w[0],w[1]))})},
  {id:"en",no:"10",grp:"work",name:"英語の業務文",ds:"メール・会議の英文",gen:()=>({items:shuffle(EN).slice(0,6).map(enItem)})}
];
const GROUPS=[["base","基礎"],["work","実務の文"]];
const COURSE={};COURSES.forEach(c=>{COURSE[c.id]=c;});
COURSE.sent=COURSE.biz; // 旧「仕事の文章」の記録はビジネスメールとして扱う
// 短め練習のときの問題数
function shortLimit(id){return ["biz","trade","lab"].includes(id)?1:id==="en"?2:["words","vowel","weak"].includes(id)?4:3;}

function weakKeys(min){
  return Object.keys(store.keys).filter(k=>k!==" ").map(k=>{const v=store.keys[k];return {k:k,n:v.n,miss:v.miss,rate:v.n?v.miss/v.n:0};})
    .filter(x=>x.n>=(min||5)&&x.miss>=2).sort((a,b)=>b.rate-a.rate||b.miss-a.miss);
}
let CLAUSES=null;
function clauses(){
  if(CLAUSES) return CLAUSES;
  CLAUSES=[];
  const cut=s=>s.split(/(?<=[、。])/).filter(Boolean);
  BIZ_ALL.concat(TRADE,LAB).forEach(p=>{
    const a=cut(p[0]),b=cut(p[1]);
    if(a.length!==b.length) return;
    a.forEach((jp,i)=>{const k=b[i].replace(/^\|+|\|+$/g,""),n=k.replace(/\|/g,"").length;if(n>=6&&n<=22) CLAUSES.push([jp,k]);});
  });
  return CLAUSES;
}
function genWeak(){
  const w=weakKeys(5).slice(0,4).map(x=>x.k);
  if(!w.length) return {items:shuffle(WORDS).slice(0,10).map(x=>kanaItem(x[0],x[1])),note:"まだ記録が少ないので、よく使う言葉から出題しています。他のコースで練習すると、ここに苦手キーが集まります。"};
  const set=new Set(w);
  const score=p=>{const r=defRomaji(p[1]);let s=0;for(const c of r) if(set.has(c)) s++;return {p:p,s:s,d:s/r.length};};
  const words=shuffle(WORDS.concat(VOWEL.map(k=>[k,k])).map(score).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,24));
  const phr=shuffle(clauses().map(score).filter(x=>x.s>=2).sort((a,b)=>b.d-a.d).slice(0,30));
  const items=[];let j=0,k=0;
  for(let i=0;i<10;i++){
    const pick=i%3===1&&phr.length?phr[k++%phr.length]:words.length?words[j++%words.length]:null;
    if(i%3===2||!pick) items.push(rawLine("asdfjkl",w.join("")));
    else items.push(kanaItem(pick.p[0],pick.p[1]));
  }
  return {items:items,note:"苦手キー："+w.map(lab).join("・")+" を多めに出題しています。"};
}

// ---------- storage ----------
const SKEY="mienai-uchi-v1";
function load(){
  let s=null;
  try{s=JSON.parse(localStorage.getItem(SKEY)||"null");}catch(e){}
  if(!s||typeof s!=="object") s={};
  s.keys=s.keys||{};s.pairs=s.pairs||{};s.hist=s.hist||[];s.real=s.real||[];s.days=s.days||{};s.setDays=s.setDays||[];
  s.set=Object.assign({fingers:true,course:"home",calm:true,short:true,hideRomaji:false},s.set||{});
  if(s.set.course==="sent") s.set.course="biz";
  // 過去に保存された自動ヒント設定もすべて無効化する。
  s.set.hint=-1;
  if(!COURSE[s.set.course]) s.set.course="home";
  return s;
}
function save(){try{localStorage.setItem(SKEY,JSON.stringify(store));}catch(e){}}
const store=load();
function rec(k,miss,got){
  if(!k||!KEY[k]) return;
  const v=store.keys[k]||(store.keys[k]={n:0,miss:0});
  v.n++;
  if(miss){v.miss++;const p=k+">"+got;store.pairs[p]=(store.pairs[p]||0)+1;}
}

// ---------- dom ----------
const $=id=>document.getElementById(id);
const els={courses:$("courses"),meta:$("meta"),jp:$("jp"),kana:$("kana"),romaji:$("romaji"),fb:$("fb"),fbMain:$("fbMain"),fbHint:$("fbHint"),prompt:$("prompt"),summary:$("summary"),veil:$("veil"),kb:$("kb"),kbHeat:$("kbHeat"),weakList:$("weakList"),pairList:$("pairList"),hist:$("hist"),reset:$("reset"),fingerBtn:$("fingerBtn"),romajiBtn:$("romajiBtn"),calmBtn:$("calmBtn"),shortBtn:$("shortBtn"),practiceActions:$("practiceActions"),pausePanel:$("pausePanel"),recordsFold:$("recordsFold"),keyGuide:$("keyGuide")};

function buildKb(el){
  let h='<div class="kb-rows">';
  ROWS.forEach(row=>{
    h+='<div class="kb-row" style="--off:'+row.off+'">';
    row.keys.forEach(k=>{h+='<div class="key f-'+FCLS[KEY[k].f]+(k==="f"||k==="j"?" bump":"")+'" data-k="'+esc(k)+'"><span>'+esc(lab(k))+"</span></div>";});
    h+="</div>";
  });
  h+='<div class="kb-row space-row"><div class="key f-thumb space" data-k=" "><span>スペース</span></div></div></div>';
  el.innerHTML=h;
  const map={};el.querySelectorAll(".key").forEach(n=>{map[n.dataset.k]=n;});
  return map;
}
const K=buildKb(els.kb);
const KH=buildKb(els.kbHeat);

function renderCourses(){
  els.courses.innerHTML=GROUPS.map(g=>'<div><h2 class="label">'+g[1]+'</h2><div class="courses">'+COURSES.filter(c=>c.grp===g[0]).map(c=>'<button class="course" data-c="'+c.id+'" aria-pressed="'+(round&&round.course.id===c.id)+'"><span class="no">'+c.no+'</span><span class="nm">'+esc(c.name)+'</span><span class="ds">'+esc(c.ds)+"</span></button>").join("")+"</div></div>").join("");
}
els.courses.addEventListener("click",e=>{const b=e.target.closest(".course");if(b) startRound(b.dataset.c);});
$("todayBtn").addEventListener("click",startToday);

// settings
function applySettings(){
  els.kb.classList.toggle("fingers",!!store.set.fingers);
  els.fingerBtn.setAttribute("aria-pressed",String(!!store.set.fingers));
  els.calmBtn.setAttribute("aria-pressed",String(!!store.set.calm));
  els.calmBtn.textContent="気楽モード "+(store.set.calm?"ON":"OFF");
  els.shortBtn.setAttribute("aria-pressed",String(!!store.set.short));
  els.shortBtn.textContent="短め練習 "+(store.set.short?"ON":"OFF");
  els.romajiBtn.setAttribute("aria-pressed",String(!!store.set.hideRomaji));
  els.romajiBtn.textContent="ローマ字を隠す "+(store.set.hideRomaji?"ON":"OFF");
  $("kb").classList.toggle("calm",!!store.set.calm);
  document.querySelector(".practice").classList.toggle("is-calm",!!store.set.calm);
  $("modeDesc").textContent=store.set.calm
    ?"気楽モード：ミスの赤い演出と練習中の成績表示を控え、記録は閉じておきます。"
    :"通常モード：ミスと正確率も確認できます。気になるときは気楽モードへ戻せます。";
  els.calmBtn.title=$("modeDesc").textContent;
  els.calmBtn.setAttribute("aria-describedby","modeDesc");
}
els.fingerBtn.addEventListener("click",()=>{store.set.fingers=!store.set.fingers;save();applySettings();});
els.calmBtn.addEventListener("click",()=>{
  store.set.calm=!store.set.calm;save();applySettings();
  els.recordsFold.open=!store.set.calm;
  if(view==="typing"){round.err=false;renderMeta();renderPrompt();setIdle();clearKeys(false);els.keyGuide.hidden=true;hideHint();}
});
els.shortBtn.addEventListener("click",()=>{
  store.set.short=!store.set.short;save();applySettings();
  // 長さの変更は次のラウンドから適用し、進行中の練習はそのまま続けられます。
  if(view==="typing") els.fbMain.textContent="練習の長さは次の開始時から変わります。";
});
els.romajiBtn.addEventListener("click",()=>{
  store.set.hideRomaji=!store.set.hideRomaji;save();applySettings();
  if(view==="typing"&&round) renderPrompt();
});
document.addEventListener("click",e=>{const b=e.target.closest("button");if(b&&e.detail>0&&b!==els.veil) setTimeout(()=>b.blur(),0);});

// ---------- round ----------
let round=null,engine=null,view="typing";
const TIP="焦らず一文字ずつ。迷ったらFとJの突起に指を戻しましょう。";

function setIdle(){
  els.fbMain.classList.remove("faded");
  els.fbMain.innerHTML='<span class="tag tip">ヒント</span>'+esc(round&&round.note?round.note:TIP);
}
// 今日の1セット：苦手キー集中 → いちばん長く練習していない文章コースを1文
const dayKey=(t)=>{const d=t?new Date(t):new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
function renderToday(){
  const today=dayKey(),wk=[];for(let i=0;i<7;i++) wk.push(dayKey(Date.now()-i*864e5));
  const n=store.setDays.filter(d=>wk.includes(d)).length;
  const done=store.setDays.includes(today);
  $("todayNote").textContent=(done?"今日の1セットは終わっています。":"苦手キー集中のあと、実務の文を1〜2文。3分前後で終わります。")+(n?"（直近7日で "+n+" 日）":"");
}
function startToday(){
  const work=COURSES.filter(c=>c.grp==="work").map(c=>c.id);
  const last=id=>{const i=store.hist.findIndex(r=>(r.c==="sent"?"biz":r.c)===id);return i<0?Infinity:i;};
  const pick=shuffle(work).sort((a,b)=>last(b)-last(a))[0];
  startRound("weak",{steps:["weak",pick],i:0});
}
function showPractice(){
  const card=document.querySelector(".practice");
  const r=card.getBoundingClientRect();
  if(r.top>=0&&r.bottom<=innerHeight) return;
  const calm=matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({block:"start",behavior:calm?"auto":"smooth"});
}
let booted=false;
function startRound(id,set){
  const c=COURSE[id]||COURSE.home;
  if(!set){store.set.course=c.id;save();}
  const g=c.gen();
  let items=g.items;
  if(store.set.short||set){
    const limit=shortLimit(c.id);
    items=items.slice(0,limit).map(it=>it.raw&&!it.en?rawItem(it.units.map(u=>u.k).join("").split(" ").slice(0,2).join(" ")):it);
  }
  round={course:c,set:set||null,reveal:-1,items:items,note:g.note||"",i:0,correct:0,miss:0,started:false,t0:0,pauseMs:0,pauseStart:0,pairs:{},keyMiss:{},err:false};
  view="typing";
  els.pausePanel.hidden=true;
  els.practiceActions.hidden=false;
  clearKeys(true);els.keyGuide.hidden=true;
  els.summary.hidden=true;els.prompt.hidden=false;els.fb.hidden=false;
  setIdle();
  renderCourses();
  loadItem();
  updVeil();
  if(booted) showPractice();
}
function loadItem(){
  engine=new Engine(round.items[round.i].units);
  round.err=false;round.reveal=-1;
  setIdle();
  renderPrompt();renderMeta();
  clearKeys(false);els.keyGuide.hidden=true;
  hideHint();
}
function acc(){const t=round.correct+round.miss;return t?Math.round(round.correct/t*1000)/10:null;}
function renderMeta(){
  const a=acc();
  const common=(round.set?"<span>今日の1セット "+(round.set.i+1)+" / "+round.set.steps.length+"</span>":"")+"<b>"+esc(round.course.name)+"</b><span>"+(round.i+1)+" / "+round.items.length+" 問</span>";
  els.meta.innerHTML=store.set.calm?common+"<span>正しく打てた "+round.correct+" 回</span>":common+"<span>正確率 "+(a==null?"—":a+"%")+"</span><span>ミス "+round.miss+"</span>";
}
function chSpan(c,cls){const sp=c===" ";return '<span class="ch '+cls+(sp?" sp":"")+'">'+(sp?"·":esc(c))+"</span>";}
function renderPrompt(){
  const it=round.items[round.i];
  const kanaOnly=!it.raw&&it.jp===it.kana;
  els.jp.hidden=!!it.raw||kanaOnly;
  els.jp.textContent=it.jp||"";
  els.kana.hidden=!!it.raw;
  // ローマ字を隠すときは、かなを大きく出し、ミスした文字だけローマ字を見せる。
  const hide=!!store.set.hideRomaji&&!it.raw;
  els.kana.classList.toggle("big",kanaOnly);
  els.kana.classList.toggle("mid",hide&&!kanaOnly);
  els.romaji.classList.toggle("big",!!it.raw);
  if(!it.raw){
    let kh="",open=null;
    engine.u.forEach((u,i)=>{
      if(u.ph!==open){if(open!==null) kh+="</span>";if(u.ph!=null) kh+='<span class="ph">';open=u.ph==null?null:u.ph;}
      kh+='<span class="'+(i<engine.i?"done":i===engine.i?"cur":"")+'">'+esc(u.k)+"</span>";
    });
    if(open!==null) kh+="</span>";
    els.kana.innerHTML=kh;
  }
  let h="",cur=false,open=null;
  engine.u.forEach((u,i)=>{
    let d="",t="";
    // ローマ字も文節（英文は単語）ごとにまとめ、途中で改行しない
    if(u.ph!==open&&!(hide&&!(i===engine.i&&round.reveal===i))){if(open!==null) h+="</span>";if(u.ph!=null) h+='<span class="ph">';open=u.ph==null?null:u.ph;}
    if(hide&&!(i===engine.i&&round.reveal===i)) return;
    if(u.show!=null){if(i<engine.i) d=u.show; else t=u.show;}
    else if(i<engine.i) d=engine.typed[i];
    else if(i===engine.i){d=engine.buf;t=engine.disp(i,engine.buf).slice(engine.buf.length);}
    else t=engine.disp(i,"");
    for(const c of d) h+=chSpan(c,"done");
    for(const c of t){h+=chSpan(c,cur?"":"cur"+(round.err?" err":""));cur=true;}
  });
  if(open!==null) h+="</span>";
  els.romaji.innerHTML=h;
}

// key visuals
function clearKeys(all){
  Object.values(K).forEach(n=>{n.classList.remove("is-next","is-miss");if(all){n.classList.remove("is-roundmiss");n.removeAttribute("data-n");}});
}
function flash(k){const n=K[k];if(!n) return;n.classList.remove("hit");void n.offsetWidth;n.classList.add("hit");}
function hideHint(){els.fbHint.textContent="";Object.values(K).forEach(n=>n.classList.remove("is-next"));}
function showHint(){
  if(view!=="typing"||!engine) return;
  const e=engine.expected();if(!e||!KEY[e]) return;
  if(K[e]) K[e].classList.add("is-next");
  els.fbHint.innerHTML='次は <kbd class="kk nx">'+esc(lab(e))+"</kbd>　"+FN[KEY[e].f]+"・"+ROWN[KEY[e].r];
}
$("revealBtn").addEventListener("click",()=>{if(view==="typing"){hideHint();showHint();}});
$("pauseBtn").addEventListener("click",pauseRound);
$("resumeBtn").addEventListener("click",resumeRound);
function pauseRound(){
  if(view!=="typing") return;
  round.pauseStart=round.started?performance.now():0;
  view="paused";hideHint();els.pausePanel.hidden=false;updVeil();
}
function resumeRound(){
  if(view!=="paused") return;
  if(round.pauseStart) round.pauseMs+=performance.now()-round.pauseStart;
  round.pauseStart=0;
  view="typing";els.pausePanel.hidden=true;updVeil();
}

function onChar(ch){
  if(view!=="typing"||!engine) return;
  if(!round.started){round.started=true;round.t0=performance.now();if(round.i===0&&engine.i===0) showPractice();}
  const exp=engine.expected();
  const ok=engine.feed(ch);
  flash(ch);
  if(ok){
    round.correct++;rec(ch,false);
    round.err=false;
    hideHint();clearKeys(false);
    els.keyGuide.hidden=true;
    if(store.set.calm) setIdle();
    els.fbMain.classList.add("faded");
    if(engine.done){
      round.i++;
      if(round.i%2===0) save();
      if(round.i>=round.items.length){finish();return;}
      loadItem();return;
    }
    renderPrompt();renderMeta();
  }else{
    round.miss++;rec(exp,true,ch);
    round.reveal=engine.i;
    const p=exp+">"+ch;round.pairs[p]=(round.pairs[p]||0)+1;
    round.keyMiss[exp]=(round.keyMiss[exp]||0)+1;
    round.err=!store.set.calm;
    hideHint();
    Object.values(K).forEach(n=>n.classList.remove("is-miss"));
    if(K[ch]&&ch!==exp) K[ch].classList.add("is-miss");
    if(K[exp]) K[exp].classList.add("is-next");
    els.keyGuide.innerHTML='<span><i class="swatch" aria-hidden="true"></i>押したキー <kbd class="kk">'+esc(lab(ch))+'</kbd></span>'+
      '<span><i class="swatch next" aria-hidden="true"></i>正しいキー <kbd class="kk">'+esc(lab(exp))+'</kbd></span>';
    els.keyGuide.hidden=false;
    const a=KEY[exp],b=KEY[ch];
    els.fbMain.classList.remove("faded");
    els.fbMain.innerHTML=store.set.calm
      ?'<span class="tag tip">確認</span>次は <kbd class="kk nx">'+esc(lab(exp))+'</kbd>'+(a?'（'+FN[a.f]+'）':'')+'。位置を確かめて、もう一度押してみましょう。'
      :'<span class="tag miss">ミス</span><kbd class="kk miss">'+esc(lab(ch))+"</kbd> を押しました"+(b?"（"+FN[b.f]+"）":"")+"　→　正しくは "+'<kbd class="kk ok">'+esc(lab(exp))+"</kbd>"+(a?"（"+FN[a.f]+"）":"")+'<span class="diag">'+esc(diag(exp,ch))+"</span>";
    renderPrompt();renderMeta();
  }
}

function finish(){
  view="summary";hideHint();clearKeys(true);els.keyGuide.hidden=true;
  els.practiceActions.hidden=true;
  const ms=Math.max(1,performance.now()-round.t0-round.pauseMs);
  const kpm=Math.round(round.correct/(ms/60000));
  const a=acc()||0;
  store.hist.unshift({t:Date.now(),c:round.course.id,acc:a,kpm:kpm,miss:round.miss});
  store.hist=store.hist.slice(0,30);
  const dk=dayKey(),dd=store.days[dk]||(store.days[dk]={r:0,c:0,m:0,ms:0});
  dd.r++;dd.c+=round.correct;dd.m+=round.miss;dd.ms+=Math.round(ms);
  Object.keys(store.days).sort().reverse().slice(60).forEach(k=>{delete store.days[k];});
  if(round.set&&round.set.i+1>=round.set.steps.length&&!store.setDays.includes(dk)){store.setDays.unshift(dk);store.setDays=store.setDays.slice(0,60);}
  renderToday();
  save();
  if(!store.set.calm) Object.keys(round.keyMiss).forEach(k=>{if(K[k]){K[k].classList.add("is-roundmiss");K[k].setAttribute("data-n",round.keyMiss[k]);}});
  const msg=store.set.calm
    ?"今日の分はこれで完了です。少しずつキーの場所を確かめていきましょう。ここで終えても、もう一回練習しても大丈夫です。"
    :a>=97?"とても正確です。この調子なら、次のコースに進んでもよさそうです。"
    :a>=90?"いい調子です。押し間違いを確認して、必要ならもう一度同じコースを試してみましょう。"
    :"まずは正確さを優先して、ゆっくり打ってみましょう。速さはあとから自然についてきます。";
  const pairs=Object.keys(round.pairs).sort((x,y)=>round.pairs[y]-round.pairs[x]).slice(0,3);
  const idx=COURSES.indexOf(round.course);const next=COURSES[(idx+1)%COURSES.length];
  const set=round.set,setNext=set&&set.i+1<set.steps.length?COURSE[set.steps[set.i+1]]:null;
  const pairList=pairs.length?'<ul class="plist">'+pairs.map(p=>{const s=p.split(">");return "<li><span><kbd class=\"kk ok\">"+esc(lab(s[0]))+'</kbd> のところで <kbd class="kk miss">'+esc(lab(s[1]))+"</kbd> を押した ×"+round.pairs[p]+'</span><span class="d">'+esc(shortDiag(s[0],s[1]))+"</span></li>";}).join("")+"</ul>":'<p class="sum-msg">押し間違いはありませんでした。</p>';
  const stats=store.set.calm
    ?'<div class="sum-nums calm"><div><span class="n">'+round.correct+'</span><span class="l">正しく打てた回数</span></div><div><span class="n">'+round.items.length+'</span><span class="l">終えたお題</span></div></div>'
    :'<div class="sum-nums"><div><span class="n">'+a+'<small>%</small></span><span class="l">正確率</span></div><div><span class="n">'+kpm+'</span><span class="l">打/分</span></div><div><span class="n">'+round.miss+'</span><span class="l">ミス</span></div></div>';
  const review=store.set.calm
    ?'<div class="sum-miss"><details><summary>押し間違いを振り返る（任意）</summary>'+pairList+'</details></div>'
    :'<div class="sum-miss"><h3>今回の押し間違い</h3>'+pairList+'</div>';
  const setMsg=setNext?"今日の1セットの "+(set.i+1)+" / "+set.steps.length+" が終わりました。続けて「"+setNext.name+"」を打ちます。":set?"今日の1セットはこれで完了です。お疲れさまでした。":"";
  const actions=setNext
    ?'<button class="btn primary" id="setNext">続ける：'+esc(setNext.name)+'</button><button class="btn" id="setStop">ここで終える</button>'
    :'<button class="btn primary" id="again">同じコースをもう一回</button><button class="btn" id="nextC">次のコース：'+esc(next.name)+'</button>';
  els.summary.innerHTML=stats+(setMsg?'<p class="sum-msg"><b>'+esc(setMsg)+'</b></p>':"")+'<p class="sum-msg">'+msg+'</p>'+review+
    '<div class="sum-actions">'+actions+'</div>';
  els.prompt.hidden=true;els.fb.hidden=true;els.summary.hidden=false;
  if(setNext){
    summaryGo=()=>startRound(setNext.id,{steps:set.steps,i:set.i+1});
    $("setNext").addEventListener("click",summaryGo);
    $("setStop").addEventListener("click",()=>startRound(round.course.id));
  }else{
    summaryGo=()=>startRound(round.course.id);
    $("again").addEventListener("click",summaryGo);
    $("nextC").addEventListener("click",()=>startRound(next.id));
  }
  updVeil();
  renderRecords();
}

// ---------- records ----------
let confirmReset=false,summaryGo=null;
function renderRecords(){
  Object.keys(KH).forEach(k=>{
    const n=KH[k],v=store.keys[k];
    n.classList.remove("heat","hot");n.style.removeProperty("--h");n.removeAttribute("title");
    if(v&&v.n>=3){
      const r=v.miss/v.n;
      if(v.miss>0){const h=Math.round(Math.min(1,r/0.25)*85);n.classList.add("heat");n.style.setProperty("--h",h+"%");if(h>=50) n.classList.add("hot");}
      n.title=lab(k)+"：ミス "+v.miss+" / "+v.n+"回";
    }
  });
  const w=weakKeys(3).slice(0,5);
  els.weakList.innerHTML=w.length?'<ul class="plist">'+w.map(x=>'<li><span><kbd class="kk">'+esc(lab(x.k))+"</kbd>　ミス率 "+Math.round(x.rate*100)+"%（"+x.miss+" / "+x.n+'回）</span><span class="d">'+FN[KEY[x.k].f]+"・"+ROWN[KEY[x.k].r]+"</span></li>").join("")+"</ul>":'<p class="empty">まだ記録がありません。練習すると、ここに間違えやすいキーが並びます。</p>';
  const ps=Object.keys(store.pairs).filter(p=>store.pairs[p]>=2).sort((a,b)=>store.pairs[b]-store.pairs[a]).slice(0,5);
  els.pairList.innerHTML=ps.length?'<ul class="plist">'+ps.map(p=>{const s=p.split(">");return '<li><span><kbd class="kk ok">'+esc(lab(s[0]))+'</kbd> のところで <kbd class="kk miss">'+esc(lab(s[1]))+"</kbd> ×"+store.pairs[p]+'</span><span class="d">'+esc(shortDiag(s[0],s[1]))+"</span></li>";}).join("")+"</ul>":'<p class="empty">同じ押し間違いが2回以上あると、ここに表示されます。</p>';
  if(store.hist.length){
    els.hist.innerHTML='<table><thead><tr><th>日時</th><th>コース</th><th class="num">正確率</th><th class="num">打/分</th><th class="num">ミス</th></tr></thead><tbody>'+store.hist.slice(0,10).map(r=>{const d=new Date(r.t);const pad=n=>String(n).padStart(2,"0");return "<tr><td>"+(d.getMonth()+1)+"/"+d.getDate()+" "+pad(d.getHours())+":"+pad(d.getMinutes())+"</td><td>"+esc((COURSE[r.c]||{}).name||r.c)+'</td><td class="num">'+r.acc+'%</td><td class="num">'+r.kpm+'</td><td class="num">'+r.miss+"</td></tr>";}).join("")+"</tbody></table>";
  }else els.hist.innerHTML='<p class="empty">1回分の練習を終えると、ここに正確率と速さが記録されます。</p>';
  const dks=Object.keys(store.days).sort().reverse().slice(0,14);
  $("days").innerHTML=dks.length?'<table><thead><tr><th>日付</th><th class="num">回数</th><th class="num">正確率</th><th class="num">打/分</th></tr></thead><tbody>'+dks.map(k=>{const d=store.days[k],tot=d.c+d.m;const p=k.split("-");return "<tr><td>"+(+p[1])+"/"+(+p[2])+'</td><td class="num">'+d.r+'</td><td class="num">'+(tot?Math.round(d.c/tot*100):0)+'%</td><td class="num">'+Math.round(d.c/(Math.max(1,d.ms)/60000))+"</td></tr>";}).join("")+"</tbody></table>":'<p class="empty">練習した日ごとに、正確率と速さがここにまとまります。</p>';
  renderReset();
}
function renderReset(){
  const has=store.hist.length||store.real.length||Object.keys(store.keys).length;
  if(!has){els.reset.innerHTML="";return;}
  els.reset.innerHTML=confirmReset?'<span>記録をすべて消しますか？</span><button class="btn danger" id="rsYes">消す</button><button class="btn" id="rsNo">やめる</button>':'<button class="btn" id="rsAsk">記録を消す</button>';
  if(confirmReset){
    $("rsYes").addEventListener("click",()=>{store.keys={};store.pairs={};store.hist=[];store.real=[];store.days={};store.setDays=[];save();renderReal();renderToday();confirmReset=false;renderRecords();});
    $("rsNo").addEventListener("click",()=>{confirmReset=false;renderReset();});
  }else $("rsAsk").addEventListener("click",()=>{confirmReset=true;renderReset();});
}

// ---------- input ----------
const CODE={Minus:"-",Comma:",",Period:".",Slash:"/",Semicolon:";",Space:" "};
function codeToChar(e){
  const c=e.code||"";
  if(/^Key[A-Z]$/.test(c)) return c.slice(3).toLowerCase();
  if(/^Digit[0-9]$/.test(c)) return c.slice(5);
  if(CODE[c]) return CODE[c];
  if(e.key&&e.key.length===1){const k=e.key.toLowerCase();if(KEY[k]) return k;}
  return null;
}
document.addEventListener("keydown",e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(e.target instanceof HTMLElement&&e.target.closest("input,textarea,select")) return;
  if(view==="summary"){
    if((e.code==="Space"||e.code==="Enter")&&!(e.target instanceof HTMLElement&&e.target.closest("button,summary"))){e.preventDefault();(summaryGo||(()=>startRound(round.course.id)))();}
    return;
  }
  if(view==="paused"){
    if(codeToChar(e)!==null) e.preventDefault();
    return;
  }
  if(e.code==="Escape"){startRound(round.course.id);return;}
  const ch=codeToChar(e);
  if(ch==null) return;
  e.preventDefault();
  if(e.repeat) return;
  onChar(ch);
});

// ---------- 実戦チェック（IMEで変換まで打つ） ----------
const RSRC={biz:BIZ_ALL.map(p=>p[0]),trade:TRADE.map(p=>p[0]),lab:LAB.map(p=>p[0]),en:EN};
RSRC.ja=RSRC.biz.concat(RSRC.trade,RSRC.lab);
const RNAME={ja:"日本語",biz:"ビジネスメール",trade:"貿易実務",lab:"研究",en:"英語"};
const real={target:"",t0:0,bs:0,done:false};
const rIn=$("realInput"),rRes=$("realResult");
const isEn=s=>!/[\u3040-\u30ff\u4e00-\u9fff]/.test(s);
const norm=s=>{s=s.normalize("NFKC");return isEn(real.target)?s.replace(/\s+/g," ").trim():s.replace(/\s+/g,"");};
function realNew(){
  const pool=RSRC[$("realSrc").value]||RSRC.ja;
  let t=pool[rnd(pool.length)];
  if(pool.length>1) while(t===real.target) t=pool[rnd(pool.length)];
  real.target=t;real.t0=0;real.bs=0;real.done=false;
  $("realTarget").textContent=t;
  rIn.value="";rIn.disabled=false;rRes.innerHTML="";
}
function realFinish(){
  const ms=Math.max(1,performance.now()-real.t0);
  const len=norm(real.target).length;
  const cpm=Math.round(len/(ms/60000));
  real.done=true;rIn.disabled=true;
  $("realTarget").textContent=real.target;
  store.real.unshift({t:Date.now(),src:$("realSrc").value,len:len,ms:Math.round(ms),cpm:cpm,bs:real.bs});
  store.real=store.real.slice(0,20);save();
  rRes.innerHTML='<p class="real-res">完了しました。'+(ms/1000).toFixed(1)+' 秒、1分あたり '+cpm+(isEn(real.target)?' 文字':' 字')+'、BackSpace '+real.bs+' 回でした。「別の文にする」で次に進めます。</p>';
  renderReal();renderReset();
}
function realCheck(fromBtn){
  if(real.done||!real.t0) return;
  const a=norm(rIn.value),b=norm(real.target);
  if(a===b){realFinish();return;}
  if(!fromBtn) return;
  let i=0;while(i<a.length&&i<b.length&&a[i]===b[i]) i++;
  const t=real.target.normalize("NFKC");
  $("realTarget").innerHTML=esc(t.slice(0,i))+"<mark>"+esc(t.slice(i))+"</mark>";
  rRes.innerHTML='<p class="real-res">印を付けたところから、お題と違っています。直してからもう一度「できた」を押してください（時間は測り続けています）。</p>';
}
rIn.addEventListener("input",e=>{
  if(!real.t0&&rIn.value) real.t0=performance.now();
  if(!e.isComposing) realCheck(false);
});
rIn.addEventListener("compositionend",()=>setTimeout(()=>realCheck(false),0));
rIn.addEventListener("keydown",e=>{
  if(e.key==="Backspace"&&real.t0&&!real.done) real.bs++;
  // 変換中でない Enter は「できた」と同じ扱い（改行は入れない）
  if(e.key==="Enter"&&!e.isComposing&&e.keyCode!==229){e.preventDefault();realCheck(true);}
});
$("realDone").addEventListener("click",()=>realCheck(true));
$("realNew").addEventListener("click",()=>{realNew();rIn.focus();});
$("realSrc").addEventListener("change",()=>{realNew();});
function renderReal(){
  const el=$("realHist");
  if(!store.real.length){el.innerHTML='<p class="empty">まだ記録がありません。1文打ち終えると、ここに速さが残ります。</p>';return;}
  const pad=n=>String(n).padStart(2,"0");
  el.innerHTML='<table><thead><tr><th>日時</th><th>出題</th><th class="num">1分あたり</th><th class="num">秒</th><th class="num">BackSpace</th></tr></thead><tbody>'+
    store.real.slice(0,8).map(r=>{const d=new Date(r.t);return "<tr><td>"+(d.getMonth()+1)+"/"+d.getDate()+" "+pad(d.getHours())+":"+pad(d.getMinutes())+"</td><td>"+esc(RNAME[r.src]||r.src)+'</td><td class="num">'+r.cpm+'</td><td class="num">'+(r.ms/1000).toFixed(1)+'</td><td class="num">'+r.bs+"</td></tr>";}).join("")+"</tbody></table>";
}
realNew();renderReal();renderToday();

// focus veil + touch notice
const isTouch=window.matchMedia&&window.matchMedia("(hover: none) and (pointer: coarse)").matches;
if(isTouch) $("touchNote").hidden=false;
function updVeil(){els.veil.hidden=isTouch||view!=="typing"||document.hasFocus();}
window.addEventListener("focus",updVeil);
window.addEventListener("blur",updVeil);
els.veil.addEventListener("click",()=>{window.focus();els.veil.hidden=true;});

// boot
applySettings();
els.recordsFold.open=!store.set.calm;
startRound(store.set.course);booted=true;
renderRecords();
setTimeout(updVeil,300);

// test hook (pure functions only)
window.__mienai={tokenize:tokenize,Engine:Engine,KEY:KEY,BIZ:BIZ_ALL,TRADE:TRADE,LAB:LAB,EN:EN,enItem:enItem,COURSES:COURSES,expected:()=>view==="typing"&&engine?engine.expected():null};
})();
