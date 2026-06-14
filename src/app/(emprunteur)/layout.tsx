export default function EmprunteurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="emprunteur-outer">
      <div className="emprunteur-shell">{children}</div>
    </div>
  )
}
