import { createClient } from "@/lib/supabase/server"
import { MessagesInbox } from "@/components/cms/messages-inbox"

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: messages } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  return <MessagesInbox initialMessages={messages || []} />
}
