import { initAreaSelect } from '../shared/controls.mjs';
import { createGraphic } from './graphic.mjs';
import template from './html/line-charts.html';
import { createAppState, setState } from './state.mjs';

const pods = ['aae', 'apc', 'opc'];


function initLineCharts(container) {
  createAppState(container);
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  const areaCallback = evt => setState({ 'area': evt.target.value });
  const areaSelect = initAreaSelect(controlsContainer, areaCallback);

  const podSelect = controlsContainer.select('.pod-select')
    .on('change', evt => setState({ 'pod': evt.target.value }));

  podSelect.selectAll('option')  
    .data(pods)
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => d);

  const smoothCheck = controlsContainer.select('input[type=checkbox]')
    .on('change', function(evt) { setState({ 'smooth': evt.target.checked }); });

  const updateGraphic = createGraphic(container);

  container
    .on('poddatachange', updateGraphic)
    .on('smoothchange', updateGraphic);

  const initialState = {
    area: areaSelect.node().value,
    pod: podSelect.node().value,
    smooth: smoothCheck.node().checked
  };

  setState(initialState);
}


export { initLineCharts };
