import { initSelectMenus } from '../shared/controls.mjs';
import { combineObjects } from '../shared/objects.mjs';
import { createGraphic } from './graphic.mjs';
import template from '../../html/histograms.html';
import { createAppState, setState, getState } from './state.mjs';


function initHistograms(container) {
  createAppState(container);
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  const initialSelectValues = initSelectMenus(controlsContainer, setState);

  const noAdjust = controlsContainer.select('input[type=checkbox]')
    .on('change', function(evt) { setState({ 'noAdjust': evt.target.checked }); });

  const updateGraphic = createGraphic(container);

  container
    .on('variantdatachange', updateGraphic)
    .on('noadjustchange', function() {
      container.classed('no-adjust', getState('noAdjust'));
    });

  const initialState = combineObjects(
    initialSelectValues,
    { noAdjust: noAdjust.node().checked }
  );

  setState(initialState);
}


export { initHistograms };
