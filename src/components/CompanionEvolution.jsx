import { petSprite, STAGE_XP } from '../data/shop.js'
import { evolutionLayout } from '../data/companionLayout.js'
import '../styles/companions.css'

// Keep all three original forms visible, including future evolutions. Do not
// silhouette or dim locked art: seeing the destination is part of the reward.
export default function CompanionEvolution({ pet, currentStage = 0 }) {
  const layout = evolutionLayout(pet.id)
  return (
    <div className="companion-evolution" aria-label={`${pet.name} evolution path`} style={{ gridTemplateColumns: layout.forms.map(f => `${f.width}fr`).join(' ') }}>
      {layout.forms.map((form, i) => {
        const stage = i + 1
        return (
        <figure className={`evolution-form${stage === currentStage ? ' evolution-current' : ''}`} key={stage}>
          <svg className="evolution-art" viewBox={`0 0 ${form.width} ${layout.height}`} role="img" aria-label={`${pet.stages[i]}, evolution ${stage}`}>
            <image href={`${import.meta.env.BASE_URL}pets/${petSprite(pet.id, stage)}`} x={form.x} y={form.y} width={form.imageSize} height={form.imageSize}/>
          </svg>
          <figcaption>
            <strong>{pet.stages[stage - 1]}</strong>
            <span>{stage === currentStage ? 'Current form' : stage === 1 ? 'Companion' : `${STAGE_XP[stage - 1]} XP`}</span>
          </figcaption>
        </figure>
      )})}
    </div>
  )
}
