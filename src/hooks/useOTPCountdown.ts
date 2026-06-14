import { useState, useEffect, useCallback } from 'react'

/**
 * Hook compte à rebours OTP
 * Retourne secondes restantes + fonction reset
 * Actif = countdown > 0
 */
export function useOTPCountdown(initialSeconds = 60) {
  const [secondes, setSecondes] = useState(initialSeconds)
  const [actif, setActif] = useState(true)

  useEffect(() => {
    if (!actif) return
    if (secondes <= 0) {
      setActif(false)
      return
    }
    const timer = setTimeout(() => setSecondes(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondes, actif])

  const reset = useCallback(() => {
    setSecondes(initialSeconds)
    setActif(true)
  }, [initialSeconds])

  return {
    secondes,
    peutRenvoyer: !actif || secondes <= 0,
    label: secondes > 0 ? `Renvoyer (${secondes}s)` : 'Renvoyer le code →',
    reset,
  }
}
