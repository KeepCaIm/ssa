// js/parser/rawSchema.js

/**
 * RAW_SCHEMA_MANIFEST
 * Structural definition of the raw tokenized Clausewitz gamestate object.
 * VERIFIED: Matches exact object keys processed by Semantic processors.
 */
export const RAW_SCHEMA_MANIFEST = {
  description: "Raw JS object tree generated directly after text tokenization, preserving native Paradox nesting.",
  
  // Maps the precise functional architecture responsible for compiling this contract
  producedBy: {
    module: "js/parser/tokenizer.js",
    methods: [
      "parseParadoxTxt(text) - Executes regex tokenization loops converting text to raw JSON.",
      "parseSaveFile(file) - Orchestrates decompression stream ingestion directly to tokenizer."
    ]
  },

  structure: {
    country: {
      "[country_id]": {
        name: "Object|string - Raw name node containing localization keys or variable arrays.",
        type: "string - Faction tier descriptor (e.g., 'default', 'fallen_empire').",
        victory_score: "string - Numeric score stored as string formatting.",
        ethos: {
          ethic: "string|string[] - Active ideology strings (or single string if only one exists)."
        },
        government: {
          civics: "string[]|Object - Array or tokenized block holding internal civic vectors. May use _list."
        },
        fleets_manager: {
          owned_fleets: "Object|Object[] - Managed military/civilian fleet pointers utilizing the _list wrapper."
        }
      }
    },
    galactic_object: {
      "[system_id]": {
        name: "Object|string - Raw system title descriptor node.",
        star_class: "string - Internal engine class identity string (e.g., 'sc_black_hole').",
        coordinate: {
          x: "string - Decimal floating coordinate tracking spatial X-axis position.",
          y: "string - Decimal floating coordinate tracking spatial Y-axis position."
        },
        starbases: "Object|string|string[] - Reference tracking upgraded station manager indices. Can use _list.",
        hyperlane: "Object|Object[] - Multi-line array structs holding 'to' target reference keys. Uses _list.",
        planet: "string[]|Object - Target indices mapping tracking arrays of solar planet identifiers. Uses _list.",
        megastructures: "string[]|Object - Target reference indices tracking local built engineering tasks. Uses _list.",
        bypasses: "string[]|Object - Pointer keys registering local activated transit gateway structures. Uses _list.",
        natural_wormholes: "string|undefined - Flag checking base anomaly node presences.",
        flags: "Object - Local custom engine string markers tracker."
      }
    },
    planets: {
      "[planet_id]": {
        name: "Object|string - Raw planetary or moon orbital node name layout.",
        planet_class: "string - Native physical planet class (e.g., 'pc_molten', 'pc_continental').",
        owner: "string|undefined - Country key ID reference string if space is colonized.",
        colonizable: "string|undefined - Flag field check (e.g., 'yes')."
      }
    },
    deposit: {
      "[deposit_id]": {
        type: "string - Strategic deposit key identifying item yields (e.g., 'd_minerals_3').",
        deposit_holder: {
          type: "string - Holder classification category code (e.g., 'planet', 'pc', '0').",
          id: "string - Index reference targeting the holding planet body node."
        }
      }
    },
    starbase_mgr: {
      starbases: {
        "[starbase_id]": {
          station: "Object|string - Internal pointer link tracking core components.",
          level: "string - Upgraded module level name string (e.g., 'starbase_level_outpost')."
        }
      }
    },
    bypasses: {
      "[bypass_id]": {
        type: "string - Functional bypass category identity string.",
        linked_to: "string|Object|undefined - Destined exit node layout reference tracker index."
      }
    },
    fleet: {
      "[fleet_id]": {
        ships: "string[]|Object - Array tracking separate physical space combat/civilian ship identifiers. Uses _list."
      }
    }
  }
};
