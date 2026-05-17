import { StellarisSaveParser } from './Parser.js';

// Standalone service layer managing local file streaming and automated disk directory polls
export class StorageManager {
  constructor(onStatusUpdate, onDataLoaded) {
    this.onStatusUpdate = onStatusUpdate; // Callback to notify parent controller of message updates
    this.onDataLoaded = onDataLoaded;     // Callback delivering the final parsed datasets arrays
    this.activeFileHandle = null;
    this.cachedDirFilesList = null;
    this.activeDirName = "";
  }

  // Processes direct standalone manual file inputs updates
  async handleFileSelection(filesList) {
    if (!filesList || filesList.length === 0) return;
    this.activeFileHandle = filesList[0]; // Isolate specific singular file reference safely
    this.cachedDirFilesList = null;
    
    await this.loadSavePipeline(this.activeFileHandle, false);
  }

  // Maps relative path arrays parameters out of webkit directory system hooks
  handleDirectorySelection(filesList) {
    const files = Array.from(filesList);
    if (files.length === 0) return;
    
    this.activeDirName = files[0].webkitRelativePath.split('/')[0] || "LOCAL STORAGE";
    this.cachedDirFilesList = files;
    this.activeFileHandle = null;
    
    return this.activeDirName;
  }

  // Scan folder structures asynchronously and auto-extract the newest save instance modified
  async scanAndLoadLatestFromDir() {
    if (!this.cachedDirFilesList) return;
    
    let latestFile = null;
    let maxTime = 0;

    this.cachedDirFilesList.forEach(file => {
      if (file.name.endsWith('.sav') && file.lastModified > maxTime) {
        maxTime = file.lastModified;
        latestFile = file;
      }
    });

    if (latestFile) {
      await this.loadSavePipeline(latestFile, true);
    } else {
      this.onStatusUpdate("NO VALID .SAV BLUEPRINTS LOCATED IN PATH SECTOR.", true);
    }
  }

  // Shared inner orchestration bridge reading data streams asynchronously without timeouts
  async loadSavePipeline(file, isFromDirMode) {
    try {
      this.onStatusUpdate("DECOMPRESSING BI-SECTOR SYSTEM CHUNKS MATRIX...");
      
      const parsedData = await StellarisSaveParser.parseFile(file);
      
      const prefix = isFromDirMode ? `DIR: ${this.activeDirName.toUpperCase()} // LATEST:` : 'FILE:';
      const statusText = `[ STATUS // ONLINE ] LINKED TO => ${prefix} [ ${file.name.toUpperCase()} ]`;
      
      // Bubble structured database properties back to main application controllers loops
      this.onDataLoaded(parsedData, statusText);
    } catch (err) {
      this.onStatusUpdate(`[ PROCESSING COLLAPSE ] ${err.message.toUpperCase()}`, true);
    }
  }

  // Core execution switch handling the top panel synchronise button clicks loop context
  async executeForcedSync(triggerDirFileInputElement, triggerStandaloneFileInputElement) {
    if (this.activeFileHandle) {
      await this.loadSavePipeline(this.activeFileHandle, false);
    } else if (this.cachedDirFilesList) {
      triggerDirFileInputElement.click();
    } else {
      triggerStandaloneFileInputElement.click();
    }
  }
}
