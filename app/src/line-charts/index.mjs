import { initSelectMenus } from '../shared/controls.mjs';
import { combineObjects } from '../shared/objects.mjs';
import { getDataFileUrl } from '../shared/data-files.mjs';
import { constants } from '../shared/constants.mjs';
import { createGraphic } from './graphic.mjs';
import template from '../../html/line-charts.html';
import { createAppState, getState, setState, getData } from './state.mjs';


function initLineCharts(container) {
  createAppState(container);
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  const initialSelectValues = initSelectMenus(controlsContainer, setState);

  const smoothCheck = controlsContainer.select('input[type=checkbox]')
    .on('change', function(evt) { setState({ 'smooth': evt.target.checked }); });

  const linkContainer = container.select('.links');

  const updateGraphic = createGraphic(container);

  const areaDataChange = function() {
    const name = getData('name').toLowerCase().replace(/\s/g, '-');
    const area = getState('area');

    linkContainer.select('.download-link')
      .attr('href', getDataFileUrl(getData('file')))
      .attr('download', `line-charts-${area}-${name}${constants.dataFileSuffix}`);
  };
  
  container
    .on('areadatachange', areaDataChange)
    .on('poddatachange', updateGraphic)
    .on('smoothchange', updateGraphic);

  const initialState = combineObjects(
    initialSelectValues,
    { smooth: smoothCheck.node().checked }
  );

  setState(initialState);
}


export { initLineCharts };
