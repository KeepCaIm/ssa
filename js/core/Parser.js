import { unzipGamestateAsync } from './Decompressor.js';
import { ProcessorEmpires } from './ProcessorEmpires.js';
import { ProcessorSystems } from './ProcessorSystems.js';

/**
 * StellarisSaveParser
 * Custom high-performance tokenizing scanner tailored for Clausewitz syntax structures.
 * Avoids deep regex stack blowouts and captures multi-line duplicated block arrays.
 */
export class StellarisSaveParser {
  static async parseFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const gamestateText = await unzipGamestateAsync(arrayBuffer);
      const parsedJson = this.parseParadoxTxt(gamestateText);
      
      const empires = ProcessorEmpires.run(parsedJson.country);
      const systems = ProcessorSystems.run(parsedJson); 
      
      return { empires, systems };
    } catch (err) {
      throw new Error(`Orchestration failure: ${err.message}`);
    }
  }

  static parseParadoxTxt(text) {
    const root = {};
    const stack = [root];
    let current = root;
    const tokenRegex = /([a-zA-Z0-9_.\-]+)|"([^"]*)"|([{}=])/g;
    let match = null;
    let lastKey = null; 
    let expectingValue = false;

    while ((match = tokenRegex.exec(text)) !== null) {
      const token = match[1] || match[2] || match[3];
      
      if (token === "=") { 
        expectingValue = true; 
        continue; 
      }
      
      if (token === "{") {
        const nextObj = {};
        if (lastKey !== null) {
          if (current[lastKey] !== undefined) {
            if (!Array.isArray(current[lastKey])) {
              current[lastKey] = [current[lastKey]];
            }
            current[lastKey].push(nextObj);
          } else { 
            current[lastKey] = nextObj; 
          }
        } else {
          if (current._list === undefined) {
            current._list = [];
          }
          current._list.push(nextObj);
        }
        stack.push(nextObj); 
        current = nextObj; 
        lastKey = null; 
        expectingValue = false; 
        continue;
      }
      
      if (token === "}") {
        stack.pop(); 
        current = stack[stack.length - 1] || root; 
        lastKey = null; 
        expectingValue = false; 
        continue;
      }
      
      if (expectingValue === true) {
        if (lastKey !== null) {
          if (current[lastKey] !== undefined) {
            if (!Array.isArray(current[lastKey])) {
              current[lastKey] = [current[lastKey]];
            }
            current[lastKey].push(token);
          } else { 
            current[lastKey] = token; 
          }
        }
        lastKey = null; 
        expectingValue = false;
      } else {
        lastKey = token;
        
        // Save the scanner's current matching tracker position index
        const savedIndex = tokenRegex.lastIndex;
        const nextMatch = tokenRegex.exec(text);
        // Safely reset lookup pointer boundary right back to prevent string slice degradation
        tokenRegex.lastIndex = savedIndex; 
        
        const nextToken = nextMatch ? (nextMatch[1] || nextMatch[2] || nextMatch[3]) : null;
        if (nextToken !== '=') {
          if (current._list === undefined) {
            current._list = [];
          }
          current._list.push(lastKey); 
          lastKey = null;
        }
      }
    }
    return root;
  }
}
