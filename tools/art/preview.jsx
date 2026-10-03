import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ArtPiece from '../../src/components/ArtPieces.jsx'
import MoveEffect, { EffectPreview } from '../../src/components/MoveEffect.jsx'
import { pieceSets, effects, pets } from '../../src/data/shop.js'
import CompanionEvolution from '../../src/components/CompanionEvolution.jsx'
import { directionalFurniture, furnitureSprite } from '../../src/data/furnitureLayout.js'
import RoomFurniture from '../../src/components/RoomFurniture.jsx'
import '../../src/styles/tokens.css'
import '../../src/styles/app.css'
import '../../src/styles/painted.css'
import '../../src/styles/studio.css'

function Preview() {
  const [directions, setDirections] = useState({})
  const [calibrated, setCalibrated] = useState(true)
  const [material, setMaterial] = useState('cartoon')
  const [effect, setEffect] = useState('fireflies')
  const [event, setEvent] = useState(null)
  return <main style={{ maxWidth: 1080, margin: '40px auto', padding: 24 }}>
    <p className="eyebrow">ART DIRECTION · SEPTEMBER 2026</p>
    <h1>The quiet atelier</h1>
    <p className="lede">Rustic materials. Animated light. Six unmistakable silhouettes.</p>
    <p style={{ margin: '12px 0 24px', color: 'var(--ink-soft)' }}>Art review only · no progress or coins are changed.</p>
    <label>Piece material <select value={material} onChange={e => setMaterial(e.target.value)}>{pieceSets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <div style={{ marginTop: 20, padding: 16, background: '#d6c6a3', border: '8px solid #90734f', borderRadius: 12 }}>
      {['w','b'].map(c => <div key={c} style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)' }}>{['k','q','b','n','r','p'].map((p,i) => <div key={p} style={{ minWidth: 0, background: i % 2 ? '#a1ad91' : '#e7d9bc' }}><ArtPiece type={p} color={c} set={material}/></div>)}</div>)}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(6,1fr)', textAlign:'center',fontSize:13,paddingTop:8 }}>{['King','Queen','Bishop','Knight','Rook','Pawn'].map(n=><span key={n}>{n}</span>)}</div>
    </div>
    <h2 style={{ marginTop: 32 }}>A little magic with every move</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 16 }}>{effects.map(e => <div key={e.id}><EffectPreview id={e.id}/><p>{e.name}</p></div>)}</div>
    <p style={{ marginTop: 24 }}><label>Landing effect <select value={effect} onChange={e=>setEffect(e.target.value)}>{effects.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label></p>
    <button onClick={()=>setEvent({id:Date.now(),solved:true})} style={{position:'relative',width:128,height:128,background:'#92a183',border:'4px solid #967650',borderRadius:8,marginTop:12}} aria-label="Preview a correct landing">
      <ArtPiece type="n" color="w" set={material}/><MoveEffect event={event} effect={effect}/>
    </button>
    <section id="companions" className="companions-review" style={{marginTop:40}}>
      <p className="eyebrow">JAPANESE FANTASY RPG · COMPANIONS</p>
      <h2>Little friends. Legendary journeys.</h2>
      <p>Original companion art, with all three evolutions shown together.</p>
      <div className="companions-review-grid">{pets.map(pet=><div key={pet.id}><h3>{pet.name}</h3><CompanionEvolution pet={pet}/></div>)}</div>
      <h3 style={{margin:'28px 0 8px'}}>New evolution concept · familiar faces, stronger transformations</h3>
      <p style={{marginBottom:16}}>Kitten → wayfarer → crowned cat · fox kit → charm fox → spirit fox · owlet → apprentice → star sage · hatchling → young drake → jade guardian.</p>
      <img src="./studio-source/companions-jrpg.png" alt="Japanese fantasy RPG companion evolution concept sheet: cat, fox, owl and dragon, each with three clearly different forms" style={{display:'block',width:'100%',maxWidth:900,margin:'0 auto',borderRadius:16}}/>
      <p style={{fontSize:13,marginTop:10,color:'var(--ink-soft)'}}>Concept art. The game continues to use the original companion sprites.</p>
    </section>
    <section id="room-space" style={{marginTop:40}}>
      <p className="eyebrow">ROOM SPACE · PERSPECTIVE STUDY</p>
      <h2>统一房型与家具朝向</h2>
      <h3>墙面透视校准 · 前后对比</h3>
      <button className="btn btn-ghost" aria-pressed={calibrated} onClick={()=>setCalibrated(v=>!v)}>{calibrated ? '显示原透视' : '显示校准透视'}</button>
      <div style={{position:'relative',aspectRatio:'16/9',overflow:'hidden',marginTop:12,borderRadius:12}}>
        <img src="/room/studio/afternoon.png" alt="校准房间" style={{display:'block',width:'100%',height:'100%'}}/>
        {[['bookshelf','left',{x:2,y:30},28],['fireplace','right',{x:77,y:49},20]].map(([id,d,p,w])=><RoomFurniture key={id} id={id} direction={d} pos={p} width={w} room={calibrated?'bg':'comparison'} src={`/${furnitureSprite(id,d)}`} alt={id} style={{position:'absolute',left:`${p.x}%`,top:`${p.y}%`,width:`${w}%`,aspectRatio:'1'}}/>) }
      </div>
      <p style={{fontSize:13,marginTop:8}}>以墙脚线汇聚位置校准正面横边。适用于下午房间的书柜、衣柜、壁炉；旧季节房间保留原透视。</p>
      <h3>新下午空房 · 已接入游戏</h3>
      <img src="/room/studio/afternoon.png" alt="明亮的下午空房，具有两侧墙和木地板" style={{display:'block',width:'100%',borderRadius:12,marginTop:16}}/>
      <h3 style={{marginTop:24}}>六件家具 · 双朝向原稿</h3>
      <p>透明素材已接入游戏。选中书柜、衣柜、壁炉、书桌、扶手椅或床，可在房间下方切换朝向，位置和大小保持不变。</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginTop:16}}>
        {directionalFurniture.map(id => <div key={id} style={{padding:12,border:'1px solid var(--line)',borderRadius:12}}>
          <strong>{id}</strong>
          <div style={{background:'#92a183',borderRadius:8,margin:'8px 0',textAlign:'center'}}><img src={`/${furnitureSprite(id, directions[id] ?? 'left')}`} alt={`${id} facing ${directions[id] ?? 'left'}`} style={{display:'block',width:'100%',maxWidth:260,margin:'auto'}}/></div>
          <button className="btn btn-ghost" onClick={() => setDirections(s => ({...s,[id]:s[id] === 'right' ? 'left' : 'right'}))}>切换 {id} 朝向</button>
        </div>)}
      </div>
      <img src="./studio-source/directions-proof.png" alt="书柜、衣柜、壁炉、书桌、扶手椅和床的两个朝向，统一脚底对齐" style={{display:'block',width:'100%',borderRadius:12,marginTop:16}}/>
      <h3 style={{marginTop:24}}>早期空间示意</h3>
      <p>主墙与两侧墙固定；书柜沿左墙、壁炉沿右墙、矮柜沿后墙。中央地面留给伙伴和自由摆放。</p>
      <img src="./studio-source/room-space-concept.png" alt="带左右侧墙的房间空间示意：书柜和壁炉分别贴合两侧墙，桌椅落在前景地面" style={{display:'block',width:'100%',borderRadius:12,marginTop:16}}/>
      <p style={{fontSize:13,marginTop:10,color:'var(--ink-soft)'}}>空间示意，尚未接入游戏。此稿材质偏写实、室内偏暗，正式素材需更明亮并简化为清晰动画色块；家具将独立绘制，不能烘焙进背景。</p>
    </section>
    <h2 style={{marginTop:32}}>Animation art · environment sheets</h2>
    <p>New environment artwork. Transparency cleanup and sprite extraction are pending.</p>
    {['furniture','decor','rooms'].map(name=><figure key={name} style={{margin:'24px 0'}}><figcaption style={{marginBottom:8,textTransform:'capitalize'}}>{name}</figcaption><img src={`./studio-source/${name}.png`} alt={`${name} animation art source sheet`} style={{display:'block',width:'100%',borderRadius:12}} /></figure>)}
  </main>
}
createRoot(document.getElementById('root')).render(<Preview />)
