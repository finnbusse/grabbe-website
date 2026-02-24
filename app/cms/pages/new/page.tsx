import { PageWizardProvider } from "@/components/cms/page-wizard-context"
import { PageWizard } from "@/components/cms/page-wizard"

export default function NewCmsPage() {
  return (
    <PageWizardProvider>
      <PageWizard />
    </PageWizardProvider>
  )
}
