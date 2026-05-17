import { GalaxyMap } from '../components/Map.js';
import { STELLARIS_UI } from '../core/Theme.js';

export class ScreenMap {
  constructor(viewport, saveData, activeSystemIdsSet, activeEmpireIdsSet, initialCameraState, onSystemNodeMapClick, onCameraStateMutation) {
    this.viewport = viewport;
    this.saveData = saveData;
    this.activeSystemIdsSet = activeSystemIdsSet; 
    this.activeEmpireIdsSet = activeEmpireIdsSet; 
    this.initialCameraState = initialCameraState; 
    this.onSystemNodeMapClick = onSystemNodeMapClick;
    this.onCameraStateMutation = onCameraStateMutation; 
    this.activeTransitFilter = 'none'; // 'none', 'wormhole', 'gate', 'lgate', 'shroud'
  }

  render() {
    this.viewport.innerHTML = '';

    // Main layout container holding both the top control bar and the canvas map viewport
    const container = document.createElement('div');
    container.style.cssText = STELLARIS_UI.styles.fullFrame + 'display:flex; flex-direction:column; position:relative;';

    // Top control panel for the Radio Group selection matrix
    const controlPanel = document.createElement('div');
    controlPanel.style.cssText = `padding:10px; background:${STELLARIS_UI.colors.panelBgLight}; border-bottom:1px solid ${STELLARIS_UI.colors.border}; display:flex; gap:15px; align-items:center; z-index:5; font-family:${STELLARIS_UI.font}; font-size:11px; font-weight:bold; color:${STELLARIS_UI.colors.textHeader}; letter-spacing:1px;`;
    
    controlPanel.innerText = "TACTICAL TRANSIT OVERLAY:";

    const options = [
      { id: 'none', label: 'STANDARD MAP' },
      { id: 'wormhole', label: '🌀 WORMHOLES' },
      { id: 'gate', label: '🚪 GATEWAYS' },
      { id: 'lgate', label: '🔒 L-GATES' },
      { id: 'shroud', label: '👁️ SHROUD TUNNELS' }
    ];

    options.forEach(opt => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex; align-items:center; gap:5px; cursor:pointer; color:#fff;';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'transitFilter';
      radio.value = opt.id;
      radio.checked = this.activeTransitFilter === opt.id;
      radio.style.cursor = 'pointer';

      radio.addEventListener('change', (e) => {
        this.activeTransitFilter = e.target.value;
        // Re-compile viewport graphics nodes maps dynamically on state change
        map.activeTransitFilter = this.activeTransitFilter;
        map.render();
      });

      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt.label));
      controlPanel.appendChild(label);
    });

    container.appendChild(controlPanel);

    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.cssText = 'flex:1; width:100%; height:100%; position:relative; overflow:hidden;';
    container.appendChild(canvasWrapper);

    const map = new GalaxyMap((clickedSys) => {
      this.onSystemNodeMapClick(clickedSys); 
    }, (updatedState) => {
      this.onCameraStateMutation(updatedState);
    });

    map.activeTransitFilter = this.activeTransitFilter; // Inject initial filter state reference
    canvasWrapper.appendChild(map.el);
    this.viewport.appendChild(container);
    
    const completeSystemsList = this.saveData.systems || [];

    map.setViewport(
      completeSystemsList, 
      this.activeSystemIdsSet, 
      this.saveData.empires || [],
      this.initialCameraState,
      this.activeEmpireIdsSet 
    );
  }
}
