"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Check } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvitationData {
  id: string
  email: string
  role: { id: string; name: string } | null
  personalMessage: string | null
  inviterName: string | null
  expiresAt: string
}

// ---------------------------------------------------------------------------
// Onboarding Page (wrapped in Suspense for useSearchParams)
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="onboarding-page">
          <OnboardingHeader />
          <div className="onboarding-content">
            <div className="onboarding-loading">
              <div className="onboarding-spinner" />
              <p>Einladung wird überprüft...</p>
            </div>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Step 2 — personal info
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [displayNameTouched, setDisplayNameTouched] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Step 3 — password
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 4 — done
  const [done, setDone] = useState(false)

  const firstNameRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // Validate token on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!token) {
      setError("Kein Token angegeben")
      setLoading(false)
      return
    }

    async function validate() {
      try {
        const res = await fetch(`/api/onboarding?token=${encodeURIComponent(token!)}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Einladung ungültig")
        } else {
          setInvitation(data.invitation)
        }
      } catch {
        setError("Verbindungsfehler. Bitte versuche es erneut.")
      } finally {
        setLoading(false)
      }
    }

    validate()
  }, [token])

  // Auto-fill display name
  useEffect(() => {
    if (!displayNameTouched && (firstName || lastName)) {
      setDisplayName(`${firstName} ${lastName}`.trim())
    }
  }, [firstName, lastName, displayNameTouched])

  // Focus first name field on step 2
  useEffect(() => {
    if (step === 1 && firstNameRef.current) {
      setTimeout(() => firstNameRef.current?.focus(), 300)
    }
  }, [step])

  // ---------------------------------------------------------------------------
  // Step navigation with animation
  // ---------------------------------------------------------------------------

  const goToStep = useCallback((nextStep: number) => {
    setAnimating(true)
    setTimeout(() => {
      setStep(nextStep)
      setAnimating(false)
    }, 100)
  }, [])

  // ---------------------------------------------------------------------------
  // Password validation
  // ---------------------------------------------------------------------------

  const pwChecks = {
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  }

  const allPwValid = pwChecks.length && pwChecks.mixed && pwChecks.number && pwChecks.special
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const pwStrength = (() => {
    const met = [pwChecks.length, pwChecks.mixed, pwChecks.number, pwChecks.special].filter(Boolean).length
    if (met <= 1) return { label: "Zu kurz", percent: 25, color: "#ef4444" }
    if (met === 2) return { label: "Mittelmäßig", percent: 50, color: "#f97316" }
    if (met === 3) return { label: "Gut", percent: 75, color: "#eab308" }
    return { label: "Stark", percent: 100, color: "#22c55e" }
  })()

  // ---------------------------------------------------------------------------
  // Submit onboarding
  // ---------------------------------------------------------------------------

  async function handleSubmit() {
    if (!allPwValid || !passwordsMatch || !token) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          firstName,
          lastName,
          displayName: displayName || `${firstName} ${lastName}`.trim(),
          password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || "Fehler beim Erstellen des Kontos")
        return
      }

      setDone(true)
      goToStep(3)
    } catch {
      setSubmitError("Verbindungsfehler. Bitte versuche es erneut.")
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Loading state
  if (loading) {
    return (
      <div className="onboarding-page">
        <OnboardingHeader />
        <div className="onboarding-content">
          <div className="onboarding-loading">
            <div className="onboarding-spinner" />
            <p>Einladung wird überprüft...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="onboarding-page">
        <OnboardingHeader />
        <div className="onboarding-content">
          <div className="onboarding-error">
            <div className="onboarding-error-icon">✕</div>
            <h2>Einladung ungültig</h2>
            <p>{error}</p>
            <a href="mailto:info@grabbe-gymnasium.de" className="onboarding-link-btn">
              Administrator kontaktieren
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!invitation) return null

  const totalSteps = 4
  const currentStep = step

  return (
    <div className="onboarding-page">
      <OnboardingHeader />

      {/* Step indicator */}
      <div className="onboarding-progress">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`onboarding-dot ${i === currentStep ? "active" : ""} ${i < currentStep ? "completed" : ""}`}
          />
        ))}
      </div>

      <div className="onboarding-content">
        <div className={`onboarding-step ${animating ? "onboarding-step-exit" : "onboarding-step-enter"}`}>
          {/* Step 1: Welcome */}
          {step === 0 && (
            <div className="onboarding-welcome">
              <h1>Willkommen im Team!</h1>
              <p className="onboarding-subtitle">
                Richte jetzt dein Konto ein. Das dauert nur zwei Minuten.
              </p>

              <div className="onboarding-meta">
                <span className="onboarding-email">{invitation.email}</span>
                {invitation.role && (
                  <span className="onboarding-role-badge">{invitation.role.name}</span>
                )}
              </div>

              {invitation.personalMessage && (
                <div className="onboarding-quote">
                  <p>&ldquo;{invitation.personalMessage}&rdquo;</p>
                  {invitation.inviterName && (
                    <span className="onboarding-quote-author">— {invitation.inviterName}</span>
                  )}
                </div>
              )}

              <button
                onClick={() => goToStep(1)}
                className="onboarding-btn-primary"
              >
                Los geht&apos;s →
              </button>
            </div>
          )}

          {/* Step 2: Personal info */}
          {step === 1 && (
            <div className="onboarding-form">
              <h2>Persönliche Angaben</h2>

              <div className="onboarding-fields">
                <div className="onboarding-field-row">
                  <div className="onboarding-field">
                    <label htmlFor="ob-firstname">Vorname *</label>
                    <input
                      ref={firstNameRef}
                      id="ob-firstname"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                      className={touched.firstName && !firstName ? "field-error" : ""}
                      placeholder="Max"
                    />
                    {touched.firstName && !firstName && (
                      <span className="field-error-text">Vorname ist erforderlich</span>
                    )}
                  </div>
                  <div className="onboarding-field">
                    <label htmlFor="ob-lastname">Nachname *</label>
                    <input
                      id="ob-lastname"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                      className={touched.lastName && !lastName ? "field-error" : ""}
                      placeholder="Mustermann"
                    />
                    {touched.lastName && !lastName && (
                      <span className="field-error-text">Nachname ist erforderlich</span>
                    )}
                  </div>
                </div>

                <div className="onboarding-field">
                  <label htmlFor="ob-displayname">Anzeigename</label>
                  <input
                    id="ob-displayname"
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value)
                      setDisplayNameTouched(true)
                    }}
                    placeholder="Max Mustermann"
                  />
                  <span className="field-helper">So wirst du im CMS angezeigt</span>
                </div>

                <p className="field-helper" style={{ marginTop: "8px" }}>
                  Dein Profilbild kannst du nach der Anmeldung in deinem Profil hinzufügen.
                </p>
              </div>

              <div className="onboarding-actions">
                <button onClick={() => goToStep(0)} className="onboarding-btn-secondary">
                  Zurück
                </button>
                <button
                  onClick={() => goToStep(2)}
                  disabled={!firstName || !lastName}
                  className="onboarding-btn-primary"
                >
                  Weiter →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 2 && (
            <div className="onboarding-form">
              <h2>Passwort festlegen</h2>

              <div className="onboarding-fields">
                <div className="onboarding-field">
                  <label htmlFor="ob-password">Passwort</label>
                  <div className="onboarding-pw-wrapper">
                    <input
                      id="ob-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sicheres Passwort wählen"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="onboarding-pw-toggle"
                      aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {password.length > 0 && (
                    <div className="onboarding-pw-strength">
                      <div className="onboarding-pw-bar">
                        <div
                          className="onboarding-pw-bar-fill"
                          style={{ width: `${pwStrength.percent}%`, backgroundColor: pwStrength.color }}
                        />
                      </div>
                      <span className="onboarding-pw-label" style={{ color: pwStrength.color }}>
                        {pwStrength.label}
                      </span>
                    </div>
                  )}

                  {/* Requirements checklist */}
                  <div className="onboarding-pw-checks">
                    <PwCheck met={pwChecks.length} label="Mindestens 8 Zeichen" />
                    <PwCheck met={pwChecks.mixed} label="Groß- und Kleinbuchstaben" />
                    <PwCheck met={pwChecks.number} label="Mindestens eine Zahl" />
                    <PwCheck met={pwChecks.special} label="Mindestens ein Sonderzeichen" />
                  </div>
                </div>

                <div className="onboarding-field">
                  <label htmlFor="ob-confirm">Passwort bestätigen</label>
                  <div className="onboarding-pw-wrapper">
                    <input
                      id="ob-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Passwort wiederholen"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="onboarding-pw-toggle"
                      aria-label={showConfirm ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <span className="field-error-text">Passwörter stimmen nicht überein</span>
                  )}
                </div>

                {submitError && (
                  <div className="onboarding-submit-error">{submitError}</div>
                )}
              </div>

              <div className="onboarding-actions">
                <button onClick={() => goToStep(1)} className="onboarding-btn-secondary">
                  Zurück
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!allPwValid || !passwordsMatch || submitting}
                  className="onboarding-btn-primary"
                >
                  {submitting ? "Wird erstellt..." : "Konto erstellen"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 3 && done && (
            <div className="onboarding-done">
              <div className="onboarding-checkmark">
                <svg viewBox="0 0 52 52" className="onboarding-checkmark-svg">
                  <circle cx="26" cy="26" r="25" fill="none" className="onboarding-checkmark-circle" />
                  <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="onboarding-checkmark-path" />
                </svg>
              </div>
              <h1>Alles bereit!</h1>
              <p className="onboarding-subtitle">
                Dein Konto wurde erfolgreich eingerichtet.
              </p>
              <a href="/cms" className="onboarding-btn-primary">
                Zum CMS →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OnboardingHeader() {
  return (
    <header className="onboarding-header">
      <div className="onboarding-header-logo">
        <span>Grabbe-Gymnasium</span>
        <span className="onboarding-header-sub">Detmold</span>
      </div>
    </header>
  )
}

function PwCheck({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`onboarding-pw-check ${met ? "met" : ""}`}>
      <Check size={14} />
      <span>{label}</span>
    </div>
  )
}
