import { STELLARIS_UI } from './core/Theme.js';
import { SciFiButton } from './components/Button.js';
import { StorageManager } from './core/StorageManager.js';

import { ScreenEmpires } from './screens/ScreenEmpires.js';
import { ScreenSystems } from './screens/ScreenSystems.js';
import { ScreenMap } from './screens/ScreenMap.js';

class StellarisSPA {
  constructor() {
    this.currentScreen = 1; 
    this.selectedEmpireIds = new Set(); this.selectedSystemIds = new Set(); 
    this.targetScrollSystemId = null; this.mapCameraStateCache = null; 
    this.saveData = { empires: [], systems: [] };

    this.sortEmpiresId = 'id'; this.sortEmpiresAsc = true;
    this.sortSystemsId = 'id'; this.sortSystemsAsc = true;

    this.storage = new StorageManager(
      (msg, isError) => this.updateStatusUi(msg, isError),
      (data, statusText) => this.handleDataRefresh(data, statusText)
    );

    // FIXED: Build DOM architecture completely BEFORE calling switchScreen matrix loops
    this.initStructure();
    this.renderTabs();
    this.switchScreen(1);
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
    this.pathStatus.innerText = '[ STATUS // OFFLINE ] DISCONNECTED. CONNECT STORAGE DISK TARGET CHANNEL SOURCE...';
    this.pathStatus.style.cssText = `color:${colors.low}; font-size:12px; font-weight:bold; letter-spacing:0.5px;`;
    this.loaderPanel.appendChild(this.pathStatus);

    this.hiddenFileInput = document.createElement('input');
    this.hiddenFileInput.type = 'file'; this.hiddenFileInput.accept = '.sav'; this.hiddenFileInput.style.display = 'none';
    this.hiddenFileInput.addEventListener('change', async (e) => { await this.storage.handleFileSelection(e.target.files); });

    this.hiddenDirInput = document.createElement('input');
    this.hiddenDirInput.type = 'file'; this.hiddenDirInput.style.display = 'none';
    this.hiddenDirInput.webkitdirectory = true; this.hiddenDirInput.directory = true;
    this.hiddenDirInput.addEventListener('change', async (e) => {
      if (this.storage.handleDirectorySelection(e.target.files)) {
        this.syncBtn.el.style.display = 'inline-block'; await this.storage.scanAndLoadLatestFromDir();
      }
    });

    this.root.appendChild(this.hiddenFileInput); this.root.appendChild(this.hiddenDirInput);

    const btnGroup = document.createElement('div');
    this.fileBtn = new SciFiButton('Select File').onClick(() => this.hiddenFileInput.click());
    this.dirBtn = new SciFiButton('Select Dir').onClick(() => this.hiddenDirInput.click());
    this.syncBtn = new SciFiButton('Synchronize').onClick(async () => { await this.storage.executeForcedSync(this.hiddenDirInput, this.hiddenFileInput); });
    this.syncBtn.el.style.display = 'none';

    btnGroup.appendChild(this.fileBtn.el); btnGroup.appendChild(this.dirBtn.el); btnGroup.appendChild(this.syncBtn.el);
    this.loaderPanel.appendChild(btnGroup); this.root.appendChild(this.loaderPanel);

    this.navBar = document.createElement('div'); this.navBar.style.cssText = 'display:flex; gap:8px;';
    this.root.appendChild(this.navBar);

    this.contentViewport = document.createElement('div');
    this.contentViewport.style.cssText = `flex:1; background:${colors.panelBg}; border:1px solid ${colors.border}; overflow:hidden; position:relative;`;
    this.root.appendChild(this.contentViewport);
  }

  renderTabs() {
    this.navBar.innerHTML = '';
    const tabs = [{ id: 1, label: '1. Empires Directory' }, { id: 2, label: '2. System Locator' }, { id: 3, label: '3. Galaxy Map View' }];
    tabs.forEach(t => {
      const btn = new SciFiButton(t.label, this.currentScreen === t.id ? 'primary' : 'muted');
      btn.onClick(() => this.switchScreen(t.id)); this.navBar.appendChild(btn.el);
    });
  }

  handleDataRefresh(data, statusText) {
    this.saveData = data; this.selectedEmpireIds.clear(); this.selectedSystemIds.clear(); this.mapCameraStateCache = null; 
    this.syncBtn.el.style.display = 'inline-block'; this.pathStatus.innerText = statusText;
    this.pathStatus.style.color = STELLARIS_UI.colors.borderAccent; this.switchScreen(this.currentScreen);
  }

  updateStatusUi(msg, isError = false) {
    this.pathStatus.innerText = msg; this.pathStatus.style.color = isError ? STELLARIS_UI.colors.low : STELLARIS_UI.colors.text;
  }

  switchScreen(screenId) {
    this.currentScreen = screenId; this.renderTabs(); this.contentViewport.innerHTML = '';
    
    this.contentViewport.style.height = '100%';
    this.contentViewport.style.width = '100%';

    if (screenId === 1) {
      new ScreenEmpires(
        this.contentViewport, this.saveData, this.selectedEmpireIds, () => {},
        this.sortEmpiresId, this.sortEmpiresAsc, (id, asc) => { this.sortEmpiresId = id; this.sortEmpiresAsc = asc; }
      ).render();
    }
    if (screenId === 2) {
      const screenTwoInstance = new ScreenSystems(
        this.contentViewport, this.saveData, this.selectedEmpireIds, this.selectedSystemIds, () => {},
        this.sortSystemsId, this.sortSystemsAsc, (id, asc) => { this.sortSystemsId = id; this.sortSystemsAsc = asc; }
      );
      screenTwoInstance.render();
      if (this.targetScrollSystemId !== null && screenTwoInstance.tableInstance) {
        setTimeout(() => { screenTwoInstance.tableInstance.scrollToRowId(this.targetScrollSystemId); this.targetScrollSystemId = null; }, 60);
      }
    }
    if (screenId === 3) {
      new ScreenMap(this.contentViewport, this.saveData, this.selectedSystemIds, this.selectedEmpireIds, this.mapCameraStateCache, (clickedSys) => {
        this.targetScrollSystemId = String(clickedSys.id); this.switchScreen(2); 
      }, (savedState) => { this.mapCameraStateCache = savedState; }).render();
    }
  }
}
new StellarisSPA();
