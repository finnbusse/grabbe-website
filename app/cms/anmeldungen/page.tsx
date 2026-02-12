import { createClient } from "@/lib/supabase/server"

export default async function AnmeldungenPage() {
  const supabase = await createClient()
  const { data: submissions } = await supabase
    .from("anmeldung_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  const items = submissions || []

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Anmeldungen</h1>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} Anmeldung{items.length !== 1 ? "en" : ""} eingegangen</p>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Noch keine Anmeldungen eingegangen.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{item.child_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.anmeldung_type === "klasse5" ? "Anmeldung Klasse 5" : "Anmeldung Oberstufe"}
                    {" "}&middot; {new Date(item.created_at).toLocaleDateString("de-DE")}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Elternteil</p>
                  <p>{item.parent_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">E-Mail</p>
                  <p><a href={`mailto:${item.parent_email}`} className="text-primary hover:underline">{item.parent_email}</a></p>
                </div>
                {item.parent_phone && (
                  <div>
                    <p className="text-muted-foreground text-xs">Telefon</p>
                    <p>{item.parent_phone}</p>
                  </div>
                )}
                {item.grundschule && (
                  <div>
                    <p className="text-muted-foreground text-xs">Grundschule</p>
                    <p>{item.grundschule}</p>
                  </div>
                )}
                {item.child_birthday && (
                  <div>
                    <p className="text-muted-foreground text-xs">Geburtsdatum</p>
                    <p>{new Date(item.child_birthday).toLocaleDateString("de-DE")}</p>
                  </div>
                )}
                {item.profilprojekt && (
                  <div>
                    <p className="text-muted-foreground text-xs">Wunsch-Profilprojekt</p>
                    <p>{item.profilprojekt}</p>
                  </div>
                )}
              </div>
              {item.message && (
                <div>
                  <p className="text-muted-foreground text-xs">Nachricht</p>
                  <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
