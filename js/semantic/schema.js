// js/semantic/schema.js

/**
 * Structural definition of the normalized Semantic Gamestate Model.
 * This object serves as an immutable schema interface descriptor for AI agents.
 */
export const SEMANTIC_SCHEMA_MANIFEST = {
  empires: {
    description: "Normalized collection of galactic political factions.",
    structure: [{
      id: "string - Unique native save country identifier.",
      tag: "string - Dynamically generated 3-4 letter acronym tag.",
      name: "string - Localized or resolved display name of the empire.",
      type: "string - Classification tier (e.g., default, fallen_empire).",
      ethics: "string[] - Array of active socio-political ideological orientations.",
      civics: "string[] - Array of running governmental civic vectors.",
      score: "number - Current calculated Victory Score rank metric.",
      fleetIdsArray: "string[] - Direct index pointers to owned military and civilian fleets."
    }]
  },
  systems: {
    description: "Normalized galactic coordinate node data mapping yields, space infrastructure, and ownership.",
    structure: [{
      id: "string - Unique native galactic object database identifier.",
      name: "string - Sanitized display name of the solar system.",
      owner: "string - Nation country ID node string, or 'none' if unclaimed.",
      bodies: "number - Total count of planetary and celestial objects mapped in the node.",
      mapX: "number - Canvas coordinate projection coordinate multiplier for X-axis spatial mapping.",
      mapY: "number - Canvas coordinate projection coordinate multiplier for Y-axis spatial mapping.",
      linksArray: "string[] - Target galactic object indices defining hyperlane network lanes.",
      starbaseLevel: "string - Upgraded station tier (e.g., outpost, starport, citadel, or 'none').",
      star: {
        id: "string - Parent system ID index.",
        starIds: "string[] - Array tracking discrete planetary identifiers registered as structural solar stars.",
        type: "string - Combined stellar composition string description.",
        name: "string - Resolved primary or combination stellar name.",
        resourcesBreakdown: "Object - Resource yield categories found directly within the central star space.",
        totalStarRes: "number - Aggregated sum value of baseline star resources."
      },
      totalResources: "number - Cumulative resource yields present across all system planet blocks.",
      resourcesPayload: {
        e: "number - Energy Credits",
        m: "number - Minerals",
        a: "number - Alloys",
        p: "number - Physics Research",
        s: "number - Society Research",
        g: "number - Engineering Research (Geomancy)",
        n: "number - Rare/Strategic Exotic Materials"
      },
      celestialList: "Array - Parsed collection arrays of individual celestial planet properties.",
      hasMoltenWorld: "boolean - Flag declaring if system matches Arc Furnace primary targets.",
      arcEligibleCount: "number - Filtered sum total score quantifying ideal resource extraction spots for Arc Furnaces.",
      megastructures: "string[] - Active names or types of pre-built mega-engineering structures located here.",
      fastTravel: {
        wormhole: "boolean - Declares natural wormhole anomaly presence.",
        gate: "boolean - Tracks fully activated gateway network bypass nodes.",
        lgate: "boolean - Identifies explicit L-cluster vector points.",
        shroud: "boolean - Specifies active Psionic Shroud tunnel connection points.",
        wormholeGlobalIndex: "string|null - Unique identifier index mapping natural wormholes.",
        wormholeTargetIndex: "string|null - Destined target galactic system node connection path pointer."
      }
    }]
  }
};
