interface BanniereInFeedProps {
  nomIMF: string
  initiales: string
  offre: string
  sousTitre: string
  onCta?: () => void
}

export default function BanniereInFeed({
  nomIMF,
  initiales,
  offre,
  sousTitre,
  onCta,
}: BanniereInFeedProps) {
  return (
    <div
      style={{
        height: 80,
        backgroundColor: '#FEF0E0',
        borderLeft: '4px solid #F59E0B',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 12px',
        borderRadius: 4,
      }}
    >
      <div
        aria-label={nomIMF}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 17,
          flexShrink: 0,
        }}
      >
        {initiales}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
          Annonce
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: '#059669',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {offre}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: '#6B7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {sousTitre}
        </p>
      </div>

      <button
        onClick={onCta}
        style={{
          height: 44,
          padding: '0 18px',
          borderRadius: 10,
          backgroundColor: '#065F46',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        En savoir +
      </button>
    </div>
  )
}
