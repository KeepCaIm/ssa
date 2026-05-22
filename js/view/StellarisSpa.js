import { STELLARIS_UI } from './StellarisUiConstants.js';
import { SciFiButton } from './components/SciFiButton.js';
import { SciFiNavGroup } from './SciFiNavGroup.js';
import { StorageManager } from '../core/StorageManager.js';

import { EmpiresScreen } from './EmpiresScreen.js'; 
import { SystemsScreen } from './systems/SystemsScreen.js'; 
import { MapScreen } from './map/MapScreen.js';
import { FaqScreen } from './FaqScreen.js';

/**
 * StellarisSpa
 * Core interface shell manager coordinating workspace state collections,
 * binding telemetry events, and routing viewport template screens.
 */
export class StellarisSpa {
  constructor() {
    this.currentScreen = 4; 
    this.selectedEmpireIds = new Set(); 
    this.selectedSystemIds = new Set(); 
    this.targetScrollSystemId = null; 
    this.mapCameraStateCache = null; 
    this.saveData = { empires: [], systems: [] };

    // Initialized to the generic abstract tags used by UniversalSortEngine
    this.sortEmpiresId = 'numeric_metric'; 
    this.sortEmpiresAsc = true;
    this.sortSystemsId = 'numeric_metric'; 
    this.sortSystemsAsc = true;

    this.allEmpiresCheckedCache = false;
    this.allSystemsCheckedCache = false;
    this.activeScreenInstance = null; 

    this.storage = new StorageManager(
      (msg, isError) => this.updateStatusUi(msg, isError),
      (data, statusText) => this.handleDataRefresh(data, statusText)
    );

    this.initStructure();
    this.navGroupManager = new SciFiNavGroup(this.navBar, (id) => this.switchScreen(id));
    this.navGroupManager.updateTabs(this.currentScreen);
    this.switchScreen(4);
  }

  initStructure() {
    const colors = STELLARIS_UI.colors;
    document.body.style.cssText = `margin:0; padding:0; background:${colors.bg}; color:${colors.text}; font-family:${STELLARIS_UI.font}; overflow:hidden;`;
    
    this.root = document.createElement('div');
    this.root.style.cssText = 'display:flex; flex-direction:column; width:100vw; height:100vh; padding:15px; box-sizing:border-box; gap:15px;';
    document.body.appendChild(this.root);

    this.loaderPanel = document.createElement('div');
    this.loaderPanel.style.cssText = `display:flex; align-items:center; justify-content:space-between; padding:12px; background:${colors.panelBg}; border:1px solid ${colors.border};`;
    
    this.pathStatus = document.createElement('span');
    this.pathStatus.innerText = '[ STATUS // OFFLINE ] DISCONNECTED. TARGET SYSTEM ARCHIVE OFFLINE...';
    this.pathStatus.style.cssText = `color:${colors.low}; font-size:12px; font-weight:bold; letter-spacing:0.5px;`;
    this.loaderPanel.appendChild(this.pathStatus);

    this.hiddenFileInput = document.createElement('input');
    this.hiddenFileInput.type = 'file'; 
    this.hiddenFileInput.accept = '.sav'; 
    this.hiddenFileInput.style.display = 'none';
    this.hiddenFileInput.addEventListener('change', async (e) => { 
      if (e.target.files && e.target.files.length > 0) {
        await this.storage.handleFileSelection(e.target.files, e.target); 
      }
    });

    this.root.appendChild(this.hiddenFileInput); 

    const btnGroup = document.createElement('div');
    this.fileBtn = new SciFiButton('Load Save File').onClick(() => this.hiddenFileInput.click());

    btnGroup.appendChild(this.fileBtn.el); 
    this.loaderPanel.appendChild(btnGroup); 
    this.root.appendChild(this.loaderPanel);

    this.navBar = document.createElement('div'); 
    this.navBar.style.cssText = 'display:flex; gap:8px;';
    this.root.appendChild(this.navBar);

    this.contentViewport = document.createElement('div');
    this.contentViewport.style.cssText = `flex:1; background:${colors.panelBg}; border:1px solid ${colors.border}; overflow:hidden; position:relative;`;
    this.root.appendChild(this.contentViewport);

    this.sortEmpiresId = 'id'; 
    this.sortEmpiresAsc = true;
    this.sortSystemsId = 'id'; 
    this.sortSystemsAsc = true;
  }

  handleDataRefresh(data, statusText) {
    this.saveData = data; 
    this.selectedEmpireIds.clear(); 
    this.selectedSystemIds.clear(); 
    this.mapCameraStateCache = null; 
    this.allEmpiresCheckedCache = false;
    this.allSystemsCheckedCache = false;
    this.pathStatus.innerText = statusText;
    this.pathStatus.style.color = STELLARIS_UI.colors.borderAccent; 
    this.switchScreen(1);
  }

  updateStatusUi(msg, isError = false) {
    this.pathStatus.innerText = msg; 
    this.pathStatus.style.color = isError ? STELLARIS_UI.colors.low : STELLARIS_UI.colors.text;
  }

  switchScreen(screenId) {
    this.currentScreen = screenId; 
    this.navGroupManager.updateTabs(screenId); 
    
    if (this.activeScreenInstance && typeof this.activeScreenInstance.destroy === 'function') {
      this.activeScreenInstance.destroy();
    }

    this.contentViewport.innerHTML = '';
    this.contentViewport.style.height = '100%';
    this.contentViewport.style.width = '100%';

    if (screenId === 1) {
      this.activeScreenInstance = new EmpiresScreen(
        this.contentViewport, this.saveData, this.selectedEmpireIds, () => {},
        this.sortEmpiresId, this.sortEmpiresAsc, (id, asc) => { this.sortEmpiresId = id; this.sortEmpiresAsc = asc; }
      );
      this.activeScreenInstance.render();
      
      if (this.activeScreenInstance.tableInstance !== null) {
        this.activeScreenInstance.tableInstance.onBatchCheckChange = (ids, checked) => {
          ids.forEach(id => checked ? this.selectedEmpireIds.add(id) : this.selectedEmpireIds.delete(id));
        };
        const masterInput = this.activeScreenInstance.tableInstance.el.querySelector('thead input[type="checkbox"]');
        if (masterInput !== null) {
          masterInput.checked = this.allEmpiresCheckedCache;
          masterInput.addEventListener('change', (e) => { this.allEmpiresCheckedCache = e.target.checked; });
        }
      }
    }
    if (screenId === 2) {
      this.activeScreenInstance = new SystemsScreen(
        this.contentViewport, this.saveData, this.selectedEmpireIds, this.selectedSystemIds, () => {},
        this.sortSystemsId, this.sortSystemsAsc, (id, asc) => { this.sortSystemsId = id; this.sortSystemsAsc = asc; }
      );
      this.activeScreenInstance.render();
      
      if (this.activeScreenInstance.tableInstance !== null) {
        this.activeScreenInstance.tableInstance.onBatchCheckChange = (ids, checked) => {
          ids.forEach(id => checked ? this.selectedSystemIds.add(id) : this.selectedSystemIds.delete(id));
        };
        const masterInput = this.activeScreenInstance.tableInstance.el.querySelector('thead input[type="checkbox"]');
        if (masterInput !== null) {
          masterInput.checked = this.allSystemsCheckedCache;
          masterInput.addEventListener('change', (e) => { this.allSystemsCheckedCache = e.target.checked; });
        }
      }

      if (this.targetScrollSystemId !== null && this.activeScreenInstance.tableInstance) {
        setTimeout(() => { 
          this.activeScreenInstance.tableInstance.scrollToRowId(this.targetScrollSystemId); 
          this.targetScrollSystemId = null; 
        }, 60);
      }
    }
    if (screenId === 3) {
      this.activeScreenInstance = new MapScreen(
        this.contentViewport, this.saveData, this.selectedSystemIds, this.selectedEmpireIds, this.mapCameraStateCache, 
        (clickedSys) => {
          this.targetScrollSystemId = String(clickedSys.id); 
          this.switchScreen(2); 
        }, 
        (savedState) => { this.mapCameraStateCache = savedState; }
      );
      this.activeScreenInstance.render();
    }
    if (screenId === 4) {
      this.activeScreenInstance = new FaqScreen(this.contentViewport);
      this.activeScreenInstance.render();
    }
  }
}
