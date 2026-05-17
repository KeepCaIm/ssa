// @ts-nocheck
import { unzipGamestateAsync } from './Decompressor.js';
import { ProcessorEmpires } from './ProcessorEmpires.js';
import { ProcessorSystems } from './ProcessorSystems.js';

export class StellarisSaveParser {
  static async parseFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const gamestateText = await unzipGamestateAsync(arrayBuffer);
      const parsedJson = this.parseParadoxTxt(gamestateText);
      
      const empires = ProcessorEmpires.run(parsedJson.country);
      const systems = ProcessorSystems.run(parsedJson); 
      
      console.log(`[ORCHESTRATOR] AST Pipeline success. Empires: ${empires.length}, Systems: ${systems.length}`);
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
    let match, lastKey = null, expectingValue = false;

    while ((match = tokenRegex.exec(text)) !== null) {
      const token = match[1] || match[2] || match[3];
      if (token === "=") { expectingValue = true; continue; }
      if (token === "{") {
        const nextObj = {};
        if (lastKey !== null) {
          if (current[lastKey] !== undefined) {
            if (!Array.isArray(current[lastKey])) current[lastKey] = [current[lastKey]];
            current[lastKey].push(nextObj);
          } else { current[lastKey] = nextObj; }
        } else {
          if (!current._list) current._list = [];
          current._list.push(nextObj);
        }
        stack.push(nextObj); current = nextObj; lastKey = null; expectingValue = false; continue;
      }
      if (token === "}") {
        stack.pop(); current = stack[stack.length - 1] || root; lastKey = null; expectingValue = false; continue;
      }
      if (expectingValue) {
        if (lastKey !== null) {
          if (current[lastKey] !== undefined) {
            if (!Array.isArray(current[lastKey])) current[lastKey] = [current[lastKey]];
            current[lastKey].push(token);
          } else { current[lastKey] = token; }
        }
        lastKey = null; expectingValue = false;
      } else {
        lastKey = token;
        if (lastKey && text.charAt(tokenRegex.lastIndex) !== '=') {
          if (!current._list) current._list = [];
          current._list.push(lastKey); lastKey = null;
        }
      }
    }
    return root;
  }
}
