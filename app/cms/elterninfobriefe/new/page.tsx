import { ParentLetterWizardProvider } from "@/components/cms/parent-letter-wizard-context"
import { ParentLetterWizard } from "@/components/cms/parent-letter-wizard"

export default function NewParentLetterPage() {
  return (
    <ParentLetterWizardProvider>
      <ParentLetterWizard />
    </ParentLetterWizardProvider>
  )
}
