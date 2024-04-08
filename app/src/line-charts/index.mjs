import { initSelectMenus } from '../shared/controls.mjs';
import { combineObjects } from '../shared/objects.mjs';
import { createGraphic } from './graphic.mjs';
import template from '../../html/line-charts.html';
import { createAppState, setState } from './state.mjs';


function initLineCharts(container) {
  createAppState(container);
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  const initialSelectValues = initSelectMenus(controlsContainer, setState);

  const smoothCheck = controlsContainer.select('input[type=checkbox]')
    .on('change', function(evt) { setState({ 'smooth': evt.target.checked }); });

  const updateGraphic = createGraphic(container);

  container
    .on('poddatachange', updateGraphic)
    .on('smoothchange', updateGraphic);

  const initialState = combineObjects(
    initialSelectValues,
    { smooth: smoothCheck.node().checked }
  );

  setState(initialState);
}


export { initLineCharts };
