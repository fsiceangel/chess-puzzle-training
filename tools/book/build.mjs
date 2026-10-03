import fs from 'node:fs'
import { Chess } from 'chess.js'
const raw=JSON.parse(fs.readFileSync('tmp/pdfs/book-raw.json','utf8'))
const previous=process.argv.includes('--retry')?JSON.parse(fs.readFileSync('public/book/puzzles.json','utf8')).puzzles:null
const norm=s=>s.replace(/[+#?!]/g,'').replace('=','')
function tokens(text) {
  let depth=0, brackets=0, out=''
  text=text.split('➔')[0].replace(/\(Di-?\s*agram\)/gi,' @ ')
  for(const c of text) {
    if(c==='('){depth++;continue} if(c===')'){depth--;continue}
    if(c==='['){brackets++;continue} if(c===']'){brackets--;continue}
    if(!depth&&!brackets) out+=c
  }
  out=out.replace(/\s+/g,'').replace(/X/g,'x').replace(/m/g,'#').replace(/[–−]/g,'-')
  return out.match(/@|\d+\.(?:\.\.)?|O-O(?:-O)?[+#]?|[KQRBN](?:[a-h]|[1-8])?x?[a-h][1-8][+#]?|[a-h](?:x[a-h])?(?:[18](?:=?[QRBN])?|[2-7])[+#]?/g)??[]
}
function move(g,token) {
  const choices=g.moves({verbose:true}).filter(m=>norm(m.san)===norm(token))
  if(choices.length!==1) throw Error(`Cannot play ${token}`)
  const m=choices[0]; g.move(m); return m.from+m.to+(m.promotion??'')
}
const issues=[]
const items=raw.map(r=>{
  if(previous?.[r.number-1]?.status==='legal-line')return previous[r.number-1]
  const ts=tokens(r.solution), first=ts.find(t=>/^\d+\./.test(t)), turn=first?.endsWith('...')?'b':'w'
  const item={id:`book-${r.number}`,number:r.number,page:r.page,solutionPage:r.solutionPage,source:'polgar-user-pdf',intro:false,solution:r.solution,fen:`${r.placement} ${turn} - - 0 1`,moves:[],status:'reference'}
  let g
  try {
    if(r.number>=4463&&r.number<=5062) {
      g=new Chess(); let found=false
      for(const t of ts) {
        if(g.fen().split(' ')[0]===r.placement && !found){found=true;item.fen=g.fen()}
        if(t==='@'||/^\d+\./.test(t))continue
        const u=move(g,t); if(found)item.moves.push(u)
      }
      if(!found) throw Error('Game does not reach printed diagram')
    } else {
      if(ts.some(t=>t.startsWith('O-O'))) {
        const test=new Chess(item.fen), rights=[]
        for(const [king,rook,flag] of [['e1','h1','K'],['e1','a1','Q'],['e8','h8','k'],['e8','a8','q']]) if(test.get(king)?.type==='k'&&test.get(rook)?.type==='r')rights.push(flag)
        item.fen=item.fen.replace(' - - ',` ${rights.join('')||'-'} - `)
      }
      g=new Chess(item.fen)
      for(const t of ts)if(t!=='@'&&!/^\d+\./.test(t))item.moves.push(move(g,t))
    }
    if(!item.moves.length)throw Error('No moves')
    item.status='legal-line'
    item.endsInMate=g.isCheckmate()
  } catch(e) {
    item.moves=[]
    try {
      let tail=ts
      if(r.number>=4463&&r.number<=5062){
        if(!ts.includes('@'))throw e
        tail=ts.slice(ts.indexOf('@')+1)
      }else if(![306,1486].includes(r.number))throw e
      const first=tail.find(t=>/^\d+\./.test(t))
      item.fen=`${r.placement} ${first?.endsWith('...')?'b':'w'} - - 0 1`
      if(r.number===306)item.fen=item.fen.replace(' - - ',' - b6 ')
      if(r.number===1486)item.fen=item.fen.replace(' - - ',' - g6 ')
      g=new Chess(item.fen)
      const candidate=[]
      for(const t of tail)if(t!=='@'&&!/^\d+\./.test(t))candidate.push(move(g,t))
      if(!candidate.length)throw Error('No continuation after diagram')
      item.moves=candidate;item.status='legal-line';item.endsInMate=g.isCheckmate()
      item.validationNote=r.number<4463?'En-passant square required by printed key move':'Validated from printed diagram; opening transcription does not replay'
    }catch(failure){item.moves=[];issues.push({number:r.number,error:failure.message})}
  }
  return item
})
fs.mkdirSync('public/book',{recursive:true})
fs.writeFileSync('public/book/puzzles.json',JSON.stringify({title:'Chess: 5334 Problems, Combinations and Games',sourceFile:'23.pdf',puzzles:items}))
fs.writeFileSync('tools/book/validation-report.json',JSON.stringify({total:items.length,legalLines:items.filter(p=>p.status==='legal-line').length,issues},null,2))
console.log('Total',items.length,'Legal lines',items.filter(p=>p.status==='legal-line').length,'Issues',issues.length,issues.slice(0,12))
