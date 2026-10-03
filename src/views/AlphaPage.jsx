import { useEffect, useState } from 'react'
import { migrateAlpha } from '../lib/book.js'
import { loadPart } from '../lib/puzzles.js'
import { parts } from '../data/parts.js'
import PuzzleRunner from './PuzzleRunner.jsx'

export function AlphaPuzzle({partId,id}){
  const [puzzle,setPuzzle]=useState(null),[error,setError]=useState('')
  useEffect(()=>{let active=true;loadPart(partId).then(ps=>{if(active){const p=ps.find(x=>x.id===id);if(p)setPuzzle(p);else setError('Previous puzzle not found.')}}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[partId,id])
  if(error)return <main className="page">{error}<a href="#/alpha">Back to Alpha</a></main>
  if(!puzzle)return <main className="page">Loading Alpha puzzle…</main>
  return <PuzzleRunner key={id} puzzles={[puzzle]} partId={partId} title={`Alpha · ${id}`} backHref="#/alpha"/>
}

export default function AlphaPage(){
  const [archive,setArchive]=useState(null),[error,setError]=useState(''),[items,setItems]=useState([])
  useEffect(()=>{let active=true
    try{
      const a=migrateAlpha();setArchive(a)
      Promise.all(parts.map(async part=>{
        const puzzles=await loadPart(part.id),ids=new Set(a.review.filter(r=>r.partId===part.id).map(r=>r.id))
        for(const run of Object.values(a.runs))for(const t of run.tally??[])ids.add(t.id)
        for(const [key,result] of Object.entries(a.sets))if(key.startsWith(part.id+'/')&&result.done>=result.total){const i=Number(key.split('/')[1]);for(const p of puzzles.slice(i*12,i*12+12))ids.add(p.id)}
        return puzzles.filter(p=>ids.has(p.id)).map(p=>({...p,partId:part.id}))
      })).then(rows=>{if(active)setItems(rows.flat())}).catch(e=>{if(active)setError(e.message)})
    }catch(e){setError(`Could not safely archive: ${e.message}`)}
    return()=>{active=false}
  },[])
  return <main className="page"><a href="#/">← The course</a><h1>Alpha · Previous practice</h1>{error&&<p role="alert">{error}</p>}
    <p>Your previous scores and practice history are preserved here. Only problems identifiable from saved records are listed.</p>
    <h2>Saved set results</h2>{archive&&Object.entries(archive.sets).map(([id,s])=><p key={id}>{id} · Completed {s.done}/{s.total} · Clean {s.clean}</p>)}
    <h2>Recorded problems · {items.length}</h2><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{items.map(p=><a className="btn btn-ghost" key={p.id} href={`#/alpha/puzzle/${p.partId}/${p.id}`}>{p.id}</a>)}</div>
    {archive&&<p>Your original save is backed up. Coins, companions and room layouts are preserved.</p>}
  </main>
}
