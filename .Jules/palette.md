## 2024-05-18 - Added ARIA labels and titles to Block Editor actions
**Learning:** Found that the core `BlockEditor` component used `size="icon"` buttons for common actions (move up/down, delete) across all block types without descriptive text. This creates an accessibility barrier for screen readers and lacks helpful tooltips for mouse users.
**Action:** Always ensure icon-only actions, especially those repeated frequently in complex editors, have explicit `title` (for tooltips) and `aria-label` (for screen readers) attributes in the correct application language.
