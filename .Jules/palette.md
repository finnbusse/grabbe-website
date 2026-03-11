## 2024-05-18 - Tooltips for icon-only buttons
**Learning:** Found that many CMS builder toolbars have small icon-only buttons for actions like re-ordering or deleting items, which lack sufficient visual context or ARIA labels for users, causing potential accessibility issues and confusion.
**Action:** Always add `aria-label` AND standard HTML `title` to provide accessible names and native tooltips for purely visual icon buttons.
