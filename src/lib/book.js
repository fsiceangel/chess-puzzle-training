import { exportAll, importAll } from './storage.js'
export const bookChapters=[
  {title:'Mate in One',start:1,end:306},
  {title:'Mate in Two',start:307,end:3718},
  {title:'Mate in Three',start:3719,end:4462},
  {title:'600 Miniature Games',start:4463,end:5062},
  {title:'Simple Endgames · draws and wins',start:5063,end:5206},
  {title:'Polgár Sisters’ Combinations',start:5207,end:5334},
]
let request
export const BOOK_SET_SIZE=10
export const bookParts=bookChapters.map((c,i)=>({...c,id:`book-${i+1}`,book:true,setSize:BOOK_SET_SIZE,number:['I','II','III','IV','V','VI'][i],accent:['teal','coral','violet','amber','green','blue'][i],total:c.end-c.start+1,subtitle:`Problems ${c.start}–${c.end}`,blurb:'Follow the original problem order, ten at a time.',tips:['Take your time and look for forcing moves.','Use Hint if you get stuck. Show me reveals the solution.']}))
export function bookSetFor(number){const part=bookParts.find(p=>number>=p.start&&number<=p.end);return part?{part,index:Math.floor((number-part.start)/BOOK_SET_SIZE)}:null}
export function bookSetSlice(items,part,index){const start=part.start-1+index*BOOK_SET_SIZE;return items.slice(start,Math.min(start+BOOK_SET_SIZE,part.end))}
export function loadBook(){
  return request??=(fetch(`${import.meta.env.BASE_URL}book/puzzles.json?v=upstream1`).then(r=>{if(!r.ok)throw Error('Could not load the book');return r.json()}).then(d=>d.puzzles).catch(e=>{request=null;throw e}))
}
export function migrateAlpha(){
  const data=JSON.parse(exportAll())
  if(data.alphaArchive)return data.alphaArchive
  const alpha={createdAt:Date.now(),sets:data.sets,runs:data.runs,review:data.review,parts:data.parts,days:data.days}
  // Preserve an independent original copy before introducing the new course.
  // If storage is full, leave the original save untouched and report failure.
  if(!localStorage.getItem('training5334.before-book.v1'))localStorage.setItem('training5334.before-book.v1',JSON.stringify(data))
  importAll(JSON.stringify({...data,alphaArchive:alpha}))
  if(!JSON.parse(exportAll()).alphaArchive)throw Error('Not enough browser storage for the archive')
  return alpha
}
export function bookDone(number){return Boolean(JSON.parse(exportAll()).bookProgress?.[number])}
