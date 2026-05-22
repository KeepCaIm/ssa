// js/core/StellarisSaveParser.js
import { parseSaveFile } from '../parser/tokenizer.js';
import { SemanticEmpiresProcessor } from '../semantic/SemanticEmpiresProcessor.js';
import { SemanticSystemsProcessor } from '../semantic/SemanticSystemsProcessor.js';

/**
 * StellarisSaveParser
 * Centralized telemetry pipeline orchestrator converting raw files into semantic data collections.
 */
export class StellarisSaveParser {
  static async parseFile(file) {
    try {
      // Step 1: Raw file decompression and syntax tokenization
      const parsedJson = await parseSaveFile(file);
      
      // Step 2: Extraction using symmetric class processors conforming to semantic manifest rules
      const empires = SemanticEmpiresProcessor.run(parsedJson.country);
      const systems = SemanticSystemsProcessor.run(parsedJson); 
      
      return { empires, systems };
    } catch (err) {
      throw new Error(`Orchestration failure in semantic layer mapping: ${err.message}`);
    }
  }
}
