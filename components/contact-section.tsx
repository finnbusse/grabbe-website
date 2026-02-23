import Link from "next/link"
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { getSettings } from "@/lib/settings"
import { ContactSectionClient } from "./contact-section-client"

export async function ContactSection() {
  const s = await getSettings()

  const address = s.school_address || "Küster-Meyer-Platz 2, 32756 Detmold"
  const phone = s.school_phone || "05231 - 99260"
  const fax = s.school_fax || "05231 - 992616"
  const email = s.school_email || "sekretariat@grabbe.nrw.schule"
  const schulleiter = s.schulleitung_1 || "Dr. Claus Hilbing"
  const stellvertreter = s.schulleitung_2 || "Oliver Sprenger"
  const fullName = s.school_name_full || "Christian-Dietrich-Grabbe-Gymnasium"

  return (
    <ContactSectionClient
      address={address}
      phone={phone}
      fax={fax}
      email={email}
      schulleiter={schulleiter}
      stellvertreter={stellvertreter}
      fullName={fullName}
    />
  )
}
