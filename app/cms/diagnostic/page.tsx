"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, RefreshCw, XCircle } from "lucide-react"

interface DiagnosticResult {
  timestamp: string
  checks: Record<string, any>
  errors: string[]
  summary?: {
    total_checks: number
    errors_count: number
    status: string
  }
  recommended_action?: string
}

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/diagnostic')
      const data = await response.json()
      setResult(data)
      
      if (!response.ok) {
        setError(`Diagnostic found issues (Status: ${response.status})`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run diagnostic')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'FAILED':
      case 'EXCEPTION':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Datenbank-Diagnose</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Überprüfen Sie den Status der Datenbankverbindung und Berechtigungen
          </p>
        </div>
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Läuft...' : 'Erneut prüfen'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive">Fehler</h3>
              <p className="mt-1 text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {result && (
        <>
          {/* Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {result.summary?.status === 'ALL_CHECKS_PASSED' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <h2 className="font-display text-xl font-bold">
                  {result.summary?.status === 'ALL_CHECKS_PASSED' 
                    ? 'Alle Prüfungen bestanden ✓' 
                    : 'Probleme gefunden'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {result.summary?.total_checks} Prüfungen durchgeführt, {result.summary?.errors_count} Fehler gefunden
                </p>
              </div>
            </div>

            {result.recommended_action && (
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Empfohlene Aktion:</h3>
                <p className="text-sm text-yellow-800">{result.recommended_action}</p>
                <div className="mt-3 text-sm text-yellow-800">
                  <strong>So beheben Sie das Problem:</strong>
                  <ol className="ml-4 mt-2 list-decimal space-y-1">
                    <li>Öffnen Sie Ihr Supabase Dashboard</li>
                    <li>Gehen Sie zu "SQL Editor"</li>
                    <li>Öffnen Sie die Datei <code className="bg-yellow-100 px-1 rounded">scripts/complete_schema.sql</code> aus diesem Projekt</li>
                    <li>Kopieren Sie den Inhalt und führen Sie ihn im SQL Editor aus</li>
                    <li>Führen Sie diese Diagnose erneut aus</li>
                  </ol>
                </div>
              </div>
            )}
          </Card>

          {/* Errors */}
          {result.errors.length > 0 && (
            <Card className="p-6 border-destructive/50">
              <h2 className="font-display text-lg font-bold mb-4 text-destructive">
                Gefundene Fehler ({result.errors.length})
              </h2>
              <div className="space-y-2">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span className="text-destructive/90">{err}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Detailed Checks */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold mb-4">Detaillierte Prüfungen</h2>
            <div className="space-y-3">
              {Object.entries(result.checks).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-start gap-3 rounded-lg border p-3">
                  {getStatusIcon(value.status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                    {value.status && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Status: <span className={value.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                          {value.status}
                        </span>
                      </div>
                    )}
                    {value.error && (
                      <div className="text-xs text-destructive mt-1">
                        Fehler: {value.error}
                      </div>
                    )}
                    {value.exists !== undefined && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Existiert: {value.exists ? 'Ja' : 'Nein'}
                        {value.count !== undefined && ` (${value.count} Einträge)`}
                      </div>
                    )}
                    {value.user_id && (
                      <div className="text-xs text-muted-foreground mt-1">
                        User ID: {value.user_id}
                      </div>
                    )}
                    {value.email && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Email: {value.email}
                      </div>
                    )}
                    {value.hint && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Hinweis: {value.hint}
                      </div>
                    )}
                    {value.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Details: {value.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Timestamp */}
          <div className="text-center text-xs text-muted-foreground">
            Letzte Prüfung: {new Date(result.timestamp).toLocaleString('de-DE')}
          </div>
        </>
      )}
    </div>
  )
}
