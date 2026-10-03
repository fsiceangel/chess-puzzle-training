import { useEffect, useState } from 'react'
import { partById } from './data/parts.js'
import { Logo, Chart } from './components/icons.jsx'
import { todayStats, getSettings, getCoins } from './lib/storage.js'
import { useProgressTick } from './components/ui.jsx'
import Home from './views/Home.jsx'
import PartPage from './views/PartPage.jsx'
import SetPage from './views/SetPage.jsx'
import DailyPage from './views/DailyPage.jsx'
import ReviewPage from './views/ReviewPage.jsx'
import ProgressPage, { Backup } from './views/ProgressPage.jsx'
import ShopPage from './views/ShopPage.jsx'
import BookPage from './views/BookPage.jsx'
import AlphaPage, { AlphaPuzzle } from './views/AlphaPage.jsx'
import { migrateAlpha, bookParts } from './lib/book.js'

function useRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}

function resolve(route) {
  if (route[0] === 'saves') return { view: <main className="page"><a href="#/">Back home</a><h1>Save files</h1><Backup /></main>, accent: 'teal' }
  if(route[0]==='book')return {view:<BookPage number={Number(route[1]??1)} practice={route[2]==='play'}/>,accent:'teal'}
  if(route[0]==='alpha')return {view:route[1]==='puzzle'?<AlphaPuzzle partId={route[2]} id={route[3]}/>:<AlphaPage/>,accent:'violet'}
  if (route[0] === 'daily') return { view: <DailyPage />, accent: 'amber' }
  if (route[0] === 'review') return { view: <ReviewPage />, accent: 'violet' }
  if (route[0] === 'progress') return { view: <ProgressPage />, accent: 'teal' }
  if (route[0] === 'shop') return { view: <ShopPage />, accent: 'amber' }
  if (route[0] === 'part') {
    const part = partById(route[1]) ?? bookParts.find(p=>p.id===route[1])
    if (!part) return { view: <Home />, accent: 'teal' }
    if (route[2] === 'set') {
      const index = Number(route[3])
      if (Number.isInteger(index) && index >= 0) {
        if(part.book)return {view:<BookPage part={part} index={index}/>,accent:part.accent}
        return { view: <SetPage part={part} index={index} />, accent: part.accent }
      }
    }
    return { view: <PartPage part={part} />, accent: part.accent }
  }
  return { view: <Home />, accent: 'teal' }
}

function HeaderPills() {
  useProgressTick()
  const t = todayStats()
  const goal = getSettings().goal
  return (
    <div className="header-pills">
      <a className="today-pill" href="#/saves" title="Export or import a save file">Save files</a>
      <a className="coin-pill" href="#/shop" title="Shop">
        <i className="coin" /> {getCoins()}
      </a>
      <a className={`today-pill${t.done >= goal ? ' today-pill-hit' : ''}`} href="#/progress">
        <Chart size={15} />
        <span>
          <strong>{t.done}</strong>
          <em>/{goal} today</em>
        </span>
      </a>
    </div>
  )
}

// Badge and bonus notices, posted from anywhere via lib/toast.js.
function Toasts() {
  const [list, setList] = useState([])
  useEffect(() => {
    const on = (e) => {
      const item = e.detail
      setList((l) => [...l, item])
      setTimeout(() => setList((l) => l.filter((x) => x.id !== item.id)), 4500)
    }
    window.addEventListener('t5334-toast', on)
    return () => window.removeEventListener('t5334-toast', on)
  }, [])
  if (list.length === 0) return null
  return (
    <div className="toast-stack" role="status">
      {list.map((t) => (
        <div className="toast" key={t.id}>
          <span className="toast-icon">{t.icon}</span>
          <div>
            <strong>{t.title}</strong>
            {t.text && <span>{t.text}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const [migration,setMigration]=useState(null)
  useEffect(()=>{try{migrateAlpha();setMigration('ok')}catch(e){setMigration(e.message)}},[])
  if(migration!=='ok')return <main className="page">{migration?`Could not archive progress. Your original save is retained: ${migration}`:'Preserving Alpha progress…'}</main>
  const { view, accent } = resolve(route)
  return (
    <div className={`app accent-${accent}`}>
      <header className="app-header">
        <div className="header-inner">
          <a className="brand" href="#/">
            <Logo size={26} /> Chess Puzzle Training
          </a>
          <HeaderPills />
        </div>
      </header>
      {view}
      <Toasts />
      <footer className="app-footer">
        <p>Chess Puzzle Training · User-provided puzzle collection. Artwork includes AI-generated images. Progress stays in this browser.</p>
      </footer>
    </div>
  )
}
