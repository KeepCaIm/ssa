// js/core/StorageManager.js
import { StellarisSaveParser } from './StellarisSaveParser.js';

/**
 * StorageManager
 * Standalone orchestration service managing secure hardware-accelerated save text streams.
 */
export class StorageManager {
  constructor(onStatusUpdate, onDataLoaded) {
    this.onStatusUpdate = onStatusUpdate; 
    this.onDataLoaded = onDataLoaded;     
  }

  /**
   * Safe extraction of the primary file object out of the FileList container.
   * @param {FileList} filesList - Input DOM file tracker list reference.
   * @param {HTMLInputElement|null} inputElement - Form item node reference to clear after usage.
   */
  async handleFileSelection(filesList, inputElement = null) {
    if (!filesList || filesList.length === 0) return;
    
    const targetFile = filesList[0]; 
    if (targetFile === undefined || targetFile === null) return;
    
    await this.loadSavePipeline(targetFile);
    
    if (inputElement) {
      inputElement.value = "";
    }
  }

  /**
   * Spawns worker streams decompresses data loops, and pipes values into target mapping models.
   * @param {File} file - Target .sav text archive to load.
   */
  async loadSavePipeline(file) {
    try {
      this.onStatusUpdate("READING AND UNPACKING CLAUSEWITZ DATA STRUCTURES...");
      
      const parsedData = await StellarisSaveParser.parseFile(file);
      const statusText = `[ STATUS // ONLINE ] ARCHIVE SOURCE LOCKED => [ ${file.name.toUpperCase()} ]`;
      
      this.onDataLoaded(parsedData, statusText);
    } catch (err) {
      this.onStatusUpdate(`[ ANALYSIS FAULT ] ${err.message.toUpperCase()}`, true);
    }
  }
}
