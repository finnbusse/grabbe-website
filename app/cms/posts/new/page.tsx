import { PostWizardProvider } from "@/components/cms/post-wizard-context"
import { PostWizard } from "@/components/cms/post-wizard"

export default function NewPostPage() {
  return (
    <PostWizardProvider>
      <PostWizard />
    </PostWizardProvider>
  )
}
