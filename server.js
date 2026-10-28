const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const PUBLIC = path.join(__dirname, 'public');

const MIME = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml'};
function json(res, status, obj) { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}); res.end(JSON.stringify(obj)); }
function body(req) { return new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>1e6){reject(new Error('İstek çok büyük'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch(e){reject(new Error('Geçersiz JSON'));}});req.on('error',reject);}); }
const SYSTEM = `You are TMDDI Language Coach, a patient, friendly multilingual language tutor. Supported target languages include Turkmen, Turkish, Arabic, Persian, Korean, Chinese, Japanese, English, French, Russian, Urdu, German, Spanish, Italian, Greek, and Hindi. The learner's interface language is Turkish unless they ask otherwise. The target language and level are supplied by the user. Reply naturally in the target language at an appropriate level, while explaining corrections in Turkish. Gently identify important errors in the user's latest message. Do not interrupt the conversation with too many corrections: prioritize up to two useful corrections. Always provide: a conversational reply; if there is an error, original phrase, corrected phrase, a brief Turkish explanation, and one new example. If no meaningful error exists, do not invent one; ask a useful follow-up question. Return ONLY valid JSON with this shape: {"reply":"your natural conversational response","correction":{"original":"...","corrected":"...","explanation":"...","example":"..."}}. If no correction is needed, set correction to null.`;
async function handleChat(req,res){
 try {
  const data=await body(req);
  if(!data.message || typeof data.message!=='string') return json(res,400,{error:'message alanı gerekli.'});
  const model=(typeof data.model==='string'&&data.model.trim())||DEFAULT_MODEL;
  const history=Array.isArray(data.history)?data.history.slice(-12).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,4000)})):[];
  const messages=[{role:'system',content:SYSTEM+`\nTarget language: ${String(data.language||'English').slice(0,40)}.\nLearner level: ${String(data.level||'Intermediate').slice(0,40)}.`},...history,{role:'user',content:data.message.slice(0,4000)}];
  const upstream=await fetch(`${OLLAMA_URL}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,stream:false,format:'json',options:{temperature:0.45}})});
  if(!upstream.ok){const detail=await upstream.text();return json(res,502,{error:`Ollama yanıt vermedi (${upstream.status}). Modelin indirildiğini ve Ollama'nın çalıştığını kontrol et. ${detail.slice(0,250)}`});}
  const raw=await upstream.json(); let parsed;
  try{parsed=JSON.parse(raw.message?.content||'{}')}catch{parsed={reply:raw.message?.content||'Yanıt çözümlenemedi.',correction:null}}
  return json(res,200,{reply:parsed.reply||'Biraz daha anlatır mısın?',correction:parsed.correction||null});
 } catch(e) { return json(res,500,{error:e.message||'Sunucu hatası'}); }
}
const server=http.createServer(async(req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});return res.end();}
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/health'){
  let ready=false;try{const r=await fetch(`${OLLAMA_URL}/api/tags`,{signal:AbortSignal.timeout(1200)});ready=r.ok;}catch{}
  return json(res,200,{ok:true,aiReady:ready,model:DEFAULT_MODEL,provider:'Ollama local'});
 }
 if(pathname==='/api/chat'&&req.method==='POST') return handleChat(req,res);
 const safePath=pathname==='/'?'/index.html':pathname;
 const file=path.normalize(path.join(PUBLIC,safePath));
 if(!file.startsWith(PUBLIC)) {res.writeHead(403);return res.end('Forbidden');}
 fs.readFile(file,(err,content)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found');}res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(content);});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`TMDDI Language Coach: http://localhost:${PORT}`));
