'use client'

interface FallbackIMFProps {
  nom: string
  type: 'logo' | 'cover'
  gradient?: string
  className?: string
}

export function FallbackIMF({ nom, type, gradient, className }: FallbackIMFProps) {
  if (type === 'logo') {
    const initiales = nom.slice(0, 2).toUpperCase()
    return (
      <div
        className={className}
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: '#1B6B44',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {initiales}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: 86,
        background: gradient ?? 'linear-gradient(135deg, #0D5934 0%, #2A9D6E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 700,
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}
    >
      {nom}
    </div>
  )
}
