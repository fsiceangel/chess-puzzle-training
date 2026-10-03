import { bookParts, bookSetFor, bookSetSlice, loadBook } from '../lib/book.js'
import { nextSetIndex, partProgress } from '../lib/storage.js'
import { useAsync } from '../lib/useAsync.js'
import { Bar, Spinner, ErrorNote, useProgressTick } from '../components/ui.jsx'
import PuzzleRunner from './PuzzleRunner.jsx'

export function BookCourse(){
  useProgressTick()
  const resume=bookParts.find(p=>partProgress(p.id,Math.ceil(p.total/10)).setsDone<Math.ceil(p.total/10))??bookParts[0]
  const next=nextSetIndex(resume.id,Math.ceil(resume.total/10))
  return <section>
    <div className="quick-row"><a className={`quick accent-${resume.accent}`} href={`#/part/${resume.id}/set/${next}`}><span className="quick-label">Keep going</span><span className="quick-title">{resume.title} · Set {next+1}</span></a><a className="quick accent-violet" href="#/alpha"><span className="quick-label">Alpha</span><span className="quick-title">Previous practice</span></a></div>
    <h2 className="section-head">The course</h2>
    <div className="part-grid">{bookParts.map(p=>{const sets=Math.ceil(p.total/10),progress=partProgress(p.id,sets);return <a className={`part-card accent-${p.accent}`} href={`#/part/${p.id}`} key={p.id}><div className="part-num">{p.number}</div><div className="part-body"><h3>{p.title}</h3><p className="part-sub">{p.subtitle}</p><p className="part-meta">{p.total.toLocaleString()} puzzles · {sets} sets · 10 per set</p><Bar pct={progress.setsDone/sets*100} label={`${progress.setsDone} of ${sets} sets done`}/></div></a>})}</div>
  </section>
}
export default function BookPage({number,part:givenPart,index:givenIndex}){
  const selection=givenPart?{part:givenPart,index:givenIndex}:bookSetFor(number)
  const {data,loading,error}=useAsync(loadBook,'book-course')
  if(loading)return <main className="page page-narrow"><Spinner/></main>
  if(error||!selection)return <main className="page page-narrow"><ErrorNote error={error??'Problem not found.'}/></main>
  const {part,index}=selection
  const batch=bookSetSlice(data,part,index),puzzles=batch.filter(p=>p.status==='legal-line')
  if(!puzzles.length)return <main className="page"><ErrorNote error="This set is awaiting verification."/><a href={`#/part/${part.id}`}>Back to sets</a></main>
  return <PuzzleRunner key={`${part.id}/${index}`} puzzles={puzzles} partId={part.id} partAccent={part.accent} title={`Set ${index+1}`} subtitle={`Part ${part.number} · ${part.title}`} backHref={`#/part/${part.id}`} setIndex={batch.length===puzzles.length?index:undefined} runKey={`${part.id}/${index}`} notice={batch.length!==puzzles.length?`${batch.length-puzzles.length} problem in this set is awaiting verification and has been left out. This set will not receive a completion score yet.`:undefined} onNextSet={part.start+(index+1)*10<=part.end?()=>{location.hash=`/part/${part.id}/set/${index+1}`}:undefined}/>
}
