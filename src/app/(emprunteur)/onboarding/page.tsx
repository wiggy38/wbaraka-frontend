'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OTPInput, { OTPInputHandle } from '@/components/shared/OTPInput'
import { requestOTP, verifyOTP, savePrenom } from '@/lib/api'
import { useBarakaStore } from '@/store/barakaStore'
import { useOTPCountdown } from '@/hooks/useOTPCountdown'

const ACTIVITES = [
  { emoji: '🛒', label: 'Commerce',    value: 'commerce'    },
  { emoji: '🌾', label: 'Agriculture', value: 'agriculture' },
  { emoji: '🔨', label: 'Artisanat',   value: 'artisanat'   },
  { emoji: '💼', label: 'Services',    value: 'services'    },
  { emoji: '🐄', label: 'Élevage',     value: 'elevage'     },
  { emoji: '✨', label: 'Autre',       value: 'autre'       },
]

export default function OnboardingPage() {
  const router      = useRouter()
  const setOtpPhone = useBarakaStore(s => s.setOtpPhone)
  const setUser     = useBarakaStore(s => s.setUser)
  const setToken    = useBarakaStore(s => s.setToken)
  const otpPhone    = useBarakaStore(s => s.otpPhone)

  const [step, setStep]       = useState<1 | 2 | 3 | 4>(1)
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<{ msg: string; type: 'error' | 'success' } | null>(null)

  // Step 2
  const [phone, setPhone]         = useState('')
  const [cguAccepted, setCgu]     = useState(false)

  // Step 3
  const [otpError, setOtpError]   = useState(false)
  const [otpErrMsg, setOtpErrMsg] = useState('')
  const [otpBusy, setOtpBusy]     = useState(false)
  const otpRef = useRef<OTPInputHandle>(null)
  const { secondes, peutRenvoyer, reset: resetCountdown } = useOTPCountdown()

  // Step 4
  const [prenom, setPrenom]   = useState('')
  const [activite, setActivite] = useState('')

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (step === 3) resetCountdown()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // XX XX XX XX auto-format
  const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 8)
    return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }
  const handlePhoneInput = (val: string) => setPhone(formatPhone(val))
  const phoneDigits = phone.replace(/\s/g, '')
  const canProceed  = phoneDigits.length === 8 && (isLogin || cguAccepted)

  const handleSendOTP = async () => {
    if (!canProceed || loading) return
    setLoading(true)
    try {
      const tel = '+226' + phoneDigits
      await requestOTP(tel)
      setOtpPhone('+226 ' + phone)
      setStep(3)
    } catch {
      showToast("Erreur d'envoi, réessayez")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (code: string) => {
    if (otpBusy) return
    setOtpBusy(true)
    setOtpError(false)
    setOtpErrMsg('')
    try {
      const data = await verifyOTP('+226' + phoneDigits, code)
      if (isLogin) {
        console.log('Login successful, user:', data.user)
        if (!data.user || !data.user.id) {
          console.warn('No user found after OTP verification')
          setOtpErrMsg('Aucun utilisateur trouvé')
          otpRef.current?.reset()
        } else {
          console.log('Setting user, redirecting to account page')
          setUser(data.user)
          setToken(data.token)
          router.push('/compte')
        }
      } else {
        console.log('Registration successful, setting user')
        setUser(data.user ?? { id: 0, telephone: '+226' + phoneDigits, prenom: '' })
        setToken(data.token)
        setStep(4)
      }
    } catch (e: unknown) {
      console.error('OTP verification error:', e)
      const msg = (e as Error)?.message ?? ''
      if (msg.includes('OTP_EXPIRED') || msg.toLowerCase().includes('expiré')) {
        setOtpErrMsg('Code expiré')
      } else {
        setOtpError(true)
        setOtpErrMsg('Code incorrect, réessayez')
        setTimeout(() => { setOtpError(false); otpRef.current?.reset() }, 420)
      }
    } finally {
      setOtpBusy(false)
    }
  }

  const handleResend = async () => {
    if (!peutRenvoyer || loading) return
    setLoading(true)
    try {
      console.log('Resending OTP to:', '+226' + phoneDigits)
      await requestOTP('+226' + phoneDigits)
      setOtpErrMsg('')
      otpRef.current?.reset()
      resetCountdown()
    } catch {
      console.error('Error resending OTP')
      showToast("Erreur d'envoi, réessayez")
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!prenom.trim()) return
    const cur = useBarakaStore.getState().user
    if (cur) setUser({ ...cur, prenom: prenom.trim(), activite: activite || undefined })
    console.log('Saving prenom:', prenom.trim())
    await savePrenom(prenom.trim())
    console.log('Redirecting to account page')
    router.push('/compte')
  }

  // ── Shared sub-components ────────────────────────────────────────
  const ProgressDots = ({ active }: { active: number }) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          width: i <= active ? 24 : 8, height: 8, borderRadius: 99,
          background: i <= active ? '#0D5934' : '#D1D5DB',
          transition: 'width 0.3s, background 0.3s',
        }} />
      ))}
    </div>
  )

  const StepHeader = ({ onBack, active }: { onBack: () => void; active: number }) => (
    <div style={{
      background: '#fff', borderBottom: '1px solid #D1D5DB', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0,
    }}>
      <button onClick={onBack} style={{
        width: 40, height: 40, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 19l-7-7 7-7" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <ProgressDots active={active} />
      <div style={{ width: 40 }} />
    </div>
  )

  // ── STEP 1 — Splash ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #0D5934 0%, #1B6B44 100%)',
        display: 'flex', flexDirection: 'column', padding: '0 24px', overflowY: 'auto',
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Logo + tagline */}
        <div style={{ paddingTop: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 64, height: 64, background: '#F5A623', borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36 }}>🌿</span>
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 46, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
            Baraka
          </span>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.80)', textAlign: 'center', lineHeight: 1.45, margin: '4px 0 0' }}>
            Comparez les crédits, choisissez le meilleur
          </p>
        </div>

        {/* Value props */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { emoji: '🏦', title: '12 IMF comparées',      sub: 'Toutes les offres du marché' },
            { emoji: '⚡', title: 'Résultat en 2 minutes', sub: 'Sans déplacement'             },
            { emoji: '🔒', title: '100% gratuit',           sub: 'Sans engagement'             },
          ].map(({ emoji, title, sub }) => (
            <div key={title} style={{
              background: 'rgba(255,255,255,.15)', borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.70)', margin: '3px 0 0' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* CTAs */}
        <div style={{ paddingBottom: 44, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
          <button onClick={() => { setIsLogin(false); setStep(2) }} style={{
            height: 58, borderRadius: 16, background: '#F5A623', border: 'none',
            color: '#0D5934', fontSize: 18, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(245,166,35,.32)',
          }}>
            🚀 Créer mon compte
          </button>
          <button onClick={() => { setIsLogin(true); setStep(2) }} style={{
            height: 48, borderRadius: 16, background: 'transparent',
            border: '1.5px solid rgba(255,255,255,.60)',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>
            J&apos;ai déjà un compte — Se connecter
          </button>
        </div>
      </div>
    )
  }

  // ── STEP 2 — Téléphone ──────────────────────────────────────────
  if (step === 2) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <StepHeader onBack={() => setStep(1)} active={1} />

        <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1F2937', margin: 0, lineHeight: 1.25 }}>
              {isLogin ? 'Se connecter' : 'Votre numéro de téléphone'}
            </h1>
            <p style={{ fontSize: 16, color: '#4B5563', margin: '8px 0 0' }}>
              {isLogin
                ? 'Entrez le numéro associé à votre compte.'
                : 'Nous vous enverrons un code de vérification par SMS.'}
            </p>
          </div>

          {/* Phone field */}
          <div style={{
            display: 'flex', alignItems: 'center', height: 58, borderRadius: 14,
            background: '#F9FAFB', border: '1.5px solid #D1D5DB', padding: '0 16px', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>🇧🇫</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap' }}>+226</span>
            <div style={{ width: 1, height: 24, background: '#D1D5DB', flexShrink: 0 }} />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="70 00 00 00"
              value={phone}
              onChange={e => handlePhoneInput(e.target.value)}
              maxLength={11}
              style={{
                flex: 1, outline: 'none', border: 'none', background: 'transparent',
                fontSize: 22, fontWeight: 700, color: '#1F2937', letterSpacing: 1,
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* CGU — registration only */}
          {!isLogin && (
            <div
              onClick={() => setCgu(!cguAccepted)}
              style={{
                background: '#FEF0E0', borderRadius: 14, padding: 14,
                display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
                border: cguAccepted ? 'none' : '1.5px solid #D1D5DB',
                background: cguAccepted ? '#0D5934' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                {cguAccepted && <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, lineHeight: 1 }}>✓</span>}
              </div>
              <p style={{ fontSize: 14, color: '#1F2937', margin: 0, lineHeight: 1.55 }}>
                J&apos;accepte les{' '}
                <span style={{ color: '#0D5934', fontWeight: 600 }}>Conditions d&apos;utilisation</span>
                {' '}et la{' '}
                <span style={{ color: '#0D5934', fontWeight: 600 }}>Politique de confidentialité</span>
              </p>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '12px 20px 40px' }}>
          <button
            onClick={handleSendOTP}
            disabled={!canProceed || loading}
            style={{
              width: '100%', height: 56, borderRadius: 16, background: '#F5A623',
              border: 'none', color: '#0D5934', fontSize: 17, fontWeight: 700,
              cursor: canProceed && !loading ? 'pointer' : 'not-allowed',
              opacity: canProceed && !loading ? 1 : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.2s', boxShadow: '0 6px 16px rgba(245,166,35,.32)',
            }}
          >
            {loading ? <Spinner /> : isLogin ? '🔑 Recevoir le code de connexion' : '📱 Recevoir le code SMS'}
          </button>
        </div>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    )
  }

  // ── STEP 3 — OTP ────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <StepHeader onBack={() => setStep(2)} active={2} />

        <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Code de vérification
            </h1>
            <p style={{ fontSize: 16, color: '#4B5563', margin: '8px 0 0' }}>
              Entrez le code à 6 chiffres envoyé au
            </p>
          </div>

          {/* Phone pill */}
          <div style={{
            alignSelf: 'flex-start', background: '#E3F5EC', borderRadius: 99,
            padding: '6px 16px', fontSize: 15, fontWeight: 600, color: '#0D5934',
          }}>
            📱 {otpPhone}
          </div>

          {/* OTP boxes */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            {otpBusy ? (
              <Spinner large />
            ) : (
              <OTPInput
                ref={otpRef}
                onComplete={handleVerifyOTP}
                error={otpError}
                disabled={otpBusy}
              />
            )}
          </div>

          {/* Error message */}
          {otpErrMsg && (
            <p style={{ color: '#C0392B', fontSize: 14, fontWeight: 600, margin: 0, textAlign: 'center' }}>
              {otpErrMsg}
              {otpErrMsg === 'Code expiré' && (
                <button
                  onClick={handleResend}
                  style={{
                    color: '#0D5934', background: 'none', border: 'none',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', marginLeft: 8,
                  }}
                >
                  Renvoyer
                </button>
              )}
            </p>
          )}

          {/* Countdown / resend */}
          {!otpErrMsg && (
            <p style={{ fontSize: 14, color: '#4B5563', textAlign: 'center', margin: 0 }}>
              {peutRenvoyer ? (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  style={{
                    color: '#0D5934', background: 'none', border: 'none',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Envoi…' : 'Renvoyer le code →'}
                </button>
              ) : (
                <>
                  Renvoyer (
                  <span style={{ fontWeight: 700, color: '#0D5934' }}>{secondes}s</span>
                  )
                </>
              )}
            </p>
          )}
        </div>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    )
  }

  // ── STEP 4 — Profil ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
      <StepHeader onBack={() => setStep(3)} active={3} />

      <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1F2937', margin: 0, lineHeight: 1.25 }}>
            Personnalisez votre expérience
          </h1>
          <p style={{ fontSize: 16, color: '#4B5563', margin: '8px 0 0' }}>
            Ces informations nous aident à vous proposer les meilleures offres.
          </p>
        </div>

        {/* Prénom */}
        <input
          type="text"
          placeholder="Votre prénom"
          value={prenom}
          onChange={e => setPrenom(e.target.value)}
          style={{
            height: 58, borderRadius: 14, border: '1.5px solid #D1D5DB',
            background: '#fff', padding: '0 16px', fontSize: 18, color: '#1F2937',
            outline: 'none', fontFamily: 'inherit',
          }}
        />

        {/* Activité grid */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', margin: '0 0 12px' }}>
            Votre activité principale
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {ACTIVITES.map(({ emoji, label, value }) => {
              const active = activite === value
              return (
                <button
                  key={value}
                  onClick={() => setActivite(active ? '' : value)}
                  style={{
                    height: 58, borderRadius: 14,
                    border: active ? '2px solid #0D5934' : '1.5px solid #D1D5DB',
                    background: active ? '#E3F5EC' : '#fff',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 3,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#0D5934' : '#4B5563' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '12px 20px 40px' }}>
        <button
          onClick={handleFinish}
          disabled={!prenom.trim()}
          style={{
            width: '100%', height: 56, borderRadius: 16, background: '#0D5934',
            border: 'none', color: '#fff', fontSize: 17, fontWeight: 700,
            cursor: prenom.trim() ? 'pointer' : 'not-allowed',
            opacity: prenom.trim() ? 1 : 0.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'opacity 0.2s',
          }}
        >
          ✓ Commencer à explorer
        </button>
      </div>
    </div>
  )
}

// ── Micro-components ────────────────────────────────────────────────

function Spinner({ large = false }: { large?: boolean }) {
  const s = large ? 38 : 20
  return (
    <div style={{
      width: s, height: s, borderRadius: '50%',
      border: `${large ? 3.5 : 2.5}px solid ${large ? '#D1D5DB' : 'rgba(255,255,255,.35)'}`,
      borderTopColor: large ? '#0D5934' : '#fff',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

function Toast({ msg, type }: { msg: string; type: 'error' | 'success' }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: 20, right: 20, zIndex: 9999,
      background: type === 'error' ? '#C0392B' : '#0D5934',
      color: '#fff', borderRadius: 14, padding: '14px 18px',
      fontSize: 15, fontWeight: 600, textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,.22)',
    }}>
      {msg}
    </div>
  )
}
