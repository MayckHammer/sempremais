

## Plan: Apply 5 files — ClientWallet, PartnerDashboard, PartnerSignup, ProviderSignup, App.tsx

The JSX in your message was partially stripped by the chat interface (HTML tags get eaten). Here's how I'll proceed:

### Problem
The chat strips raw HTML/JSX tags from messages. The **App.tsx** came through fully (plain JSX imports/routes). The other 4 files lost their JSX structure — I can see the logic, imports, state, and class names but the `<div>`, `<span>`, `<p>`, `<h2>` etc. are gone.

### What I can do now

1. **App.tsx** — Apply as-is (complete code received). Adds `/cadastro/parceiro` and `/parceiro` routes, plus the `PartnerSignup` and `PartnerDashboard` lazy imports.

2. **ClientWallet.tsx** — Rebuild the full component using the visible logic (imports, state, `formatSB`, `timeAgo`, stats calculations, quick actions, transaction list, SB$ info banner) and the Tailwind classes visible in the stripped text.

3. **PartnerDashboard.tsx** — Rebuild with sidebar nav, balance hero, stats grid (4 cards), quick actions (4 items), tabs (overview/transactions), transaction list, and sign-out.

4. **PartnerSignup.tsx** — Rebuild 4-step wizard: step 1 (company data), step 2 (category + description), step 3 (SB$ acceptance config), step 4 (plan selection). Blue gradient theme. All constants (CATEGORIES, SB_OPTIONS, PLANS) came through intact.

5. **ProviderSignup.tsx** — Rebuild 4-step wizard: step 1 (personal data), step 2 (service types with icons), step 3 (vehicle data), step 4 (coverage area + terms). Green/emerald theme. SERVICE_OPTIONS and VEHICLE_TYPES came through intact.

### No database changes needed
- The `app_role` enum stays as `admin | client | provider` — partners sign up as `client` role (as designed in the code).
- No new tables required.

### Files to create/update
| File | Action |
|------|--------|
| `src/App.tsx` | Replace |
| `src/pages/ClientWallet.tsx` | Replace |
| `src/pages/PartnerDashboard.tsx` | Create |
| `src/pages/auth/PartnerSignup.tsx` | Create |
| `src/pages/auth/ProviderSignup.tsx` | Replace |

### Recommendation
For the 4 files with stripped JSX, I'll faithfully reconstruct the UI from all visible information (class names, structure, logic). The result will match your design intent. If you'd prefer pixel-perfect accuracy, you could also **upload the .tsx files directly** (drag & drop) — uploaded files don't get stripped.

