import fs from 'node:fs'
import crypto from 'node:crypto'
import {Chess} from 'chess.js'
const path='public/book/puzzles.json'
const book=JSON.parse(fs.readFileSync(path,'utf8'))
const source=fs.readFileSync('tools/book/upstream/problems.json')
const upstream=JSON.parse(source).problems
if(upstream.length!==4462||new Set(upstream.map(p=>p.problemid)).size!==4462)throw Error('Unexpected upstream coverage')
const report={repository:'https://github.com/denialromeo/4462-chess-problems',sha256:crypto.createHash('sha256').update(source).digest('hex'),imported:0,differentDiagrams:[],failures:[]}
for(const p of upstream){
 const n=p.problemid,old=book.puzzles[n-1]
 if(!old||old.number!==n||n<1||n>4462)throw Error('Unexpected problem number')
 try{
  const game=new Chess(p.fen), moves=[],san=[]
  for(const raw of p.moves.split(';')){
   const s=raw.replace(/[-=\s]/g,'').toLowerCase()
   if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(s))throw Error(`Unrecognized move ${raw}`)
   const m=game.move({from:s.slice(0,2),to:s.slice(2,4),promotion:s[4]})
   if(!m)throw Error(`Illegal move ${raw}`)
   moves.push(m.from+m.to+(m.promotion??''));san.push(m.san)
  }
  if(!game.isCheckmate())throw Error('Line does not end in checkmate')
  const pdfFen=old.pdfFen??old.fen, pdfSolution=old.pdfSolution??old.solution
  const differs=pdfFen.split(' ')[0]!==p.fen.split(' ')[0]
  if(differs)report.differentDiagrams.push(n)
  book.puzzles[n-1]={...old,fen:p.fen,moves,status:'legal-line',endsInMate:true,pdfFen,pdfSolution,pdfDiffers:differs,
   source:'polgar-upstream',sourceUrl:report.repository,upstreamType:p.type,solution:san.join(' '),validationNote:'Upstream main line replayed to checkmate'}
  report.imported++
 }catch(e){report.failures.push({number:n,error:e.message})}
}
fs.writeFileSync('tools/book/upstream-report.json',JSON.stringify(report,null,2))
// Preserve PDF-derived data before replacing the active course.
if(!fs.existsSync('tools/book/pdf-puzzles.json'))fs.copyFileSync(path,'tools/book/pdf-puzzles.json')
fs.writeFileSync(path,JSON.stringify(book))
console.log(JSON.stringify(report))
