// @ts-nocheck
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
        if (cleanToken !== "" && !cleanToken.includes('%')) textTokens.push(cleanToken);
      });
      if (textTokens.length > 0) return textTokens.join(" ");
    }
    return this.cleanString(mainKey);
  }

static getEmpireTag(name) {
  if (!name || name.startsWith("Unnamed")) return "???";
  const stopWords = ["of", "the", "and", "in", "on", "at", "for", "to", "a", "an"];
  const words = name.split(' ').map(w => w.trim()).filter(w => w.length > 0 && !stopWords.includes(w.toLowerCase()));
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
    return clean;
  }
}
