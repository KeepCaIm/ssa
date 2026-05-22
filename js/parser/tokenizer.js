// parser/tokenizer.js
import { unzipGamestateAsync } from './unzip.js';

/**
 * Parses Clausewitz text syntax into a raw JavaScript object structure.
 * @param {string} text - Raw gamestate text content
 * @returns {Object} Raw JSON-like object representation
 */
export function parseParadoxTxt(text) {
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
        if (current._list === undefined) current._list = [];
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
      const savedIndex = tokenRegex.lastIndex;
      const nextMatch = tokenRegex.exec(text);
      tokenRegex.lastIndex = savedIndex; 
      
      const nextToken = nextMatch ? (nextMatch[1] || nextMatch[2] || nextMatch[3]) : null;
      if (nextToken !== '=') {
        if (current._list === undefined) current._list = [];
        current._list.push(lastKey); 
        lastKey = null;
      }
    }
  }
  return root;
}

/**
 * Entry point for Stage 1 parser. Unpacks the zip and parses the internal structure.
 * @param {File} file - Uploaded .sav archive file reference
 * @returns {Promise<Object>} Raw JSON-mapped gamestate object
 */
export async function parseSaveFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const gamestateText = await unzipGamestateAsync(arrayBuffer);
    return parseParadoxTxt(gamestateText);
  } catch (err) {
    throw new Error(`Parser pipeline failure: ${err.message}`);
  }
}
