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

  async handleFileSelection(filesList, inputElement = null) {
    if (!filesList || filesList.length === 0) return;
    
    // CORRECTED: Secure extraction of the primary file object out of the FileList container
    const targetFile = filesList[0]; 
    if (targetFile === undefined || targetFile === null) return;
    
    await this.loadSavePipeline(targetFile);
    
    // Clear the active DOM node tracking value cache to prevent browser heap pressure issues
    if (inputElement) {
      inputElement.value = "";
    }
  }

  async loadSavePipeline(file) {
    try {
      this.onStatusUpdate("READING AND UNPACKING CLAUDEWITZ DATA STRUCTURES...");
      
      const parsedData = await StellarisSaveParser.parseFile(file);
      const statusText = `[ STATUS // ONLINE ] ARCHIVE SOURCE LOCKED => [ ${file.name.toUpperCase()} ]`;
      
      this.onDataLoaded(parsedData, statusText);
    } catch (err) {
      this.onStatusUpdate(`[ ANALYSIS FAULT ] ${err.message.toUpperCase()}`, true);
    }
  }
}
