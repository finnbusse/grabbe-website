import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { getSEOSettings, generateBreadcrumbJsonLd, JsonLd, type BreadcrumbItem } from "@/lib/seo"

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export async function Breadcrumbs({ items }: BreadcrumbsProps) {
  const seo = await getSEOSettings()
  const allItems = [{ name: "Start", href: "/" }, ...items]
  const jsonLd = generateBreadcrumbJsonLd(seo, allItems)

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {index === 0 && <Home className="mr-1 inline h-3.5 w-3.5" />}
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-primary"
                  >
                    {index === 0 && <Home className="mr-1 inline h-3.5 w-3.5" />}
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
