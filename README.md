# 🌌 STELLARIS SAVE ANALYZER (SSA)

An offline, lightning-fast strategic analyzer and tactical locator for massive Stellaris `.sav` files. Engineered explicitly as a high-performance Browser Client Single Page Application (SPA) without server-side processing dependencies or heavy un-nesting computation loops.

🤖 **AI-Engineered (Vibe-Coding)**: This entire project—from core data pipelines and custom AST tokenization to canvas rendering matrices and layout design systems—was fully developed through iterative AI collaboration, bypassing traditional manual coding loops.

🔗 **Production URL**: [github.io](https://keepcaim.github.io/ssa/)

---

## 🚀 CURRENT PRODUCTION FUNCTIONALITY

The application operates as a centralized, lightweight telemetry workbench parsing uploaded save files dynamically in the browser environment.

### 🧠 Core Subsystems Matrix

*   **Decompression Layer**: Integrates the native browser `DecompressionStream` API using `deflate-raw` rules to read and unpack the inner `gamestate` binary file on the fly.
*   **Clausewitz Tokenizer**: Uses a custom iterative regular expression loop to parse nested block structures, avoiding deep engine recursion stacks while preserving duplicated properties like arrays.
*   **Theme Design Matrix**: Queries terminal styling primitives from a centralized properties dictionary, managing all interface colors and borders from a single module.

---

## 📊 DASHBOARD SCREEN CAPABILITIES

### 1. Empires Directory View
*   **Entity Identification**: Indexes every galactic faction with dynamic 3-4 letter acronym tag generations.
*   **Political Telemetry**: Displays classifications, ethics profiles, and active civics mapped cleanly as color-coded badges.
*   **Sovereign Ranking**: Features live numeric sorting on Victory Scores, immediately floating top-tier galactic heavyweights.
*   **Context Preservation**: Caches master selection checkboxes across view screens, avoiding resetting your filters.

### 2. System Locator Grid
*   **Unified Resource Aggregations**: Segregates cumulative cosmic yields across 7 discrete granular categories based on real, natural tile blocks.
*   **Arc Furnace Optimization Locator**: Evaluates potential targets, checks baseline factors, and filters out pre-built station modifiers.
*   **Badge Group Sorting**: Floats systems containing megastructures or fast transit loops directly to the front rank of data table rows.
*   **Instant Viewport Focusing**: Resets scrolling coordinates back to top-line indexes automatically upon sorting changes.

### 3. Galaxy Map View
*   **Transformation Pan Matrices**: Features cursor-relative zooming, graph boundary fitting, and node detection bounding fields.
*   **Tactical Overlay Radio Groups**: Toggles between standard lanes and deep bypass options like gateways, L-gates, or shroud tunnels.
*   **Analytical Wormhole Vector Channels**: Maps wormholes using explicit link reference indices drawn as high-contrast dashed channels.
*   **Jump Intercept Transitions**: Allows clicking individual system nodes on the map to jump directly to that row in the Locator view.

### 4. Tactical Operations Manual
*   **User Guide Ingestion**: Provides quick step-by-step documentation detailing how to combine filters to map optimal coordinates.

---

## ⚙️ TECHNICAL ENGINE SPECIFICATIONS

*   **Interface Layer**: Vanilla ECMAScript Modules (ESM) without build tools or external dependency package overheads.
*   **Presentation Architecture**: HTML5 Canvas API grids with responsive coordinate multipliers.
*   **Memory Footprint**: Strictly adheres to a `<8000 characters` rule per component module to protect stream runtime thread integrity.
*   **Parsing Protections**: Employs structural equality transformations instead of standard math operators to ensure template safety.
