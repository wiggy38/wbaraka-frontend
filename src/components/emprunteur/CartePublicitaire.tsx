import Image from 'next/image'

interface CartePublicitaireProps {
  src: string
  alt?: string
  href?: string
}

export function CartePublicitaire({ src, alt = 'Publicité', href }: CartePublicitaireProps) {
  const inner = (
    <div className="rounded-card border border-[#EEF1F0] shadow-card" style={{ height: 220 }}>
      <div className="relative h-full w-full overflow-hidden rounded-card">
        <Image
          src={src}
          fill
          alt={alt}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    )
  }

  return inner
}
