/**
 * SYSTEM_STATIC_REGISTRY
 * Centralized mapping matrix separating raw Clausewitz asset definitions
 * from visual presentation loops and processing algorithms.
 */
export const SYSTEM_STATIC_REGISTRY = {
  // Mapping definitions for individual orbital node strategic yields
  depositCategories: [
    { key: "energy", cat: "e", defVal: 2 },
    { key: "mineral", cat: "m", defVal: 2 },
    { key: "mining", cat: "m", defVal: 2 },
    { key: "alloy", cat: "a", defVal: 2 },
    { key: "physics", cat: "p", defVal: 3 },
    { key: "society", cat: "s", defVal: 3 },
    { key: "engineering", cat: "g", defVal: 3 },
    { key: "research", cat: "p", defVal: 3 }
  ],
  // Map strings for spec specials
  specials: ["dark_matter", "living_metal", "volatile_motes", "rare_crystals", "exotic_gases"],
  // Mapping configuration arrays for megastructure UI symbols and reader strings
  megastructures: [
    { key: "dyson_sphere", icon: "🟡", name: "Dyson Sphere" },
    { key: "dyson_swarm", icon: "🐝", name: "Dyson Swarm" },
    { key: "gateway", icon: "🚪", name: "Gateway" },
    { key: "lgate", icon: "🔒", name: "L-Gate Hub" },
    { key: "arc_furnace", icon: "🔥", name: "Arc Furnace" },
    { key: "matter_decompressor", icon: "🗜️", name: "Matter Decompressor" },
    { key: "quantum_catapult", icon: "🎯", name: "Quantum Catapult" },
    { key: "habitat", icon: "🛸", name: "Orbital Habitat" },
    { key: "hyper_relay", icon: "⛓️", name: "Hyper Relay" },
    { key: "shipyard", icon: "⚓", name: "Mega Shipyard" },
    { key: "spy_orb", icon: "👁️", name: "Sentry Array" },
    { key: "strategic", icon: "⚔️", name: "Strategic Coordination" },
    { key: "think_tank", icon: "🧠", name: "Science Nexus" },
    { key: "orbital_ring", icon: "⭕", name: "Orbital Ring" },
    { key: "ring_world", icon: "🪐", name: "Ring World Segment" },
    { key: "interstellar_assembly", icon: "🏛️", name: "Interstellar Assembly" },
    { key: "crisis_sphere", icon: "💀", name: "Aetherophasic Engine" },
    { key: "grand_archive", icon: "📚", name: "Grand Archive" },
    { key: "dyson_slingshot", icon: "☄️", name: "Dyson Slingshot" }
  ]
};
