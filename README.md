# 🌌 STELLARIS SAVE ANALYZER (SSA)

An offline, lightning-fast strategic analyzer and tactical locator for massive Stellaris `.sav` files. Engineered explicitly as a high-performance Browser Client Single Page Application (SPA) without server-side processing dependencies or heavy computation loops.

🤖 **AI-Engineered (Vibe-Coding)**: This entire project—from the data pipelines and custom AST tokenization to the canvas rendering matrices and visual component modularization—was fully developed through iterative AI collaboration.

🔗 **Production URL**: [keepcaim.github.io/ssa/](https://keepcaim.github.io/ssa/)

---

## 🚀 PROJECT ARCHITECTURE

The application enforces a strict separation of concerns, isolating low-level data parsing from core business arithmetic and visual layout managers to ensure smooth layout execution and rendering thread integrity.

### 📁 Workspace Directory Structure

```text
├── 📜 index.html                 # Main application client HTML framework markup
├── 📂 build/
│   └── 📜 bundle.js              # Production compiled client bundle
└── 📂 js/
    ├── 📜 app.js                 # Lightweight application bootstrap runner
    │
    ├── 📂 core/                  # Orchestration & Ingestion Layer
    │   ├── 📜 StellarisSaveParser.js # Coordinates parsing pipelines to semantic models
    │   └── 📜 StorageManager.js     # Manages hardware-accelerated save file ingestion
    │
    ├── 📂 parser/                # Low-Level Syntax Parsing
    │   ├── 📜 unzip.js              # Native stream DecompressionStream extractor
    │   ├── 📜 tokenizer.js          # Clausewitz AST regular expression tokenizer
    │   ├── 📜 ParadoxNameResolver.js# Strips engine tracking codes & localizes text tokens
    │   └── 📜 rawSchema.js          # Declarative RAW JSON schema manifest for AI models
    │
    ├── 📂 semantic/              # Calculation & Semantic Models
    │   ├── 📜 schema.js             # Declarative SEMANTIC schema manifest for AI models
    │   ├── 📜 SemanticEmpiresProcessor.js # Normalizes and parses country database records
    │   ├── 📜 SemanticSystemsProcessor.js # Maps galactic coordinate yields and ownership
    │   ├── 📜 SystemDataHelpers.js   # Calculus subroutine mapping planet payloads
    │   ├── 📜 UniversalSortEngine.js # Refactored pure functional configuration-driven sorting engine
    │   ├── 📜 SystemConstants.js    # Strategic resource static yield directories
    │   └── 📜 ArcFurnaceEvaluator.js # Automated celestial eligibility verification rulebook
    │
    └── 📂 view/                  # Visual Rendering & Interface Layouts
        ├── 📂 components/        # Shared Reusable Layout Elements
        │   ├── 📜 SciFiButton.js    # Custom glowing tactical form buttons
        │   ├── 📜 SciFiTable.js     # Streamlined data grid with dynamic scrolling and dataKey mappings
        │   └── 📜 SciFiBadge.js     # Reusable tactical badge element with decoupled click actions
        │
        ├── 📂 map/               # Self-Contained HTML5 Canvas Viewport
        │   ├── 📜 MapCamera.js      # Zoom/pan projection matrix and bounding boxes
        │   ├── 📜 MapRenderer.js    # High-performance hyperlane vector matrices
        │   ├── 📜 MapInteractionManager.js # Decoupled dragging and canvas click tracker
        │   └── 📜 MapScreen.js      # Vector workspace graph panel coordinator
        │
        ├── 📂 systems/           # Isolated Solar Domain Module Subsystem
        │   ├── 📜 SystemsColumnConfig.js # Declarative column settings for systems grid
        │   ├── 📜 SystemsRendererHelper.js # Casing and mapping utilities for stellar systems
        │   ├── 📜 SystemsRenderer.js # Polymorphic star and fast transit visual engine
        │   └── 📜 SystemsScreen.js # High-performance clean-data candidates layout coordinator
        │
        ├── 📜 EmpiresRenderer.js     # Row badge and ethic node string formatter
        ├── 📜 EmpiresScreen.js       # Galactic factions dashboard view panel
        ├── 📜 FaqScreen.js           # Actionable step-by-step workflow guide
        ├── 📜 SciFiNavGroup.js       # Tab navigation matrix coordinator
        └── 📜 StellarisSpa.js        # Core interface shell and screen viewport router
```

---

## 📊 WORKBENCH INTERFACE CAPABILITIES

### 1. Empires Directory View
*   **Entity Identification**: Indexes galactic factions mapping localized title flags and automatically computes 3-4 letter acronym tags.
*   **Ideology Matrix Badges**: Displays classifications, ethics trees, and active civics vectors dynamically as color-coded terminal badges.
*   **Sovereign Ranking**: Features live numeric sorting on Victory Scores, immediately floating top-tier galactic heavyweights.
*   **Atomic Badge Sort**: Left-clicking any inline Ethic, Civic, or Empire Type badge instantly clusters the table rows around that specific classification.

### 2. System Locator Grid
*   **Unified Resource Aggregations**: Segregates cumulative cosmic yields across discrete granular strategic categories (Alloys, Energy, Minerals, Research sciences, Rare strategics).
*   **Arc Furnace Optimization**: Evaluates celestial sub-body fields, filters out pre-existing system configurations, and tracks exact locations of unbuilt candidate systems.
*   **Starbase Sorting**: Immediately isolates system coordinates by upgraded outpost station level (Starports, Citadels).
*   **Context Preservation**: Selection checkboxes are cached across layout switches, preventing filters from resetting when screen jumps occur.

### 3. Galaxy Map View
*   **Transformation Cam Matrices**: Features cursor-relative mousewheel zooms, viewport graph boundary fitting, and node detection bounding fields.
*   **Tactical Overlay Radios**: Toggles on demand between standard baseline hyperlane networks and deep spatial bypass networks.
*   **Analytical Vector Channels**: Maps natural wormhole anomalies using explicit link reference indices drawn as high-contrast dashed lines.
*   **Jump Intercept Transitions**: Left-clicking any system node on the canvas instantly focuses your coordinates back to that specific row in the System Locator grid.

### 4. Tactical Operations Manual
*   **Actionable Documentation**: Provides a quick step-by-step blueprint guiding interface filter combinations to isolate peak industrial candidate coordinates.

---

## ⚙️ DEVELOPMENT PIPELINE & COMPILER SPECS

The project operates entirely on native ECMAScript Modules (ESM) packed via a streamlined local development toolchain.

```bash
# Install toolchain environments 
npm install

# Spin up live file bundlers and development servers simultaneously
npm start
```
