# CMS Style Guidelines

> Permanent style reference for all CMS development at Grabbe-Gymnasium Detmold.

---

## Design Philosophy

The CMS must feel like a **precision tool** — minimal, distraction-free, functional. No glassmorphism, no hero images, no decorative elements. Every pixel serves a purpose. Inspired by the simplicity of Notion, the structure of Linear, and the component quality of shadcn/ui.

---

## Typography

- **Primary UI Font**: `Geist` (variable font via `font-sans`) — used for ALL CMS interface text: labels, nav items, buttons, table content, descriptions, form fields.
- **Display Font**: `font-display` — used in **exactly two places**:
  1. The dashboard greeting headline
  2. The school name in the sidebar header ("Grabbe Gymnasium")
- **Never** use `font-display` for UI labels, nav items, section headings, or any other CMS text.

---

## Color System

- Use **exclusively CSS variables**: `hsl(var(--...))`.
- **Never** hardcode colors (no `#hex`, no `rgb()`, no Tailwind color literals for structural UI).
- Primary accent: `--primary` (the project's existing blue).
- Muted tones: `--muted`, `--muted-foreground` for secondary information.
- Card surfaces: `--card`, `--card-foreground`.
- Borders: `--border`.

### Status Badges

| Status    | Classes                                      |
|-----------|----------------------------------------------|
| Published | `bg-emerald-500/10 text-emerald-600`         |
| Draft     | `bg-muted text-muted-foreground`             |
| Changed   | `bg-amber-100 text-amber-700`               |

---

## Spacing

- **4px base grid** — use Tailwind's spacing scale consistently.
- Standard page container: `max-w-5xl mx-auto px-6 py-8`.
- Card padding: `p-6` (large), `p-4` (compact).
- Gap between sections: `gap-4` to `gap-6`.

---

## Component Patterns

### Page Header

Every CMS page has a consistent header:

```
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
  </div>
  <div className="flex items-center gap-2">
    {/* Action buttons */}
  </div>
</div>
```

- Title: `text-2xl font-bold text-foreground` (Geist, not display font)
- Subtitle: `text-sm text-muted-foreground mt-1`
- Actions: right-aligned in `flex items-center gap-2`

### Sidebar Nav Items

- Active: `bg-primary/10 text-primary`
- Hover: `bg-muted text-foreground`
- Inactive: `text-muted-foreground`
- Section labels: `text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1`

### Stat Cards

```
<Card className="rounded-xl border border-border bg-card p-6">
  <Icon className="h-5 w-5 text-muted-foreground" />
  <p className="mt-4 text-3xl font-bold text-foreground">{count}</p>
  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
</Card>
```

### Data Tables

- Use shadcn/ui `Table` components.
- Header: `text-xs font-medium text-muted-foreground uppercase tracking-wide`.
- Rows: `hover:bg-muted/50 transition-colors`.

### Tab Bars

- Use shadcn/ui `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- Underline style (project convention): `TabsList` with `bg-transparent border-b border-border rounded-none p-0 gap-6`, `TabsTrigger` with `rounded-none border-b-2 border-transparent data-[state=active]:border-primary`.

### Modal Dialogs

- Use shadcn/ui `Dialog` or `AlertDialog`.
- Keep content focused and minimal.

### Form Layouts

- Use `grid gap-4` for form fields.
- Labels: `text-sm font-medium`.
- Hints: `text-[11px] text-muted-foreground`.
- Inputs: shadcn/ui `Input`, `Textarea`, `Select`, `Switch`.

### Cards

- All cards: `rounded-xl border border-border bg-card`.
- Interactive cards: add `hover:bg-muted/50 cursor-pointer transition-colors`.

### Interactive Elements

- All interactive elements: `focus-visible:ring-2 focus-visible:ring-ring`.

---

## Icons

- Use **lucide-react** exclusively for all icons.
- Standard size in nav/UI: `h-4 w-4`.
- Standard size in stat cards / headers: `h-5 w-5`.

---

## Responsiveness

- The entire CMS must be fully responsive: mobile, tablet, and desktop.
- Sidebar: fixed on desktop, slides in as drawer on mobile.
- Content max width: `max-w-5xl`.
- Grid patterns: mobile-first with `sm:`, `md:`, `lg:` breakpoints.

---

## Dark Mode

- Dark mode must work perfectly.
- Use **only CSS variables** — never hardcode colors.
- The `dark:` prefix is acceptable only for cases where CSS variables don't cover the need (e.g., specific opacity adjustments).

---

## Do's and Don'ts

### ✅ Do

- Use shadcn/ui components exclusively
- Use CSS variables for all colors
- Use Geist font for all UI text
- Use lucide-react for icons
- Add focus-visible rings to interactive elements
- Test in both light and dark mode
- Keep pages minimal and distraction-free

### ❌ Don't

- No glassmorphism (backdrop-blur effects on UI surfaces)
- No `font-display` for UI labels, buttons, or section headings
- No large decorative images or hero sections
- No non-shadcn custom-built UI primitives
- No hardcoded colors (`#hex`, `rgb()`, Tailwind color literals for structural UI)
- No inline styles for colors
- No third-party icon libraries (only lucide-react)
