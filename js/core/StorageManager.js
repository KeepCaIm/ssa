import { StellarisSaveParser } from './Parser.js';

/**
 * StorageManager
 * Standalone orchestration service managing secure hardware-accelerated save text streams.
 */
export class StorageManager {
  constructor(onStatusUpdate, onDataLoaded) {
    this.onStatusUpdate = onStatusUpdate; 
    this.onDataLoaded = onDataLoaded;     
  }

  async handleFileSelection(filesList) {
    if (!filesList || filesList.length === 0) return;
    
    const targetFile = filesList[0]; 
    if (targetFile === undefined || targetFile === null) return;
    
    await this.loadSavePipeline(targetFile);
  }

  async loadSavePipeline(file) {
    try {
      // FIXED: Actualized terminal user text from binary jargon to readable save actions
      this.onStatusUpdate("READING AND UNPACKING CLAUDEWITZ DATA STRUCTURES...");
      
      const parsedData = await StellarisSaveParser.parseFile(file);
      const statusText = `[ STATUS // ONLINE ] ARCHIVE SOURCE LOCKED => [ ${file.name.toUpperCase()} ]`;
      
      this.onDataLoaded(parsedData, statusText);
    } catch (err) {
      this.onStatusUpdate(`[ ANALYSIS FAULT ] ${err.message.toUpperCase()}`, true);
    }
  }
}
