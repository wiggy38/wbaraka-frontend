import Link from 'next/link';

type ActiveTab = 'accueil' | 'comparer' | 'simuler' | 'compte';

interface BottomNavbarProps {
  active: ActiveTab;
}

const items: { key: ActiveTab; label: string; icon: string; href: string }[] = [
  { key: 'accueil', label: 'Accueil', icon: '🏠', href: '/accueil' },
  { key: 'comparer', label: 'Comparer', icon: '⚖️', href: '/besoin' },
  { key: 'simuler', label: 'Simuler', icon: '🧮', href: '/simulateur' },
  { key: 'compte', label: 'Compte', icon: '👤', href: '/compte' },
];

export default function BottomNavbar({ active }: BottomNavbarProps) {
  return (
    <nav
      role="navigation"
      aria-label="Navigation principale"
      style={{ height: 80, borderTop: '1px solid #EEF1F0' }}
      className="fixed bottom-0 left-0 right-0 z-10 bg-white grid grid-cols-4 pt-2"
    >
      {items.map(({ key, label, icon, href }) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center gap-0.5"
            style={{ color: isActive ? '#E8700A' : '#6B7280' }}
          >
            <span
              style={
                isActive
                  ? {
                      background: '#FEF0E0',
                      padding: '5px 16px',
                      borderRadius: 99,
                      fontSize: 22,
                      lineHeight: 1,
                    }
                  : { fontSize: 22, lineHeight: 1 }
              }
            >
              {icon}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
