import { initSelectMenus } from '../shared/controls.mjs';
import { combineObjects } from '../shared/objects.mjs';
import { constants } from '../shared/constants.mjs';
import { getDataFileUrl } from '../shared/data-files.mjs';
import { createGraphic } from './graphic.mjs';
import template from '../../html/histograms.html';
import { createAppState, setState, getState, getData } from './state.mjs';


function initHistograms(container) {
  createAppState(container);
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  const initialSelectValues = initSelectMenus(controlsContainer, setState);

  const noAdjust = controlsContainer.select('input[type=checkbox]')
    .on('change', function(evt) { setState({ 'noAdjust': evt.target.checked }); });

  const linkContainer = container.select('.links');

  const updateGraphic = createGraphic(container);

  const areaDataChange = function() {
    const name = getData('name').toLowerCase().replace(/\s/g, '-');
    const area = getState('area');

    linkContainer.select('.download-link')
      .attr('href', getDataFileUrl(getData('file')))
      .attr('download', `histograms-${area}-${name}${constants.dataFileSuffix}`);

    /* populate histograms title and area name in sub-title */
    const titleArea = getData('name'); // get area name
    const titlesContainer = container.select('.histograms-titles-container');
    let hText, sAreaText;
    hText = `Explore the model results`;
    sAreaText = `${titleArea}`;
    /* select h3 in container */
    titlesContainer.select('h3').text(hText);
    /* use span tag to bold area name, select by id */
    let span = document.getElementById('s-area');
    span.textContent = sAreaText;

  };

  /* fn to track horizon (end_year) and apply to sub-title */
  const horizonDataChange = function() {
    const titleHorizon = getState('horizon'); // get horizon
    let sHorizonText;
    sHorizonText = `${titleHorizon}`;
    let span = document.getElementById('s-horizon');
    span.textContent = sHorizonText;
  };

  container
    .on('areadatachange', areaDataChange)
    .on('variantdatachange', updateGraphic)
    .on('horizondatachange', horizonDataChange) // call horizonDataChange on change
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
