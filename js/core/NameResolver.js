/**
 * ParadoxNameResolver
 * Strips Paradox engine tracking codes, sanitizes structural variables array 
 * matrices, and automatically computes high-contrast 3-4 letter empire tags.
 */
export class ParadoxNameResolver {
  static resolve(nameNode) {
    if (!nameNode) return "Unnamed Entity";
    if (typeof nameNode !== 'object') return this.cleanString(String(nameNode));
    let mainKey = String(nameNode.key || "");
    
    if ((mainKey.includes('%') || mainKey === "") && nameNode.variables) {
      const textTokens = [];
      const rawVars = nameNode.variables._list || nameNode.variables;
      const variablesArray = Array.isArray(rawVars) ? rawVars : [rawVars];
      
      variablesArray.forEach(v => {
        if (!v || typeof v !== 'object') return;
        let extractedString = "";
        if (v.value !== undefined) {
          extractedString = typeof v.value === 'object' ? String(v.value.key || v.value.value || "") : String(v.value);
        } else if (v.key !== undefined) {
          extractedString = String(v.key);
        }
        const cleanToken = this.cleanString(extractedString);
        const isValidToken = cleanToken !== "" && !cleanToken.includes('%');
        if (isValidToken) {
          textTokens.push(cleanToken);
        }
      });
      
      const hasTokens = textTokens.length !== 0 && textTokens.length > 0;
      if (hasTokens) return textTokens.join(" ");
    }
    return this.cleanString(mainKey);
  }

  static getEmpireTag(name) {
    if (!name || name.startsWith("Unnamed")) return "???";
    const stopWords = ["of", "the", "and", "in", "on", "at", "for", "to", "a", "an"];
    const words = name.split(' ').map(w => w.trim()).filter(w => w.length !== 0 && w.length > 0 && !stopWords.includes(w.toLowerCase()));
    
    if (words.length === 0) return name.substring(0, 3).toUpperCase();
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    
    return words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
  }

  static cleanString(str) {
    if (!str) return "";
    let clean = str.replace(/"/g, '').trim();
    if (clean.startsWith("SPEC_")) clean = clean.replace("SPEC_", "");
    if (clean.startsWith("NAME_")) clean = clean.replace("NAME_", "");
    if (clean.startsWith("PREFIX_")) clean = clean.replace("PREFIX_", "");
    if (clean.includes("_")) clean = clean.split("_").join(" ");
    
    const lowerClean = clean.toLowerCase();
    if (lowerClean.startsWith("pc ")) {
      clean = clean.substring(3).trim();
    }
    
    if (clean.length === 0) return "";
    
    return clean
      .split(' ')
      .map(word => {
        if (word.length === 0) return "";
        const firstLetter = word.charAt(0).toUpperCase();
        
        // FIXED: Only slice remainder if the word actually contains extra letters
        const remainder = word.length > 1 ? word.slice(1) : "";
        return firstLetter + remainder;
      })
      .join(' ');
  }
}
