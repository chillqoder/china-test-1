# Project Brief: NOMAD COMPASS — Southeast Asia Cost of Living Explorer

**Role:** Senior Creative Technologist & Lead Frontend Engineer with deep expertise in data visualization, UX storytelling, and motion design. You are being evaluated on design quality — this is your portfolio moment. Deliver your absolute creative maximum.

**Objective:** Build a stunning, fully functional two-page Next.js web application that helps digital nomads, travelers, and expats understand the real cost of living across Southeast Asian countries. The application must feel like a premium editorial product — not a spreadsheet, not a Wikipedia page. Every interaction should spark curiosity and make the user want to pack their bags.

**Design Freedom:** You choose the typography, color system, visual language, and motion vocabulary. Make bold decisions. The design must feel intentional, refined, and original — not generic AI output. Surprise us.

> ⚠️ **Design Evaluation Notice:** This project is being used to benchmark AI design capabilities. You are expected to produce your highest-quality visual and interaction design output. If the result looks like a default template, it has failed. Push every element to its creative limit.

---

## 1. DATA REQUIREMENTS

**You must research, compile, and hardcode all data yourself.** There is no external API and no pre-supplied dataset. Use your knowledge to construct realistic, accurate cost-of-living data for the following countries and cities.

### Countries to include:
- 🇹🇭 Thailand
- 🇻🇳 Vietnam
- 🇮🇩 Indonesia
- 🇲🇾 Malaysia
- 🇵🇭 Philippines
- 🇰🇭 Cambodia
- 🇱🇦 Laos
- 🇲🇲 Myanmar

### For each country, provide data for 3 cities:
- **Large city** — the major capital or metropolis (e.g., Bangkok, Ho Chi Minh City)
- **Mid-size city** — a regional hub or popular destination (e.g., Chiang Mai, Da Nang)
- **Small city / town** — a quieter, off-the-beaten-path location (e.g., Pai, Hoi An)

### Data categories per city (monthly estimates in USD):
| Category | Details |
|----------|---------|
| 🏠 **Housing** | Monthly rent for a 1-bedroom apartment |
| 🍜 **Food** | Monthly grocery budget for one person |
| ☕ **Café** | Average spend per café visit |
| 🌐 **Internet** | Monthly broadband/fiber cost |
| 🚕 **Transport** | Monthly transport budget (taxi + public) |

All values must be realistic and based on actual regional knowledge. Prices in USD. Show approximate local currency equivalent as a secondary label.

---

## 2. APPLICATION STRUCTURE

### Page 1 — Welcome / Hero

A single, immersive welcome screen that communicates the purpose of the application. This is NOT a full landing page — it is a focused, emotionally resonant entry point.

**Must include:**
- A compelling headline that captures the spirit of the project (freedom, discovery, affordability, Asia)
- A short paragraph (2–3 sentences) explaining what the app does and who it's for
- A clear, animated call-to-action that leads the user to the dashboard
- Visual elements that evoke Southeast Asia — use abstract shapes, patterns, or typographic elements (no stock photo placeholders). Be creative.
- An ambient animated background — particles, gradients, geometric patterns, floating elements — your call
- The page must feel alive, not static

**Tone:** Adventurous, warm, inviting. The user should feel like they're about to open a treasure map.

### Page 2 — Country Dashboard

The core of the application. A data-rich, beautifully designed dashboard that lets users explore cost-of-living data across Southeast Asia.

**Layout & Navigation:**
- The dashboard opens showing all countries as cards in a grid
- A tab/filter bar at the top allows filtering by **data category**: All, Housing, Food, Café, Internet, Transport
- When a category tab is active, cards reorganize to highlight that category's data prominently
- Smooth animated transitions between tab states (layout shift must be animated, not jarring)

**Country Card design:**
Each card represents one country and must display:
- Country name + flag emoji
- Currency name and exchange rate to USD (approximate)
- A **city selector** — user can toggle between Large / Mid / Small city (tabs or a segmented control within the card)
- All 5 cost categories displayed for the selected city
- Visual emphasis on the active filter category (when a tab is active, highlight that row/value)
- A subtle "overall monthly estimate" total at the bottom of each card
- Cards must have hover states with meaningful interaction

**Filtering logic:**
- When a category tab is selected (e.g., "Housing"), all cards should visually reorganize or re-sort by that metric (cheapest → most expensive or most expensive → cheapest, with a toggle)
- Sort direction toggle must be clearly indicated and animated

**Comparison feature:**
- User can select up to 3 countries to "pin" for comparison
- Pinned cards are visually distinguished and float to the top of the grid
- A compact comparison strip or panel shows the pinned countries side-by-side for the active category

---

## 3. INTERACTION & ANIMATION REQUIREMENTS

You must invent and implement original animations throughout the app. This is a core requirement, not a nice-to-have.

**Required animation moments:**
- **Page 1 → Page 2 transition:** Full-screen, cinematic. Not a default Next.js page change.
- **Hero entrance:** Elements animate in with a choreographed sequence on first load
- **Dashboard card entrance:** Cards stagger-animate in when the dashboard loads
- **Tab switching:** Animated reflow of cards when categories change
- **City toggle within card:** Smooth number transition when switching between city sizes (numbers count up/down)
- **Hover states:** Cards, buttons, and interactive elements must all have fluid hover animations
- **Sort animation:** Cards physically move/reorder with spring physics when sort order changes
- **Comparison highlight:** When a country is pinned, its card animates distinctively

Use whatever animation approach fits your stack — Framer Motion, CSS keyframes, GSAP, or native CSS transitions. The motion must feel intentional and premium, not bouncy or gimmicky.

---

## 4. TECHNICAL REQUIREMENTS

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Your choice — Tailwind CSS, CSS Modules, styled-components. Make it work beautifully.
- **Animation library:** Your choice — Framer Motion recommended, but use whatever produces the best result
- **State management:** React state is sufficient — no Redux, no backend
- **No authentication** — this is a pure data exploration tool, fully public
- **No external API calls** — all data is hardcoded in a structured data file (`/data/countries.ts` or similar)
- **Responsive:** Must work on desktop (primary), tablet, and mobile. The dashboard grid collapses gracefully on smaller screens.
- **Performance:** Animations must not cause layout thrash. Use `transform` and `opacity` for all motion. Lazy load anything heavy.
- **Code quality:** Clean component architecture. Each country card is its own component. Data is fully typed. No `any` types. No placeholder content — every field is populated.

---

## 5. DATA FILE STRUCTURE (suggested)

```typescript
// /data/countries.ts

export type CitySize = 'large' | 'mid' | 'small';

export type CostCategory = 'housing' | 'food' | 'cafe' | 'internet' | 'transport';

export interface CityData {
  name: string;
  housing: number;      // USD/month
  food: number;         // USD/month
  cafe: number;         // USD/visit
  internet: number;     // USD/month
  transport: number;    // USD/month
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  currency: string;
  currencyCode: string;
  usdRate: number;      // 1 USD = X local currency
  cities: {
    large: CityData;
    mid: CityData;
    small: CityData;
  };
}

export const countries: Country[] = [ /* your researched data */ ];
```

---

## 6. DESIGN PHILOSOPHY

**You have full creative control over:**
- Color palette (choose something unexpected and beautiful — not tropical clichés)
- Typography (pick 1–2 Google Fonts or system fonts that create strong visual hierarchy)
- Layout geometry (cards, grids, spacing, proportions)
- Iconography style
- Motion personality (is the app playful? Minimal? Bold? You decide — but commit fully)
- Background treatments, textures, gradients

**Design constraints you must not violate:**
- Typography must be legible at all sizes
- Data values must always be the most visually prominent element in each card
- The filter/tab system must be immediately understandable without instructions
- Color contrast must be accessible (WCAG AA minimum)
- The comparison feature must feel natural and discoverable, not buried

**Design anti-patterns to avoid:**
- Generic "travel app" blues and greens with palm tree icons
- Cards that look like Bootstrap components
- Animations that add delay without adding meaning
- Data tables disguised as dashboards
- Fonts that were chosen without intention

---

## 7. NARRATIVE INTENT

This app is for a specific person: someone sitting in a grey office in Berlin or Toronto, wondering if they could actually live in Southeast Asia. They open this app and for the first time, the numbers make the dream feel possible.

Every design decision should serve that moment of realization. The dashboard isn't just showing data — it's showing someone that $800/month in Chiang Mai buys a life they can't imagine affording at home.

**If the app feels like a utility, it has failed.**
**If it makes someone open a flight-search tab after using it, it has succeeded.**

---

> **Final Directive:** You are not building a data tool. You are building an invitation. The design, the motion, the typography, the color — every element must whisper: *"It's possible. You could actually do this."* Treat every pixel as a decision. Treat every transition as a sentence. This is your creative ceiling — reach it.
