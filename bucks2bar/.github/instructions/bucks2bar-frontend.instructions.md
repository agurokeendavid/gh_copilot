---
description: "Use when editing frontend files in this repository to enforce architecture, accessibility, and dependency rules for Bucks2Bar."
name: "Bucks2Bar Frontend Conventions"
applyTo: ["**/*.html", "**/*.css", "**/*.js"]
---
# Bucks2Bar Frontend Conventions

- Keep the app as a static frontend: no backend code, no build pipeline, and no framework migration unless explicitly requested.
- Preserve Bootstrap tab structure and IDs used by JavaScript behavior (`data-tab`, `chart-tab`, `chart-pane`, `monthly-form`, `monthly-rows`, `incomeExpenseChart`, `download-chart`).
- Maintain accessibility semantics in generated and static markup: labels, `aria-*` attributes, and table-like roles for the monthly grid.
- Keep styling token-driven through `:root` CSS variables; prefer extending existing variables before introducing one-off hardcoded colors.
- Prefer the current typography direction (Space Grotesk + Sora) and clean dashboard visual tone; this is a style preference and may be adjusted when feature requirements need it.
- Preserve responsive behavior for small screens, especially the monthly grid collapse and chart container minimum height.
- In JavaScript, prefer small pure helpers and guard clauses, and avoid introducing global mutable state beyond the existing `monthlyData` and `chartInstance` flow.
- Preserve locale-aware currency formatting through `Intl.NumberFormat`; avoid hardcoding symbol-only formatting.
- Do not replace, upgrade, or swap Chart.js or Bootstrap dependencies unless explicitly requested.
- Validate changes end-to-end for data entry, chart updates, tab switching, and chart download behavior.

# UI Elements
- All buttons must be a pick color.