'use client'

import dynamic from 'next/dynamic'

const ParticleBackground = dynamic(
  () => import('./ParticleBackground').then((mod) => mod.ParticleBackground),
  { ssr: false }
)

export function DynamicParticleBackground() {
  return <ParticleBackground />
}
