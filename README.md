# 🌌 STELLARIS SAVE ANALYZER (SSA)

An offline, lightning-fast strategic analyzer and tactical locator for massive Stellaris `.sav` files. Engineered explicitly as a high-performance Browser Client Single Page Application (SPA) without server-side processing dependencies or heavy computation loops.

🔗 **Production URL**: [keepcaim.github.io/ssa/](https://keepcaim.github.io/ssa/)

---

## 🚀 PROJECT ARCHITECTURE

The application enforces a strict separation of concerns, isolating low-level data parsing from core business arithmetic and visual layout managers to ensure smooth layout execution and rendering thread integrity.

The pipeline is organized into distinct, decoupled conceptual layers:
*   **Ingestion Layer**: Coordinates hardware-accelerated local save file loading and utilizes native browser `DecompressionStream` for lightning-fast stream decompression.
*   **Low-Level Parser**: Tokenizes the custom Clausewitz engine syntax via optimized text-scanning pipelines and resolves Paradox tracking engine codes to localized strings.
*   **Semantic Models**: Normalizes raw data structures into highly optimized functional models, mapping galactic coordinate yields, sorting factions, and verifying celestial eligibility.
*   **High-Performance View**: Drives the layout routing shell, custom scifi UI components, and rendering managers, including a responsive HTML5 Canvas galaxy map overlay engine.


---

## ⚙️ DEVELOPMENT & DEPLOYMENT PIPELINE

The project runs entirely on modern native ECMAScript Modules (ESM) powered by a lightweight **Vite** toolchain environment.

### Local Development
To spin up the lightning-fast development server with instant Hot Module Replacement (HMR) and precise IDE breakpoint debugging, run:

```bash
# Install the Vite runtime environment
npm install

# Start the local development HMR server
npm start
```
