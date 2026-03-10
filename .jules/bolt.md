## 2024-03-XX - Initial profile
**Learning:** Found sequential dependency in `app/page.tsx` author profile fetch.
**Action:** Can we fetch author_profiles efficiently? Supabase query could use a join if the foreign key exists, but it seems there's no FK or it's cross-schema. Let's see how posts fetch is structured.

**Learning:** `app/page.tsx` loads posts and events directly, and then it sequential fetches `user_profiles` based on `posts` userIds.
**Action:** Instead of sequentially fetching profiles after posts, we can use a Database Function or join, but Supabase `select()` supports joining foreign keys. Let's check `user_profiles` relation.
Actually, the best daily optimization for `app/page.tsx` is to use `Promise.all` correctly inside `HomePage` component OR use Next.js's component-level data fetching (React Server Components allows us to parallelize completely by breaking `HomePage` down). But `app/page.tsx` currently waits for `postsRes`, `eventsRes`, `pageContents`, `campaignsRes` in one `Promise.all`. Then it awaits `authorProfiles`. This is not a huge sequential block since they are small, but let's check `lib/db-helpers.ts`. It has `getPublishedPosts` that uses `unstable_cache`.

However, `app/page.tsx` DOES NOT use the cached `getPublishedPosts` or `getUpcomingEvents` from `lib/db-helpers.ts`! It queries Supabase directly without `unstable_cache`!
`app/page.tsx`:
```typescript
  const [postsRes, eventsRes, pageContents, campaignsRes] = await Promise.all([
    supabase.from("posts")... // NO CACHE
    supabase.from("events")... // NO CACHE
    getMultiplePageContents(...) // CACHED
    ...
```
This is a huge backend performance issue! Every hit to the homepage (if not statically rendered) queries the database directly. Although Next.js has full route cache, `page.tsx` exports `export const revalidate = 300`, so it is statically regenerated. BUT when it regenerates, it queries directly.

Wait, `getPublishedPosts` and `getUpcomingEvents` exist in `db-helpers.ts` and use `unstable_cache` with `revalidate: 300` and tags. Using these helpers would avoid redundant queries and share the cache across the app (e.g. `app/aktuelles/page.tsx` might use the helper).

Let's check `components/news-section.tsx`. It takes `posts` as a prop.

Another potential optimization: `app/page.tsx` uses `createClient` from `@/lib/supabase/server`. `createClient` is meant for dynamic routes (it reads cookies). Using `createClient` forces the page to be dynamic or use `cookies()` whichOpts into dynamic rendering in some Next.js versions, although here no cookies are awaited directly. Wait, `createClient` calls `cookies()` internally!
If `createClient` calls `cookies()`, Next.js will dynamically render `HomePage`!

`lib/supabase/server.ts` calls `cookies()` immediately when `createClient` is executed. In Next.js 15+ (and backported heavily), `await cookies()` opts a page out of static rendering unless wrapped in something else, or if the page itself is dynamic. Wait, `page.tsx` exports `export const revalidate = 300`, which forces ISR (Incremental Static Regeneration), but Next.js docs state: "If a segment contains both a dynamic function (e.g. cookies()) and generateStaticParams or forced revalidation, the segment will be dynamically rendered at runtime." Wait, in older Next 14, `cookies()` opts out entirely.
Actually, `lib/supabase/static.ts` exists specifically for this: "Use this client for static/cached pages where you don't need user session/auth information."

Let's check `lib/supabase/static.ts`.

Yes! `app/page.tsx` uses `import { createClient } from "@/lib/supabase/server"` which reads `cookies()`. This deopts the page from being statically prerendered or forces dynamic runtime evaluation on every hit if ISR is overridden by the dynamic `cookies()` call. Next.js 14/15 will dynamically render the home page when it detects `cookies()`.

Let's check `pnpm build` output to see if it statically generated `app/page.tsx`.
`pnpm build` output showed:
```
Route (app)                             Revalidate  Expire
┌ ƒ /
```
The home page `/` is marked with `ƒ` (Dynamic) which means server-rendered on demand! The most visited page of the site is completely un-cached!

This is the perfect performance win for Bolt ⚡.
Changing `createClient` from `@/lib/supabase/server` to `createStaticClient` from `@/lib/supabase/static` in `app/page.tsx` will allow the page to be Statically Generated at build time (or ISR cached since it exports `export const revalidate = 300`). This will turn the homepage from an expensive dynamic render requiring 4-5 parallel database queries per request, into a fast statically cached HTML file!

Wait! I also see that `app/page.tsx` fetches `campaignsRes` and `authorProfiles`. If we switch to `createStaticClient`, the page can be fully statically cached.
Let's double check if we can switch `createClient` to `createStaticClient` in `app/page.tsx`.

Let's also check if there are other public pages doing this.

Ah! A bunch of public routes (`app/page.tsx`, `app/aktuelles/page.tsx`, `app/aktuelles/[slug]/page.tsx`, `app/termine/page.tsx`, `app/seiten/[...slug]/page.tsx`, `app/downloads/page.tsx`) are importing `createClient` from `server.ts` which is completely blocking static generation for the ENTIRE frontend of the site! They don't need user sessions. We should switch them to use `createStaticClient` from `static.ts` so they can be rendered statically.

Let's check `app/aktuelles/page.tsx`.

Ah, indeed. They are importing `createClient` from `@/lib/supabase/server` which opts them into dynamic rendering. But wait, what if I just change the import in `app/page.tsx` and a few others?
Let me verify if `createStaticClient` works out of the box for those queries.

`createStaticClient` is in `lib/supabase/static.ts` and does exactly what we want.

I'll search for all public pages that are mistakenly using `createClient` from `server.ts` when they should use `createStaticClient` from `static.ts` (or the cached helper functions in `lib/db-helpers.ts`).

Wait, is there any reason they used `createClient`? They probably just copied it from the docs or another file.
By changing the import, Next.js can fully cache these pages and perform SSG (Static Site Generation), drastically improving Time to First Byte (TTFB).

Perfect. The public pages (`app/page.tsx`, `app/aktuelles/page.tsx`, `app/aktuelles/[slug]/page.tsx`, `app/termine/page.tsx`, `app/seiten/[...slug]/page.tsx`, `app/downloads/page.tsx`) are currently importing `createClient` from `@/lib/supabase/server`. This causes Next.js to dynamically render these routes on every request because `createClient` internally calls `cookies()`.

Next.js doc says: "If a Server Component reads cookies(), it opts into Dynamic Rendering."

By switching these imports to `createStaticClient` from `@/lib/supabase/static`, these pages will be statically rendered at build time and cached at the edge! The `revalidate = 300` will then properly work as Incremental Static Regeneration (ISR). This is a HUGE performance win:
- Eliminates 4-5 sequential DB round trips per request on the homepage
- Makes TTFB nearly instant
- Significantly reduces DB load

I will set my plan to replace `createClient` from `server` with `createStaticClient` from `static` on all public pages.

Ah! Wait, wait... Even though we switched to `createStaticClient`, the `/` page is still showing as `ƒ (Dynamic)`! Let's check why!
Because of `app/layout.tsx`? Does `layout.tsx` use `cookies()` or dynamic functions? Or is there something else triggering it?

Wait, in Next.js 14/15, there is a `generateStaticParams` function that forces a page to be generated. But for root `/`, it should be static by default unless it uses dynamic functions.
Wait, let's look at `/` dependencies.
`import { getSettings, getNavigation, getAllNavItems } from "@/lib/settings"` inside `SiteLayout`.
Let's see what `getSettings` does.

Wait, `app/page.tsx` exports `export const revalidate = 300`. By Next.js rules, a page with `export const revalidate = X` is evaluated ONCE at build time (if possible) OR evaluated on demand and cached (ISR) but marked as `ƒ (Dynamic)` if there's no way to statically build it? No, `revalidate = 300` should make it `○` (Static with revalidation, usually looks like `●` or `○`). Actually, `ƒ` means strictly dynamic. Let's find what else causes dynamic rendering.

Wait, `getMultiplePageContents` uses `unstable_cache`. But `app/page.tsx` fetches:
```ts
    supabase
      .from("events")
      .select(...)
      .or(`starts_at.gte.${new Date().toISOString()}`)
```
Ah!! `new Date().toISOString()`! That's NOT what makes it dynamic in Next.js. Next.js does not hook into `new Date()`. But wait! Does Supabase JS client make a `fetch` request? Yes. And in Next.js 14, `fetch` requests are cached by default. In Next 15, `fetch` requests are NOT cached by default (`cache: 'no-store'` is the default for `fetch`). Next 15 requires you to wrap it in `unstable_cache` or use `export const revalidate = 300`. But wait, this is Next.js 16.1.6 (from `package.json`) ? Wait, package.json says `"next": "16.1.6"` ? Wait, `15.0.0` or something. Wait, Next.js 16 doesn't exist yet! Ah, let me check package.json.
"next": "16.1.6" doesn't exist. "next": "^15.x.x" wait let's look at package.json.

Ah, package.json says `next: 16.1.6`. That's completely fake/custom version, probably an internal fork of Next.js 15+ (canary).

Wait! The pages might be dynamic because I didn't remove `cookies` entirely? No, `createStaticClient` does NOT import `cookies`.
Let's see if there is any other `cookies` import happening through the dependency tree!

`SiteLayout` -> `getSettings` -> `getSEOSettings` -> ???
Let's check `lib/seo.ts` and `lib/settings.ts`.

Ah! I see. Is `lib/supabase/server.ts` imported ANYWHERE else on the home page?
In `app/page.tsx`:
```
import { SiteLayout } from "@/components/site-layout"
import { HeroSection } from "@/components/hero-section"
...
```
Does any of the components import `createClient` from `@/lib/supabase/server`?
Let's check `components/site-layout.tsx` and others.

Ah! `components/block-content-renderer.tsx` and `components/tagged-section.tsx` import `createClient` from `@/lib/supabase/server`.
Are these components used in `app/page.tsx`?
No, wait. In Next.js, if a module is in the module graph of `app/page.tsx`, and that module imports `server.ts` which calls `cookies()`, does that opt-out the whole page? YES, if the function containing `cookies()` is invoked during render! But `createClient` is only invoked when rendering the component.
Wait, if `server.ts` imports `cookies` from `next/headers` and calls `await cookies()` inside `createClient()`, it only affects rendering if `createClient` is called.

Wait, earlier `app/page.tsx` was `ƒ /` which means dynamic. But after I changed `app/page.tsx` to `createStaticClient`, `pnpm build` *STILL* outputs `ƒ /`. WHY?
Let's review `app/page.tsx` again.

Wait, `app/page.tsx` is dynamic. What about `app/aktuelles/page.tsx`?
The `build` output:
```
Route (app)                             Revalidate  Expire
┌ ƒ /
├ ○ /_not-found                                 1h      1y
├ ƒ /aktuelles
├ ● /aktuelles/[slug]
├ ƒ /api/anmeldung
...
├ ƒ /cms
├ ƒ /datenschutz
├ ƒ /downloads
├ ƒ /impressum
├ ƒ /kontakt
├ ○ /onboarding                                 1h      1y
├ ƒ /robots
├ ƒ /schulleben
├ ● /schulleben/[...slug]
├ ƒ /schulleben/faecher-ags
├ ƒ /schulleben/nachmittag
├ ƒ /schulleben/netzwerk
├ ● /seiten/[...slug]
├ ƒ /sitemap.xml
├ ƒ /termine
├ ƒ /unsere-schule
├ ● /unsere-schule/[...slug]
├ ƒ /unsere-schule/anmeldung
├ ƒ /unsere-schule/erprobungsstufe
├ ƒ /unsere-schule/oberstufe
├ ƒ /unsere-schule/profilprojekte
├ ○ /unsere-schule/wer-was-wo                   1h      1y
├ ƒ /unterricht
├ ● /unterricht/[...slug]
└ ƒ /unterricht/faecher
```

Wait! Almost ALL pages are `ƒ`! `/downloads`, `/impressum`, `/kontakt`, `/datenschutz`, `/schulleben/*`...
Why are they all dynamic?

Wait... let's check `lib/settings.ts`.

Ahhhh! `getAllNavItems` uses `await createClient()` from `server.ts`!!!
And `SiteLayout` (in `components/site-layout.tsx`) calls `getAllNavItems`!
Let's check `components/site-layout.tsx`.

```typescript
export async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, headerNav, footerNav, footerLegalNav] = await Promise.all([
    getSettings(),
    getNavigation("header"),
    getAllNavItems("footer"),
    getAllNavItems("footer-legal"),
  ])
...
```

So ANY page wrapped in `SiteLayout` calls `getAllNavItems` which imports `server.ts` and uses `cookies()`, blowing up static generation for EVERY SINGLE PAGE on the website.

And `getAllNavItems` even has a comment: `/** Fetch all nav items flat (for CMS editing — NOT cached) */`. Why is the public SiteLayout using a function meant for CMS editing that completely destroys the cache?

I will fix this immediately by either:
1. Changing `SiteLayout` to use `getNavigation("footer")` instead of `getAllNavItems("footer")` (which is cached and static) OR
2. Changing `getAllNavItems` to use `createStaticClient()` if it doesn't need auth.
Wait, `SiteLayout` expects a flat list or nested? `getAllNavItems` returns flat. `SiteFooter` expects `FooterLink[]` which is flat. `getNavigation` returns nested. We could use `getNavigation` and flatten it, or we could change `getAllNavItems` to use `createStaticClient()`! But `getAllNavItems` is used by CMS editing and maybe CMS expects fresh data? Next.js cache `revalidate: 0` would be better for CMS.
Actually, `getAllNavItems` does not need `cookies()` to fetch from Supabase. The navigation table has `public` read access (presumably since `getNavigation` uses `createStaticClient()`).

If I just change `getAllNavItems` to use `createStaticClient` OR, better yet, make a `getFooterNavigation` that uses the cache!

Wait, `getSettingsRows()` also uses `await createClient()`. Is `getSettingsRows()` imported anywhere public?

Ah! `components/block-content-renderer.tsx` and `components/tagged-section.tsx` use `await createClient()` from `server.ts`.

`components/block-content-renderer.tsx` is used in `/seiten/[...slug]/page.tsx` for rendering dynamic content blocks!
`components/tagged-section.tsx` is probably used in `block-content-renderer`.
If `block-content-renderer` uses `await createClient()`, it completely defeats the change we made in `app/seiten/[...slug]/page.tsx` because that page renders `BlockContentRenderer`.
Let's fix `components/block-content-renderer.tsx` and `components/tagged-section.tsx` to use `createStaticClient()` since they are rendering public page content.

Awesome!!!
Look at the build output now:
```
Route (app)                             Revalidate  Expire
┌ ○ /                                           5m      1y
├ ○ /_not-found                                 1h      1y
├ ○ /aktuelles                                  5m      1y
├ ● /aktuelles/[slug]
...
├ ○ /downloads                                  5m      1y
...
├ ○ /termine                                    5m      1y
├ ● /seiten/[...slug]
```

All the public pages are now `○` (Static with ISR/revalidate of 5m or 1h) or `●` (SSG parameterized routes).
We have successfully eliminated the dynamic rendering (and the expensive per-request DB calls) for every single public page on the website!
The performance of this site will now be orders of magnitude faster.
## 2025-03-06 - Replacing Server Client with Static Client to Enable SSG
**Learning:** The public website was being dynamically rendered (`ƒ (Dynamic)`) because the `SiteLayout` and `sitemap.ts` were utilizing `getAllNavItems` and other queries that fetched data using the `createClient` from `@/lib/supabase/server`. Since that client invokes Next.js `cookies()` behind the scenes, Next.js was opting all public routes into dynamic rendering on-demand.
**Action:** Always use the `createStaticClient` from `@/lib/supabase/static` for public unauthenticated pages and queries (and replace CMS/editor functions like `getAllNavItems` with explicitly cached static equivalents like `getNavigation`) to ensure Next.js can fully cache them as Static (`○`) or SSG (`●`), reducing database roundtrips and significantly improving TTFB.
