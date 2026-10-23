'use strict';
// Feature pack: authenticated tasks + search/filter + CSV/JSON export + offline domain AI.
// Never calls a provider: AI endpoints always return the labelled deterministic fallback.
delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
const express=require('express');

function toSections(r){const F=[['title','Title'],['description','Description'],['status','Status'],['priority','Priority'],['completed','Completed'],['estimateMinutes','Estimate (minutes)'],['notes','Notes'],['dueDate','Due date']];return F.map(([k,l])=>{const v=r[k]===undefined?null:r[k];return{key:k,label:l,value:v,displayText:v===null||v===''?"(empty)":v===false?"No":v===true?"Yes":String(v)};});}
function createStore(){const byUser=new Map();let seq=0;return{
 create(uid,data){if(!data||!String(data.title||'').trim()){const e=new Error('title_required');e.status=400;throw e;}const t={id:String(++seq),userId:String(uid),title:String(data.title).trim(),description:data.description||'',status:data.status||'todo',priority:data.priority||'medium',completed:data.completed===true,estimateMinutes:Number.isFinite(+data.estimateMinutes)?+data.estimateMinutes:0,notes:data.notes||'',dueDate:data.dueDate||'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};if(!byUser.has(String(uid)))byUser.set(String(uid),[]);byUser.get(String(uid)).push(t);return t;},
 list(uid,q={}){let rows=[...(byUser.get(String(uid))||[])];const s=String(q.search||'').toLowerCase();if(s)rows=rows.filter(t=>(t.title+' '+t.description+' '+t.notes).toLowerCase().includes(s));if(q.status)rows=rows.filter(t=>t.status===q.status);if(q.priority)rows=rows.filter(t=>t.priority===q.priority);return rows;},
 update(uid,id,data){const rows=byUser.get(String(uid))||[];const t=rows.find(x=>x.id===String(id));if(!t)return null;for(const k of ['title','description','status','priority','notes','dueDate'])if(data[k]!==undefined)t[k]=data[k];if(data.completed!==undefined)t.completed=data.completed===true;if(data.estimateMinutes!==undefined)t.estimateMinutes=+data.estimateMinutes||0;t.updatedAt=new Date().toISOString();return t;},
 get(uid,id){return (byUser.get(String(uid))||[]).find(x=>x.id===String(id))||null;}};}
function csvEscape(v){const s=v===null||v===undefined?'':String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function toCsv(rows){const cols=['id','title','description','status','priority','completed','estimateMinutes','notes','dueDate','createdAt'];return [cols.join(','),...rows.map(r=>cols.map(c=>csvEscape(r[c])).join(','))].join('\n')+'\n';}
const FALLBACK={aiGenerated:false,source:'deterministic-fallback',label:'Deterministic fallback (no AI provider called)'};

function words(t){return String(t||'').split(/\s+/).filter(Boolean);}
function headlineScorer(tasks,input={}){const text=String(input.text||input.headline||tasks[0]?.title||'');const score=Math.min(100,(words(text).length>=3?30:words(text).length*10)+( /\d/.test(text)?20:0)+(/buy|get|try|join|shop/i.test(text)?25:0)+(text.length<=60?25:10));return{...FALLBACK,feature:'headline-scorer',headline:text,score,charCount:text.length,hasNumber:/\d/.test(text),sections:[{key:'score',label:'Headline score',value:score,displayText:String(score)},{key:'hasNumber',label:'Contains a number',value:/\d/.test(text),displayText:/\d/.test(text)?'Yes':'No'}]};}
function ctaSuggester(tasks){const open=tasks.filter(t=>!t.completed);return{...FALLBACK,feature:'cta-suggester',openTasks:open.length,suggestions:open.slice(0,3).map(t=>'Add a clear call to action to: '+t.title),sections:[{key:'openTasks',label:'Open tasks',value:open.length,displayText:String(open.length)}]};}
function copySummary(tasks){const done=tasks.filter(t=>t.completed).length;const avg=tasks.length?Math.round(tasks.reduce((a,t)=>a+t.title.length,0)/tasks.length):0;return{...FALLBACK,feature:'copy-summary',total:tasks.length,completed:done,avgTitleLength:avg,completionRate:tasks.length?Math.round(done/tasks.length*100):0,sections:[{key:'avgTitleLength',label:'Average title length',value:avg,displayText:String(avg)}]};}

function createRouter({authenticate,store=createStore()}={}){const router=express.Router();const uid=r=>String(r.user?.id??r.userId??r.user?.userId??'');const guard=(req,res,next)=>{if(!uid(req))return res.status(401).json({error:'authentication required'});next();};const middle=authenticate?[authenticate,guard]:[guard];
router.get('/export',...middle,(req,res)=>{const rows=store.list(uid(req),req.query);if(String(req.query.format||'json').toLowerCase()==='csv'){res.setHeader('Content-Type','text/csv');res.setHeader('Content-Disposition','attachment; filename="tasks.csv"');return res.send(toCsv(rows));}return res.json({items:rows,total:rows.length,exportedAt:new Date().toISOString()});});
router.get('/',...middle,(req,res)=>{const rows=store.list(uid(req),req.query);res.json({items:rows,tasks:rows,total:rows.length});});
router.post('/',...middle,(req,res)=>{try{res.status(201).json(store.create(uid(req),req.body||{}));}catch(e){res.status(e.status||400).json({error:e.message});}});
router.get('/:id/view',...middle,(req,res)=>{const t=store.get(uid(req),req.params.id);if(!t)return res.status(404).json({error:'not found'});res.json({id:t.id,title:t.title,sections:toSections(t)});});
router.put('/:id',...middle,(req,res)=>{const t=store.update(uid(req),req.params.id,req.body||{});return t?res.json(t):res.status(404).json({error:'not found'});});
router.patch('/:id',...middle,(req,res)=>{const t=store.update(uid(req),req.params.id,req.body||{});return t?res.json(t):res.status(404).json({error:'not found'});});
router.post('/ai/headline-scorer',...middle,(req,res)=>res.json(headlineScorer(store.list(uid(req)),req.body||{})));
router.post('/ai/cta-suggester',...middle,(req,res)=>res.json(ctaSuggester(store.list(uid(req)))));
router.post('/ai/copy-summary',...middle,(req,res)=>res.json(copySummary(store.list(uid(req)))));
return router;}
module.exports={createRouter,createStore,toCsv,toSections,FALLBACK};
