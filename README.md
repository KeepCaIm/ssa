# 🌌 STELLARIS SAVE ANALYZER — DEVELOPMENT ARCHITECTURE ARCHIVE

An offline, lightning-fast strategic analyzer and tactical locator for massive Stellaris `.sav` files. Engineered explicitly as a high-performance Browser Client SPA without server-side processing dependencies or heavy un-nesting computation loops.

---

## 🚀 CURRENT STAGE & PROGRESS MATRIX

The project has been fully optimized, decoupled, and shifted toward a global theme design system (`STELLARIS_UI`). All active relational data pipelines have been verified against native Clausewitz structures.

### 🔮 Completed Implementations
- **Clausewitz Relational Link Resolver**: Resolves multi-line links on the fly (`galactic_object` -> `starbase_mgr` -> `fleet` -> `country`) avoiding deep nested evaluation performance penalties.
- **Resource Segregation & Decomposition**: Processes, summarizes, and splits system and star nodes outputs across 7 discrete granular categories: Energy (`⚡`), Minerals (`⛏️`), Alloys (`🛡️`), Physics (`⚛️`), Society (`🍃`), Engineering (`⚙️`), and Specials (`🔮`), derived accurately from the global `deposit` block.
- **Dynamic Interactive Sorting Dashboard**: Main, continuous table views cache persistent column IDs and asc/desc sorting orders across view screens flips.
- **Tactical Transit Canvas Map Overlays**: A fully functional Radio Group controller on the Map view switches between Standard map vectors and deep bypass systems (`wormhole`, `gate`, `lgate`, `shroud`). Unmatched background system nodes fade evenly, and **Wormholes are bound analytically using their explicit `linked_to` reference indices drawn as high-contrast dashed vector channels**.
- **Interactive Component Sort Triggers**: Click action handlers bound to any individual built Megastructure badge or Fast Transit portal instantly prioritize and float all matching star systems directly to the top line of the datagrid wrapper.

---

## 📂 EXTENDED SYSTEM STRUCTURE

```text
index.html                  # Application Root Bootstrap.
js/
├── app.js                  # Router & State Orchestrator. Keeps camera, checked, and sort caches.
├── core/
│   ├── Theme.js            # STELLARIS_UI design matrix constants, common styles, and color lookup keys.
│   ├── Decompressor.js     # Async hardware-accelerated DecompressionStream unzipper engine.
│   ├── StorageManager.js   # Abstracts manual selection loops and automatic local polling scanners.
│   ├── Parser.js           # Custom AST Tokenizer preserving multi-line structural duplicating rows arrays.
│   ├── NameResolver.js     # Normalizes text structures (strips SPEC_, PREFIX_ tokens variables).
│   ├── ProcessorEmpires.js # Extracts country entries, civic vectors, tech ranks, and fleet blocks.
│   ├── ProcessorSystems.js # Maps coordinates (rotated 180°), levels, and structural link hashes.
│   └── SystemDataHelpers.js# Decoupled analytical core parsing planets, megastructures, and bypass datasets.
├── components/
│   ├── Button.js           # Animated glowing SciFiButton component framework.
│   ├── Map.js              # Multi-layer canvas interaction supervisor context.
│   ├── MapCamera.js        # True mouse-relative coordinate zoom scalar and graph bounds logic.
│   ├── MapRenderer.js      # Blends background grids, vector lanes, and tactical dashed travel linkages.
│   ├── Table.js            # SciFiTable with master toggles, sticky pinning headers, and smooth scrollTo focus loops.
│   └── SystemRenderers.js  # Presentation component isolating DOM badge logic and interactive click sort vectors.
└── screens/
    ├── ScreenEmpires.js    # Empire selection overview table supporting active checkbox memory.
    ├── ScreenSystems.js    # Systems matrix dashboard stripped of score loops to fit 7-channel asset layouts.
    └── ScreenMap.js        # Canvas frame coordinator holding tactical overlay selector triggers.
```

---

## 🤖 CRITICAL ARCHITECTURAL CONSTRAINTS FOR FUTURE SESSIONS

To safeguard thread configurations and runtime synchronization integrity during future expansions, the following rules must be rigidly followed:

1. **THE Max 8KB RULE**: Code footprints **MUST** stay strictly beneath `8000 characters` per file. If any module approaches this limit during expansion, immediately extract logic into sub-components or core helper classes (mirroring `SystemDataHelpers.js` or `SystemRenderers.js`).
2. **MARKUP ESCAPE SAFETY**: Never pass raw mathematical token operators (`<` or `>`) inside looping blocks or template lines. They collide with stream parsers and truncate structures. Use explicit structural checks (`length === 0`), conditional negation flags, or reverse comparisons instead.
3. **CLAUDEWITZ DATA LAYOUT SECURITIES**:
   - **Primary Star Position Rule**: The core star establishing a system's class is **always located inside the 0-th element index slot** of the system's `planet = { ... }` array array. Never look up stars directly against the `s.star` scalar ID value, which maps internally to custom initializer entities.
   - **Megastructure Nested Core Mapping**: Megastructures belong under the nested `rootJson.megastructures` or `rootJson.megastructure` split blocks. Check fallback lists and arrays during scans.
   - **Wormholes Analytical Vector Coupling**: To trace genuine wormhole connections, do not guess distances geometrically. Parse the system's internal `bypasses` array index to isolate its global item record under `rootJson.bypasses`. Match the pair strictly if `systemA.wormholeTargetIndex === systemB.wormholeGlobalIndex`.
4. **DESIGN SYSTEM ADHERENCE**: All common presentation colors, variables, fonts, and inline styles must query properties using the centralized `STELLARIS_UI` template constant layer inside `js/core/Theme.js`. Do not write hardcoded color primitives or static design weights into local component files.
